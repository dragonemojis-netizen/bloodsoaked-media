import {
  ARCHIVE_PATH,
  listEntryIds,
  readEntry,
  readJson,
  writeJsonAtomic,
} from "./collection-archive-fs.mjs";
import { isAuthenticRecord } from "./collection-archive-origin.mjs";

function isPublishedRecord(record) {
  return (
    isAuthenticRecord(record) &&
    record.visibility === "published" &&
    !record.tombstone &&
    (record.status === "Catalogued" || record.status === "Preservation")
  );
}

/**
 * Rebuilds archive.json from all published catalogued/preservation entries.
 * Newest catalogued first. Preserves featuredId when still valid.
 */
export function rebuildArchiveIndex({ dryRun = false, now = new Date().toISOString() } = {}) {
  const current = readJson(ARCHIVE_PATH, {
    schemaVersion: 1,
    featuredId: null,
    entryIds: [],
    updatedAt: null,
  });

  const published = listEntryIds()
    .map((id) => readEntry(id))
    .filter((record) => record && isPublishedRecord(record))
    .sort(
      (a, b) =>
        new Date(b.catalogued).getTime() - new Date(a.catalogued).getTime(),
    );

  const entryIds = published.map((record) => record.id);

  let featuredId = current.featuredId;
  if (!featuredId || !entryIds.includes(featuredId)) {
    featuredId = published.find((record) => record.featured)?.id ?? entryIds[0] ?? null;
  }

  const next = {
    schemaVersion: 1,
    featuredId,
    entryIds,
    updatedAt: now.slice(0, 10),
  };

  writeJsonAtomic(ARCHIVE_PATH, next, { dryRun });

  return {
    entryIds,
    featuredId,
    total: entryIds.length,
  };
}
