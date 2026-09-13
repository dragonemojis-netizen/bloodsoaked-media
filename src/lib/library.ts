import fs from "fs";
import path from "path";
import {
  libraryMediumLabels,
  libraryStatusLabels,
} from "@/config/library-voice";
import { sortStewardshipHistory } from "@/lib/library-stewardship-history";
import type {
  LibraryBrowseQuery,
  LibraryCatalog,
  LibraryCatalogIndex,
  LibraryConnections,
  LibraryEntry,
  LibraryLineageMember,
  LibraryMediaType,
  LibraryRecord,
  LibraryShelfCard,
  LibraryShelfSummary,
  LibraryStatus,
} from "@/types/library";
import { LIBRARY_BROWSE_PLATFORMS } from "@/types/library";
import {
  filterLibraryShelfCards,
  paginateLibraryCatalog,
} from "@/lib/library-browse";

export {
  filterLibraryShelfCards,
  formatLibraryFiledDate,
  getLibraryBrowseHref,
  libraryBrowseQueryHasFacets,
  parseLibraryBrowseParamList,
  resolveLibraryBrowsePlatform,
  toggleLibraryBrowseValue,
} from "@/lib/library-browse";

export type {
  LibraryAccession,
  LibraryAccessionSource,
  LibraryBrowsePlatform,
  LibraryBrowseQuery,
  LibraryCatalog,
  LibraryEntry,
  LibraryLineageMember,
  LibraryMediaType,
  LibraryRecord,
  LibraryShelfCard,
  LibraryShelfSummary,
  LibraryStatus,
  LibraryStewardshipEvent,
} from "@/types/library";

export { LIBRARY_BROWSE_PLATFORMS } from "@/types/library";

/** Subjects that are archival meta-labels, not browse genres. */
const LIBRARY_GENRE_EXCLUSIONS = new Set([
  "Digital Preservation",
  "Preservation",
]);

const LIBRARY_DIR = path.join(process.cwd(), "content", "library");
const ENTRIES_DIR = path.join(LIBRARY_DIR, "entries");
const INDEX_PATH = path.join(LIBRARY_DIR, "index.json");

/** Current catalog index schema — shelf summaries + publishedSlugs. */
export const LIBRARY_INDEX_SCHEMA_VERSION = 2;

export function getLibraryMediaTypeLabel(type: LibraryMediaType): string {
  return libraryMediumLabels[type];
}

export function getLibraryStatusLabel(status: LibraryStatus): string {
  return libraryStatusLabels[status];
}

export function getLibraryEntryHref(slug: string): string {
  return `/library/${slug}`;
}

function getEntrySlugsFromDisk(): string[] {
  if (!fs.existsSync(ENTRIES_DIR)) return [];
  return fs
    .readdirSync(ENTRIES_DIR)
    .filter((file) => file.endsWith(".json") && !file.startsWith("_"))
    .map((file) => file.replace(/\.json$/, ""))
    .sort((a, b) => a.localeCompare(b));
}

function readCatalogIndex(): LibraryCatalogIndex | null {
  if (!fs.existsSync(INDEX_PATH)) return null;
  return JSON.parse(fs.readFileSync(INDEX_PATH, "utf8")) as LibraryCatalogIndex;
}

export function getLibraryRecord(slug: string): LibraryRecord | null {
  const filePath = path.join(ENTRIES_DIR, `${slug}.json`);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as LibraryRecord;
}

function isDisplayable(record: LibraryRecord): boolean {
  return record.visibility === "published";
}

function emptyConnections(): LibraryConnections {
  return {};
}

export function toLibraryShelfSummary(record: LibraryRecord): LibraryShelfSummary {
  return {
    slug: record.slug,
    title: record.title,
    mediaType: record.mediaType,
    status: record.status,
    visibility: record.visibility,
    year: record.year,
    synopsis: record.synopsis,
    coverImage: record.coverImage,
    filedAt: record.filedAt,
    shelfMark: record.shelfMark,
    platform: record.catalog?.platform,
    subjects: record.catalog?.subjects ?? [],
    originalTitle: record.catalog?.originalTitle,
    developer: record.catalog?.developer,
    publisher: record.catalog?.publisher,
    director: record.catalog?.director,
    artist: record.catalog?.artist,
    series: record.connections?.series,
    accessionSource: record.accession?.source,
    steamAppId: record.steam?.appId,
  };
}

export function toLibraryShelfCardFromSummary(
  summary: LibraryShelfSummary,
): LibraryShelfCard {
  return {
    slug: summary.slug,
    title: summary.title,
    mediaType: summary.mediaType,
    mediaTypeLabel: getLibraryMediaTypeLabel(summary.mediaType),
    status: summary.status,
    statusLabel: getLibraryStatusLabel(summary.status),
    year: summary.year,
    synopsis: summary.synopsis,
    coverImage: summary.coverImage,
    filedAt: summary.filedAt,
    shelfMark: summary.shelfMark ?? summary.slug,
    href: getLibraryEntryHref(summary.slug),
    platform: summary.platform,
    subjects: summary.subjects ?? [],
    originalTitle: summary.originalTitle,
    developer: summary.developer,
    publisher: summary.publisher,
    director: summary.director,
    artist: summary.artist,
    series: summary.series,
    steamAppId: summary.steamAppId,
  };
}

export function toLibraryShelfCard(record: LibraryRecord): LibraryShelfCard {
  return toLibraryShelfCardFromSummary(toLibraryShelfSummary(record));
}

export function toLibraryEntry(record: LibraryRecord): LibraryEntry {
  const subjects = record.catalog?.subjects ?? [];

  return {
    slug: record.slug,
    title: record.title,
    mediaType: record.mediaType,
    mediaTypeLabel: getLibraryMediaTypeLabel(record.mediaType),
    status: record.status,
    statusLabel: getLibraryStatusLabel(record.status),
    visibility: record.visibility,
    year: record.year,
    synopsis: record.synopsis,
    coverImage: record.coverImage,
    filedAt: record.filedAt,
    curatorialRevisionAt: record.curatorialRevisionAt,
    shelfMark: record.shelfMark ?? record.slug,
    href: getLibraryEntryHref(record.slug),
    accession: record.accession,
    authorities: record.authorities,
    catalog: record.catalog ?? {},
    custody: record.custody ?? {},
    curatorNotes: record.curatorNotes,
    collectionNotes: record.collectionNotes,
    preservation: record.preservation,
    connections: record.connections ?? emptyConnections(),
    artifacts: record.artifacts ?? [],
    steam: record.steam,
    stewardshipHistory: sortStewardshipHistory(record.stewardshipHistory ?? []),
    subjects,
    tags: subjects,
  };
}

export function getAllLibraryRecords(): LibraryRecord[] {
  return getEntrySlugsFromDisk()
    .map((slug) => getLibraryRecord(slug))
    .filter((record): record is LibraryRecord => record !== null);
}

/**
 * Published slugs for sitemap / static params.
 * Prefers index.publishedSlugs so thousands of filings never require
 * opening every accession file.
 */
export function getPublishedLibrarySlugs(): string[] {
  const index = readCatalogIndex();

  if (index?.publishedSlugs?.length) {
    return [...index.publishedSlugs];
  }

  if (index?.shelf && Object.keys(index.shelf).length > 0) {
    return Object.values(index.shelf)
      .filter((summary) => summary.visibility === "published")
      .map((summary) => summary.slug)
      .sort((a, b) => a.localeCompare(b));
  }

  const slugs = index?.entrySlugs?.length
    ? index.entrySlugs
    : getEntrySlugsFromDisk();

  return slugs.filter((slug) => {
    const record = getLibraryRecord(slug);
    return record !== null && isDisplayable(record);
  });
}

/**
 * Title for a related shelf filing — prefers the catalog index shelf
 * summary so accession pages do not open peer JSON files.
 */
export function getLibraryShelfTitle(slug: string): string | null {
  const index = readCatalogIndex();
  const fromShelf = index?.shelf?.[slug]?.title;
  if (fromShelf) return fromShelf;

  const record = getLibraryRecord(slug);
  return record?.title ?? null;
}

/**
 * Every published filing sharing a series, in archival order.
 *
 * Lineage is derived, so filing a new work into an existing series makes all
 * of its peers recognize it without editing their accession records.
 */
export function getLibrarySeriesLineage(
  series: string | undefined,
  currentSlug?: string,
): LibraryLineageMember[] {
  if (!series?.trim()) return [];

  const index = readCatalogIndex();
  const summaries = index?.shelf
    ? Object.values(index.shelf)
    : getAllLibraryRecords().map(toLibraryShelfSummary);

  const members = summaries
    .filter(
      (summary) =>
        summary.visibility === "published" && summary.series === series,
    )
    .map<LibraryLineageMember>((summary) => ({
      slug: summary.slug,
      title: summary.title,
      shelfMark: summary.shelfMark ?? summary.slug,
      year: summary.year,
      href: getLibraryEntryHref(summary.slug),
      isCurrent: summary.slug === currentSlug,
    }))
    .sort((a, b) => {
      const yearA = a.year ?? Number.POSITIVE_INFINITY;
      const yearB = b.year ?? Number.POSITIVE_INFINITY;
      if (yearA !== yearB) return yearA - yearB;
      return a.shelfMark.localeCompare(b.shelfMark);
    });

  return members.length > 1 ? members : [];
}

export function getLibraryEntry(slug: string): LibraryEntry | null {
  const record = getLibraryRecord(slug);
  if (!record || !isDisplayable(record)) return null;
  return toLibraryEntry(record);
}

/**
 * Full accession for the Archive Entry template — including editorial drafts
 * that remain off the public shelf. Browse and sitemaps still use published only.
 */
export function getLibraryAccession(slug: string): LibraryEntry | null {
  const record = getLibraryRecord(slug);
  if (!record) return null;
  return toLibraryEntry(record);
}

function sortShelfCards(a: LibraryShelfCard, b: LibraryShelfCard): number {
  const byTitle = a.title.localeCompare(b.title);
  if (byTitle !== 0) return byTitle;
  return a.slug.localeCompare(b.slug);
}

/**
 * All published shelf cards. Uses index summaries when present;
 * falls back to accession files only for missing summaries.
 */
export function getPublishedShelfCards(): LibraryShelfCard[] {
  const index = readCatalogIndex();
  const shelf = index?.shelf ?? {};

  return getPublishedLibrarySlugs()
    .map((slug) => {
      const summary = shelf[slug];
      if (summary && summary.visibility === "published") {
        return toLibraryShelfCardFromSummary(summary);
      }
      const record = getLibraryRecord(slug);
      if (!record || !isDisplayable(record)) return null;
      return toLibraryShelfCard(record);
    })
    .filter((card): card is LibraryShelfCard => card !== null)
    .sort(sortShelfCards);
}


/** @deprecated Prefer filterLibraryShelfCards — retained for transitional callers. */
export function filterLibraryEntries(
  entries: LibraryEntry[],
  query: LibraryBrowseQuery = {},
): LibraryEntry[] {
  const cards = filterLibraryShelfCards(
    entries.map((entry) => ({
      slug: entry.slug,
      title: entry.title,
      mediaType: entry.mediaType,
      mediaTypeLabel: entry.mediaTypeLabel,
      status: entry.status,
      statusLabel: entry.statusLabel,
      year: entry.year,
      synopsis: entry.synopsis,
      coverImage: entry.coverImage,
      filedAt: entry.filedAt,
      shelfMark: entry.shelfMark,
      href: entry.href,
      platform: entry.catalog.platform,
      subjects: entry.subjects,
      originalTitle: entry.catalog.originalTitle,
      developer: entry.catalog.developer,
      publisher: entry.catalog.publisher,
      director: entry.catalog.director,
      artist: entry.catalog.artist,
      steamAppId: entry.steam?.appId,
    })),
    query,
  );
  const allowed = new Set(cards.map((card) => card.slug));
  return entries.filter((entry) => allowed.has(entry.slug));
}

/**
 * Paginated shelf catalog. Browse never opens full accession records
 * when the index carries shelf summaries.
 */
export function getLibraryCatalog(
  query: LibraryBrowseQuery = {},
): LibraryCatalog {
  return paginateLibraryCatalog(getPublishedShelfCards(), query);
}

/**
 * Rebuild content/library/index.json from accession files.
 * Run after filing or revising entries so browse stays O(index).
 */
export function rebuildLibraryCatalogIndex(): LibraryCatalogIndex {
  const records = getAllLibraryRecords();
  const shelf: Record<string, LibraryShelfSummary> = {};

  for (const record of records) {
    shelf[record.slug] = toLibraryShelfSummary(record);
  }

  const entrySlugs = records.map((record) => record.slug).sort();
  const publishedSlugs = records
    .filter(isDisplayable)
    .map((record) => record.slug)
    .sort();

  const index: LibraryCatalogIndex = {
    schemaVersion: LIBRARY_INDEX_SCHEMA_VERSION,
    entrySlugs,
    publishedSlugs,
    shelf,
    updatedAt: new Date().toISOString(),
  };

  fs.writeFileSync(INDEX_PATH, `${JSON.stringify(index, null, 2)}\n`, "utf8");
  return index;
}

/**
 * Catalog Facets for the Library sidebar.
 * Platform is a fixed curated taxonomy; genre is derived from filed subjects.
 */
export function getLibraryFilterTaxonomy() {
  const cards = getPublishedShelfCards();
  const genreSet = new Set<string>();

  for (const card of cards) {
    for (const subject of card.subjects) {
      const trimmed = subject.trim();
      if (!trimmed || LIBRARY_GENRE_EXCLUSIONS.has(trimmed)) continue;
      genreSet.add(trimmed);
    }
  }

  return {
    platforms: LIBRARY_BROWSE_PLATFORMS.map((value) => ({
      value,
      label: value,
    })),
    genres: [...genreSet]
      .sort((a, b) => a.localeCompare(b))
      .map((value) => ({
        value,
        label: value,
      })),
  };
}

