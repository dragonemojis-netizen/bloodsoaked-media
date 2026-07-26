/**
 * Keeps the Library steam block current after a Collection Steam sync.
 *
 * When a Pipeline record has been filed, Steam sync continues to own the
 * Collection steam block and mirrors it onto the Library accession —
 * never touching Library editorial fields.
 */

import {
  readLibraryEntry,
  writeLibraryEntry,
} from "../library/library-archive-fs.mjs";

const LIBRARY_EDITORIAL_FIELDS = Object.freeze([
  "slug",
  "title",
  "mediaType",
  "status",
  "visibility",
  "year",
  "synopsis",
  "coverImage",
  "filedAt",
  "curatorialRevisionAt",
  "shelfMark",
  "accession",
  "catalog",
  "custody",
  "curatorNotes",
  "collectionNotes",
  "preservation",
  "connections",
  "artifacts",
]);

export function refreshFiledLibrarySteam(collectionRecord, steam, { dryRun = false } = {}) {
  const slug = collectionRecord?.filing?.librarySlug;
  if (!slug || !steam) return { status: "skipped", reason: "not_filed" };

  const library = readLibraryEntry(slug);
  if (!library) {
    return { status: "missing", reason: `library_entry_missing:${slug}` };
  }

  const next = { ...library, steam };
  for (const field of LIBRARY_EDITORIAL_FIELDS) {
    const before = JSON.stringify(library[field] ?? null);
    const after = JSON.stringify(next[field] ?? null);
    if (before !== after) {
      throw new Error(
        `Steam sync attempted to modify Library editorial field "${field}" on ${slug}`,
      );
    }
  }

  writeLibraryEntry(next, { dryRun });
  return { status: "updated", slug };
}
