import "./lib/load-env.mjs";

/**
 * Synchronizes a public Steam library into the local Collection archive.
 *
 * Pipeline:  Steam API → normalize → import/merge → Collection database
 *
 * Steam is an acquisition source, not the archive. This job detects newly
 * owned games, refreshes playtime, and refreshes store metadata when stale —
 * writing ONLY the dedicated `steam` block. Editorial content is never touched.
 *
 * Designed to run unattended on a ~24h cadence.
 *
 * Run:
 *   npm run steam:sync
 *   npm run steam:sync:dry
 *   node scripts/sync-steam-library.mjs -- --limit 25
 *   node scripts/sync-steam-library.mjs -- --refresh-metadata
 *   node scripts/sync-steam-library.mjs -- --skip-images
 */

import {
  readEntry,
  writeEntry,
  writeJsonAtomic,
} from "./lib/collection-archive-fs.mjs";
import { loadSteamConfig } from "./lib/steam/steam-config.mjs";
import {
  fetchAppDetails,
  fetchOwnedGames,
  fetchPlayerSummary,
  resolveSteamId,
  throttle,
} from "./lib/steam/steam-api.mjs";
import {
  isMetadataStale,
  normalizeAppDetails,
  normalizeOwnership,
  steamRecordId,
} from "./lib/steam/steam-normalize.mjs";
import {
  STEAM_REPORT_DIR,
  ensureSteamDirs,
  loadOwnedIndex,
  saveOwnedIndex,
  writeSteamState,
} from "./lib/steam/steam-archive-fs.mjs";
import { preserveSteamArtwork } from "./lib/steam/steam-images.mjs";
import {
  assertEditorialUntouched,
  mergeSteamRecord,
  withPreservedArtwork,
} from "./lib/steam/steam-import.mjs";
import { refreshFiledLibrarySteam } from "./lib/steam/steam-library-refresh.mjs";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const skipImages = args.includes("--skip-images");
const forceMetadata = args.includes("--refresh-metadata");
const forceImages = args.includes("--force-images");
const limitArg = args.find((arg) => arg.startsWith("--limit"));
const fetchLimit = limitArg
  ? Number(limitArg.split("=")[1] ?? args[args.indexOf("--limit") + 1])
  : null;

function log(message) {
  console.log(message);
}

async function main() {
  ensureSteamDirs();

  let config;
  try {
    config = loadSteamConfig();
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }

  log("Steam Library Sync");
  log("==================");
  if (dryRun) log("Mode: dry-run (no files will be written)");

  const now = new Date().toISOString();

  let steamId;
  let summary = null;
  try {
    steamId = await resolveSteamId(config);
    summary = await fetchPlayerSummary(config, steamId);
    log(`Account: ${summary?.personaName ?? "unknown"} (${steamId})`);
    if (summary && !summary.isPublic) {
      log("Warning: profile is not public — owned games may be inaccessible.");
    }
  } catch (err) {
    console.error(`Steam identity resolution failed: ${err.message}`);
    writeSteamState(
      { lastSyncStatus: "failed", lastError: err.message, dryRun },
      { dryRun },
    );
    process.exit(1);
  }

  let ownedGames;
  try {
    ownedGames = await fetchOwnedGames(config, steamId);
    log(`Fetched ${ownedGames.length} owned title(s) from Steam`);
  } catch (err) {
    console.error(`Steam owned-games fetch failed: ${err.message}`);
    writeSteamState(
      { lastSyncStatus: "failed", lastError: err.message, steamId, dryRun },
      { dryRun },
    );
    process.exit(1);
  }

  if (Number.isFinite(fetchLimit)) {
    ownedGames = ownedGames.slice(0, fetchLimit);
    log(`Limited to ${ownedGames.length} title(s) for this run`);
  }

  const ownedIndex = loadOwnedIndex();
  const report = {
    generatedAt: now,
    dryRun,
    created: [],
    updated: [],
    metadataRefreshed: [],
    imagesSaved: [],
    librarySteamUpdated: [],
    errors: [],
  };

  let detailsBudget = config.detailsPerRun;
  const seenAppIds = new Set();

  for (const game of ownedGames) {
    const appId = Number(game.appid);
    if (!Number.isFinite(appId)) continue;
    seenAppIds.add(appId);

    const id = steamRecordId(appId);
    const existing = readEntry(id);
    const existingSteam = existing?.steam ?? null;

    try {
      let steam = normalizeOwnership(game, config, now);

      // Carry forward previously fetched descriptive metadata.
      if (existingSteam) {
        steam = { ...existingSteam, ...steam };
      }

      const stale = forceMetadata || isMetadataStale(existingSteam, config);
      const wantDetails = (!existingSteam || stale) && detailsBudget > 0;

      if (wantDetails) {
        detailsBudget -= 1;
        const details = await fetchAppDetails(config, appId);
        await throttle(config);
        if (details) {
          const { remoteArtwork, ...descriptive } = normalizeAppDetails(
            details,
            appId,
            now,
          );
          steam = { ...steam, ...descriptive };
          report.metadataRefreshed.push(id);

          if (!skipImages) {
            const { artwork, results } = await preserveSteamArtwork({
              appId,
              remoteArtwork,
              dryRun,
              force: forceImages,
            });
            if (Object.keys(artwork).length > 0) steam.artwork = artwork;
            const saved = results.filter((r) => r.status === "saved").length;
            if (saved > 0) report.imagesSaved.push({ id, saved });
          }
        }
      }

      steam = withPreservedArtwork(steam, existingSteam);

      const { record, isNew } = mergeSteamRecord({ existing, steam, now });
      assertEditorialUntouched(existing, record);
      writeEntry(record, { dryRun });

      if (record.filing?.librarySlug) {
        const libraryRefresh = refreshFiledLibrarySteam(record, steam, {
          dryRun,
        });
        if (libraryRefresh.status === "updated") {
          report.librarySteamUpdated.push(libraryRefresh.slug);
        } else if (libraryRefresh.status === "missing") {
          report.errors.push({
            id,
            appId,
            message: libraryRefresh.reason,
          });
        }
      }

      ownedIndex.byAppId[appId] = {
        entryId: id,
        firstSeen: ownedIndex.byAppId[appId]?.firstSeen ?? now,
        lastSeen: now,
        metadataSyncedAt: steam.metadataSyncedAt ?? null,
      };

      if (isNew) report.created.push(id);
      else report.updated.push(id);
    } catch (err) {
      report.errors.push({ id, appId, message: err.message });
    }
  }

  // Ownership retention: mark index entries no longer present in the library.
  for (const [appId, entry] of Object.entries(ownedIndex.byAppId)) {
    if (!seenAppIds.has(Number(appId)) && !entry.retiredAt) {
      entry.retiredAt = now;
    } else if (seenAppIds.has(Number(appId)) && entry.retiredAt) {
      delete entry.retiredAt;
    }
  }

  saveOwnedIndex(ownedIndex, { dryRun });

  const status = report.errors.length > 0 ? "partial" : "ok";
  writeSteamState(
    {
      lastSyncedAt: now,
      lastSyncStatus: status,
      lastError:
        report.errors.length > 0
          ? report.errors.map((e) => e.message).join("; ")
          : undefined,
      steamId,
      personaName: summary?.personaName ?? null,
      ownedFetched: ownedGames.length,
      recordsCreated: report.created.length,
      recordsUpdated: report.updated.length,
      metadataRefreshed: report.metadataRefreshed.length,
      dryRun,
    },
    { dryRun },
  );

  const reportPath = `${STEAM_REPORT_DIR}/steam-sync-${now.slice(0, 10)}.json`;
  writeJsonAtomic(reportPath, report, { dryRun });

  log("");
  log(`Created:            ${report.created.length}`);
  log(`Updated:            ${report.updated.length}`);
  log(`Metadata refreshed: ${report.metadataRefreshed.length}`);
  log(`Artwork saved:      ${report.imagesSaved.length} title(s)`);
  log(`Library steam:      ${report.librarySteamUpdated.length}`);
  log(`Errors:             ${report.errors.length}`);
  log(`Status:             ${status}`);
  if (!dryRun) log(`Report:             ${reportPath.replace(/\\/g, "/")}`);

  if (status === "partial") process.exit(2);
}

main().catch((err) => {
  console.error(err);
  writeSteamState(
    { lastSyncStatus: "failed", lastError: err.message, dryRun },
    { dryRun },
  );
  process.exit(1);
});
