import "./lib/load-env.mjs";

/**
 * Synchronizes Instagram media into the local Collection archive.
 * Instagram is ingestion only — content/collection/ remains canonical.
 *
 * Run:
 *   node scripts/sync-collection-instagram.mjs
 *   node scripts/sync-collection-instagram.mjs -- --dry-run
 *   node scripts/sync-collection-instagram.mjs -- --force-images
 *   node scripts/sync-collection-instagram.mjs -- --limit 10
 */
import { rebuildArchiveIndex } from "./lib/collection-archive-index.mjs";
import {
  REPORT_DIR,
  SYNC_STATE_PATH,
  buildMediaIdIndexFromEntries,
  ensureDir,
  listEntryIds,
  loadMediaIndex,
  readEntry,
  readJson,
  saveMediaIndex,
  writeEntry,
  writeJsonAtomic,
} from "./lib/collection-archive-fs.mjs";
import { downloadArchiveImage } from "./lib/collection-image-download.mjs";
import {
  fetchAllInstagramMedia,
  loadInstagramConfig,
  resolveInstagramUserId,
  resolveMediaImageUrl,
  fetchInstagramIdentity,
} from "./lib/collection-instagram-api.mjs";
import {
  archiveIdForMedia,
  deriveTitle,
  extractHashtags,
  inferEventType,
  inferStatus,
  parseTagsForEnrichment,
  toIsoDate,
  toIsoDateTime,
} from "./lib/collection-instagram-parse.mjs";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const forceImages = args.includes("--force-images");
const limitArg = args.find((arg) => arg.startsWith("--limit"));
const fetchLimit = limitArg ? Number(limitArg.split("=")[1] ?? args[args.indexOf("--limit") + 1]) : null;

const report = {
  generatedAt: new Date().toISOString(),
  dryRun,
  forceImages,
  created: [],
  updated: [],
  skipped: [],
  images: [],
  tombstoned: [],
  errors: [],
};

function log(message) {
  console.log(message);
}

function mergeInstagramRecord({ existing, media, config, now, clearTombstone = false }) {
  const caption = media.caption ?? "";
  const hashtags = extractHashtags(caption);
  const eventType = existing?.eventType ?? inferEventType(hashtags);
  const status = existing?.status ?? inferStatus(hashtags, eventType);
  const entryId = archiveIdForMedia(media.id, existing?.id);

  const source = {
    platform: "instagram",
    mediaId: media.id,
    permalink: media.permalink ?? existing?.source?.permalink,
    postedAt: toIsoDateTime(media.timestamp ?? existing?.source?.postedAt),
    mediaType: media.media_type ?? existing?.source?.mediaType,
    lastSyncedAt: now,
  };

  if (!existing?.source?.captionSnapshot && caption) {
    source.captionSnapshot = caption;
    source.captionSnapshotAt = now;
  } else if (existing?.source?.captionSnapshot) {
    source.captionSnapshot = existing.source.captionSnapshot;
    source.captionSnapshotAt = existing.source.captionSnapshotAt;
  }

  if (existing?.source?.imageSnapshot) {
    source.imageSnapshot = existing.source.imageSnapshot;
  }

  if (existing?.source?.provenanceNote) {
    source.provenanceNote = existing.source.provenanceNote;
  }

  const record = {
    id: entryId,
    origin: "instagram",
    title: existing?.title ?? deriveTitle(caption),
    eventType: existing?.eventType ?? eventType,
    status: existing?.status ?? status,
    catalogued: existing?.catalogued ?? toIsoDate(media.timestamp),
    visibility: existing?.visibility ?? "published",
    notes: existing?.notes,
    coverImage: existing?.coverImage,
    featured: existing?.featured,
    enrichment: existing?.enrichment ?? {
      tags: parseTagsForEnrichment(hashtags),
    },
    source,
  };

  if (!clearTombstone && existing?.tombstone) {
    record.tombstone = existing.tombstone;
  }

  if (existing?.enrichment && !record.enrichment?.tags?.length) {
    record.enrichment = existing.enrichment;
  }

  return record;
}

async function main() {
  ensureDir(REPORT_DIR);

  let config;
  try {
    config = loadInstagramConfig();
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }

  log("Collection Instagram Sync");
  log("=========================");
  if (dryRun) log("Mode: dry-run (no files will be written)");
  if (forceImages) log("Images: force re-download enabled");

  let identity;
  let userId;
  try {
    identity = await fetchInstagramIdentity(config);
    userId = config.userId || identity.userId;
    log(`Account: @${identity.username ?? "unknown"} (${identity.accountType ?? "unknown"})`);
    log(`User ID: ${userId}`);
  } catch (err) {
    console.error(`Instagram authentication failed: ${err.message}`);
    writeSyncState({
      lastSyncStatus: "failed",
      lastError: err.message,
      dryRun,
    });
    process.exit(1);
  }

  let mediaItems = [];
  try {
    mediaItems = await fetchAllInstagramMedia(config, userId, {
      limit: Number.isFinite(fetchLimit) ? fetchLimit : null,
    });
    log(`Fetched ${mediaItems.length} media object(s) from Instagram`);
  } catch (err) {
    console.error(`Instagram media fetch failed: ${err.message}`);
    writeSyncState({
      lastSyncStatus: "failed",
      lastError: err.message,
      instagramUserId: userId,
      instagramUsername: identity.username,
      dryRun,
    });
    process.exit(1);
  }

  const mediaIndex = loadMediaIndex();
  const indexedByMediaId = {
    ...buildMediaIdIndexFromEntries(),
    ...mediaIndex.byMediaId,
  };

  log(`Ingesting all ${mediaItems.length} post(s) from Instagram acquisition journal`);

  const seenMediaIds = new Set(mediaItems.map((media) => media.id));
  const now = new Date().toISOString();
  let imagesDownloaded = 0;
  let imageFailures = 0;

  for (const media of mediaItems) {
    const existingId = indexedByMediaId[media.id] ?? null;
    const existing = existingId ? readEntry(existingId) : null;
    const record = mergeInstagramRecord({
      existing,
      media,
      config,
      now,
      clearTombstone: true,
    });

    try {
      const imageUrl = resolveMediaImageUrl(media);
      const imageResult = await downloadArchiveImage({
        entryId: record.id,
        imageUrl,
        sourceMediaId: media.id,
        dryRun,
        force: forceImages,
      });

      report.images.push({ id: record.id, mediaId: media.id, ...imageResult });

      if (imageResult.status === "saved") imagesDownloaded += 1;
      if (imageResult.status === "failed") imageFailures += 1;

      if (imageResult.imageSnapshot && !record.source.imageSnapshot) {
        record.source.imageSnapshot = imageResult.imageSnapshot;
      }
      if (imageResult.coverImage) {
        record.coverImage = imageResult.coverImage;
      }
    } catch (err) {
      imageFailures += 1;
      report.errors.push({
        id: record.id,
        mediaId: media.id,
        stage: "image",
        message: err.message,
      });
    }

    const isNew = !existing;
    writeEntry(record, { dryRun });

    indexedByMediaId[media.id] = record.id;
    if (isNew) report.created.push(record.id);
    else report.updated.push(record.id);
  }

  for (const entryId of listEntryIds()) {
    const record = readEntry(entryId);
    if (record?.source?.platform !== "instagram" || !record.source.mediaId) continue;
    if (seenMediaIds.has(record.source.mediaId)) continue;
    if (record.tombstone?.removedFromInstagramAt) continue;

    const tombstoned = {
      ...record,
      source: {
        ...record.source,
        lastSyncedAt: now,
      },
      tombstone: {
        removedFromInstagramAt: now,
        reason: "post_missing_from_instagram_feed",
      },
    };

    writeEntry(tombstoned, { dryRun });
    report.tombstoned.push(entryId);
  }

  saveMediaIndex(
    {
      version: 1,
      byMediaId: indexedByMediaId,
      updatedAt: now,
    },
    { dryRun },
  );

  const indexResult = rebuildArchiveIndex({ dryRun, now });
  log(
    `Archive index: ${indexResult.total} published record(s) on Collection page`,
  );

  const syncStatus =
    report.errors.length > 0 || imageFailures > 0
      ? mediaItems.length > 0
        ? "partial"
        : "failed"
      : "ok";

  writeSyncState({
    lastSyncedAt: now,
    lastSyncStatus: syncStatus,
    lastError:
      report.errors.length > 0
        ? report.errors.map((e) => e.message).join("; ")
        : undefined,
    instagramUserId: userId,
    instagramUsername: identity.username,
    apiVersion: config.apiVersion,
    ingestAll: true,
    mediaFetched: mediaItems.length,
    mediaIngested: mediaItems.length,
    recordsCreated: report.created.length,
    recordsUpdated: report.updated.length,
    imagesDownloaded,
    imageFailures,
    tombstonesSet: report.tombstoned.length,
    archiveDisplayCount: indexResult.total,
    dryRun,
  });

  const reportPath = `${REPORT_DIR}/sync-${now.slice(0, 10)}.json`;
  writeJsonAtomic(reportPath, report, { dryRun });

  log("");
  log(`Created:      ${report.created.length}`);
  log(`Updated:      ${report.updated.length}`);
  log(`Images saved: ${imagesDownloaded}`);
  log(`Image errors: ${imageFailures}`);
  log(`Tombstoned:   ${report.tombstoned.length}`);
  log(`Status:       ${syncStatus}`);
  if (!dryRun) log(`Report:       ${reportPath.replace(/\\/g, "/")}`);

  if (syncStatus === "failed") process.exit(1);
  if (syncStatus === "partial") process.exit(2);
}

function writeSyncState(patch) {
  const current = readJson(SYNC_STATE_PATH, {
    schemaVersion: 1,
    lastSyncedAt: null,
    lastSyncStatus: "idle",
  });

  writeJsonAtomic(
    SYNC_STATE_PATH,
    {
      ...current,
      schemaVersion: 1,
      ...patch,
    },
    { dryRun },
  );
}

main().catch((err) => {
  console.error(err);
  writeSyncState({
    lastSyncStatus: "failed",
    lastError: err.message,
    dryRun,
  });
  process.exit(1);
});
