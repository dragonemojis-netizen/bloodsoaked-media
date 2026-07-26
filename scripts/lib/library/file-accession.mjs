/**
 * Archive Filing service.
 *
 * Promotes a Collection Pipeline record into a full Library accession.
 *
 * Filing is a transformation of an existing accession:
 *   • allocates the next LIB-NNNN shelf mark
 *   • writes one Library entry using the existing Archive Entry template
 *   • preserves the Steam block permanently on the Library record
 *   • initializes empty editorial sections (never invents curator prose)
 *   • marks the Collection record Filed with a filing pointer
 *   • never duplicates — refuses if already filed or Library already linked
 *
 * Steam imports remain Collection Pipeline until this service is invoked.
 */

import {
  listEntryIds,
  readEntry,
  writeEntry,
} from "../collection-archive-fs.mjs";
import {
  findLibraryByCollectionId,
  findLibraryBySteamAppId,
  listLibrarySlugs,
  readLibraryEntry,
  writeLibraryEntry,
} from "./library-archive-fs.mjs";
import {
  allocateFilingIdentity,
  draftLibraryRecordFromCollection,
} from "./filing-normalize.mjs";

const FILEABLE_STATUSES = new Set(["Pipeline"]);

function deepClone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

/**
 * Validates that a Collection record may be filed. Throws on refusal.
 */
export function assertFileable(collection) {
  if (!collection) {
    throw new Error("Collection record not found");
  }
  if (collection.origin === "development") {
    throw new Error(
      `${collection.id}: development seeds cannot be filed into the Library`,
    );
  }
  if (collection.status === "Filed" || collection.filing?.librarySlug) {
    const slug = collection.filing?.librarySlug ?? "unknown";
    throw new Error(
      `${collection.id}: already filed as Library accession "${slug}"`,
    );
  }
  if (!FILEABLE_STATUSES.has(collection.status)) {
    throw new Error(
      `${collection.id}: status is "${collection.status}" — only Pipeline records can be filed`,
    );
  }
}

/**
 * Guards against creating a second Library filing for the same accession.
 */
export function assertNotDuplicate(collection) {
  const byCollection = findLibraryByCollectionId(collection.id);
  if (byCollection) {
    throw new Error(
      `${collection.id}: Library entry "${byCollection.slug}" already references this Collection id`,
    );
  }
  if (collection.steam?.appId != null) {
    const bySteam = findLibraryBySteamAppId(collection.steam.appId);
    if (bySteam) {
      throw new Error(
        `${collection.id}: Library entry "${bySteam.slug}" already carries Steam app ${collection.steam.appId}`,
      );
    }
  }
}

/**
 * Applies the Filed transformation onto the Collection record.
 * Preserves steam + editorial fields; only status/filing change.
 */
export function markCollectionFiled(collection, { librarySlug, shelfMark, now }) {
  return {
    ...collection,
    status: "Filed",
    filing: {
      librarySlug,
      shelfMark,
      filedAt: now,
    },
  };
}

/**
 * Files a Collection Pipeline accession into the Library.
 *
 * @returns {{ library, collection, created: true }}
 */
export function fileCollectionAccession({
  collectionId,
  slugOverride = null,
  dryRun = false,
  now = new Date().toISOString(),
} = {}) {
  if (!collectionId) {
    throw new Error("collectionId is required");
  }

  const collection = readEntry(collectionId);
  assertFileable(collection);
  assertNotDuplicate(collection);

  const existingLibraryRecords = listLibrarySlugs()
    .map((slug) => readLibraryEntry(slug))
    .filter(Boolean);

  const { slug, shelfMark } = allocateFilingIdentity({
    collection,
    existingLibraryRecords,
    slugOverride,
  });

  if (existingLibraryRecords.some((r) => r.slug === slug)) {
    throw new Error(`Library slug "${slug}" already exists`);
  }

  const library = draftLibraryRecordFromCollection({
    collection,
    shelfMark,
    slug,
    now,
  });

  const filedCollection = markCollectionFiled(collection, {
    librarySlug: slug,
    shelfMark,
    now,
  });

  // Safety: Steam block must survive on both sides of the transformation.
  if (collection.steam) {
    library.steam = deepClone(collection.steam);
  }

  writeLibraryEntry(library, { dryRun });
  writeEntry(filedCollection, { dryRun });

  return {
    library,
    collection: filedCollection,
    created: true,
    dryRun,
  };
}

/**
 * Lists Pipeline Collection records eligible for filing.
 */
export function listFileableCollectionIds() {
  return listEntryIds().filter((id) => {
    const record = readEntry(id);
    if (!record) return false;
    try {
      assertFileable(record);
      return true;
    } catch {
      return false;
    }
  });
}
