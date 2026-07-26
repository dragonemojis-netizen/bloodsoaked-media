/**
 * Filing normalization — Collection Pipeline → Library accession draft.
 *
 * Maps factual metadata into the existing Library template. Does not invent
 * curator prose. Editorial sections are initialized empty so a curator can
 * write into them later without restructuring the record.
 */

import { nextShelfMark } from "./shelf-mark.mjs";

export function slugifyTitle(title) {
  return String(title ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 80) || "untitled";
}

export function allocateUniqueSlug(base, existingSlugs) {
  const taken = new Set(existingSlugs);
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}

function joinList(list) {
  if (!Array.isArray(list) || list.length === 0) return undefined;
  return list.filter(Boolean).join(" · ");
}

function yearFromSteam(steam) {
  if (!steam?.releaseDate) return undefined;
  const iso = String(steam.releaseDate);
  if (/^\d{4}-\d{2}-\d{2}/.test(iso)) return Number(iso.slice(0, 4));
  const year = Number(iso.slice(0, 4));
  return Number.isFinite(year) ? year : undefined;
}

function formatFiledStamp(iso) {
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso.slice(0, 10);
  }
}

function resolveCoverImage(collection) {
  const art = collection.steam?.artwork;
  return (
    art?.capsule ||
    art?.headerCapsule ||
    art?.hero ||
    collection.coverImage ||
    undefined
  );
}

/**
 * Builds a LibraryRecord from a Collection Pipeline accession.
 * Does not write to disk. Caller supplies the allocated shelf mark + slug.
 */
export function draftLibraryRecordFromCollection({
  collection,
  shelfMark,
  slug,
  now,
}) {
  if (!collection?.id) {
    throw new Error("Collection record is required to draft a Library filing");
  }

  const steam = collection.steam
    ? structuredClone(collection.steam)
    : undefined;
  const title = collection.title?.trim() || steam?.title || collection.id;
  const year = yearFromSteam(steam);
  const developers = joinList(steam?.developers);
  const publishers = joinList(steam?.publishers);
  const subjects = steam?.genres?.filter(Boolean) ?? [];

  const record = {
    slug,
    title,
    mediaType: "game",
    // Filed into the archive but not yet curated for the public shelf.
    status: "in-progress",
    visibility: "hidden",
    year,
    // No generated synopsis — curator writes the placard later.
    synopsis: undefined,
    coverImage: resolveCoverImage(collection),
    filedAt: now,
    shelfMark,
    accession: {
      source: steam ? "digital-library" : "collection-hall",
      sourceReference: collection.id,
      reconciledAt: now,
    },
    catalog: {
      release: steam?.releaseDateRaw || steam?.releaseDate || undefined,
      developer: developers,
      publisher: publishers,
      platform: steam ? "Steam" : undefined,
      mediumForm: steam ? "Digital · Steam" : undefined,
      subjects: subjects.length > 0 ? subjects : undefined,
    },
    custody: {
      owned: steam ? "Digital library holding" : "Collection accession",
      physical: steam
        ? "Steam digital edition · permanent account holding"
        : undefined,
      acquired: collection.catalogued
        ? `Digital acquisition · ${formatFiledStamp(collection.catalogued)}`
        : undefined,
      filed: formatFiledStamp(now),
    },
    // Empty editorial sections — structure present, prose unwritten.
    curatorNotes: "",
    collectionNotes: "",
    preservation: {},
    connections: {
      collectionIds: [collection.id],
    },
    artifacts: [],
    stewardshipHistory: [
      {
        id: `filed-${now}`,
        at: now,
        kind: "filed",
        summary: "Filed into the Library",
        note: `Accessioned as ${shelfMark}.`,
      },
    ],
  };

  if (steam) {
    record.steam = steam;
  }

  return record;
}

export function allocateFilingIdentity({
  collection,
  existingLibraryRecords,
  slugOverride = null,
}) {
  const base = slugOverride?.trim()
    ? slugifyTitle(slugOverride)
    : slugifyTitle(collection.title || collection.steam?.title || collection.id);
  const existingSlugs = existingLibraryRecords.map((r) => r.slug);
  const slug = allocateUniqueSlug(base, existingSlugs);
  const shelfMark = nextShelfMark(existingLibraryRecords);
  return { slug, shelfMark };
}
