/**
 * Library — archival wing types.
 *
 * Designed for a large personal media catalog (thousands of entries).
 * One JSON file per entry under content/library/entries/{slug}.json.
 *
 * The Archive Entry shape is the canonical accession record —
 * every future game, film, album, and book inherits this structure.
 *
 * Browse uses LibraryShelfCard / LibraryShelfSummary only.
 * Full LibraryEntry hydrates on the accession page alone.
 * See src/config/library-stewardship.ts.
 */

import type { CollectionSteamMetadata } from "@/types/collection-archive";
import type { LibraryAuthorityReferences } from "@/types/authority";

export const LIBRARY_MEDIA_TYPES = [
  "game",
  "film",
  "television",
  "music",
  "book",
  "other",
] as const;

export type LibraryMediaType = (typeof LIBRARY_MEDIA_TYPES)[number];

export const LIBRARY_STATUSES = [
  "catalogued",
  "in-progress",
  "archived",
  "wishlist",
] as const;

export type LibraryStatus = (typeof LIBRARY_STATUSES)[number];

export const LIBRARY_VISIBILITY = ["published", "hidden"] as const;

export type LibraryVisibility = (typeof LIBRARY_VISIBILITY)[number];

/**
 * How a filing entered the archive.
 *
 * Every accession has a source. Future bulk sources (a Steam library, a
 * physical shelf inventory) are additional values here — never a parallel
 * system with its own routes, templates, or voice.
 */
export const LIBRARY_ACCESSION_SOURCES = [
  "private-acquisition",
  "collection-hall",
  "digital-library",
  "donation",
  "transfer",
] as const;

export type LibraryAccessionSource =
  (typeof LIBRARY_ACCESSION_SOURCES)[number];

export interface LibraryAccession {
  source: LibraryAccessionSource;
  /** Stable identifier within the source, when one exists. */
  sourceReference?: string;
  /** ISO timestamp of the last reconciliation against an automated source. */
  reconciledAt?: string;
}

/**
 * Curated browse platforms — fixed taxonomy for Catalog Facets.
 * Do not infer values beyond this list.
 */
export const LIBRARY_BROWSE_PLATFORMS = [
  "Steam",
  "PlayStation",
  "PlayStation 2",
  "PlayStation 3",
  "PlayStation 4",
  "PlayStation 5",
  "PlayStation Vita",
  "PlayStation Portable",
  "Nintendo Switch",
  "Nintendo Switch 2",
  "Xbox",
  "Xbox 360",
] as const;

export type LibraryBrowsePlatform = (typeof LIBRARY_BROWSE_PLATFORMS)[number];

/** Active Catalog Facets on the Library shelves. */
export const LIBRARY_FILTER_FACETS = ["platform", "genre"] as const;

export type LibraryFilterFacet = (typeof LIBRARY_FILTER_FACETS)[number];

export interface LibraryFilterOption {
  value: string;
  label: string;
  facet: LibraryFilterFacet;
}

/** Catalog Information — identity of the work itself. */
export interface LibraryCatalogInformation {
  originalTitle?: string;
  release?: string;
  developer?: string;
  publisher?: string;
  platform?: string;
  region?: string;
  /** Physical or distribution form (e.g. "PlayStation 2 disc", "Blu-ray"). */
  mediumForm?: string;
  director?: string;
  artist?: string;
  subjects?: string[];
}

/** Archival Status — condition and custody of this copy. */
export interface LibraryArchivalCustody {
  owned?: string;
  physical?: string;
  condition?: string;
  acquired?: string;
  filed?: string;
}

/** Preservation Notes — survival, hardware, and continuity. */
export interface LibraryPreservationNotes {
  playableOn?: string;
  originalHardware?: string;
  compatibility?: string;
  concerns?: string;
  knownRevisions?: string;
  availability?: string;
}

/**
 * Connections — cross-references into the wider publication.
 * Empty arrays / omitted fields simply omit that row from the panel.
 *
 * Lineage is derived from `series`, not hand-listed. Filings that share a
 * series recognize each other automatically; `relatedEntrySlugs` is reserved
 * for relationships that cross series lines.
 */
export interface LibraryConnections {
  relatedEntrySlugs?: string[];
  series?: string;
  mediaLogSlug?: string;
  articleSlugs?: string[];
  collectionIds?: string[];
  instagramUrls?: string[];
  /** Soft future link — prose, not a URL. */
  futureReview?: string;
}

/**
 * Artifact Documentation — photographs of the preserved physical copy.
 * Distinct from `coverImage` (official artwork / identity of the work).
 * Designed to scale to dozens of views per entry without layout changes.
 */
export interface LibraryArtifactImage {
  /** Stable id within the entry (e.g. "front-cover", "01") */
  id: string;
  /** Display / gallery path under public/ */
  src: string;
  /** Full-resolution path for inspection; defaults to src */
  fullSrc?: string;
  /** Artifact view label — Front Cover, Spine, Disc, Manual, … */
  view: string;
  /** Optional subtype placard — e.g. "Reference Photograph" */
  kind?: string;
  captured?: string;
  resolution?: string;
  edition?: string;
  region?: string;
  /** Editorial caption beneath the reference photograph. */
  note?: string;
}

/**
 * Kinds of events that belong in the permanent Stewardship History.
 * These describe the life of the archival record — not storefront activity.
 */
export const LIBRARY_STEWARDSHIP_EVENT_KINDS = [
  "filed",
  "curator-notes-entered",
  "curator-notes-revised",
  "collection-documentation-entered",
  "collection-documentation-revised",
  "preservation-notes-entered",
  "preservation-notes-revised",
  "connections-established",
  "connections-revised",
  "artifact-documentation-added",
  "cover-artwork-entered",
  "published",
  "unpublished",
  "editorial-revision",
  "acquisition-reconciled",
] as const;

export type LibraryStewardshipEventKind =
  (typeof LIBRARY_STEWARDSHIP_EVENT_KINDS)[number];

/**
 * One dated entry in the Stewardship History.
 * Append-only. Stable `id` never reused; prior events are never mutated.
 */
export interface LibraryStewardshipEvent {
  id: string;
  /** ISO timestamp when the archival event occurred. */
  at: string;
  kind: LibraryStewardshipEventKind;
  /** Archival chronology line — institutional prose, not a system log message. */
  summary: string;
  /** Optional quiet detail beneath the summary. */
  note?: string;
}

/** On-disk record shape for a single archive entry. */
export interface LibraryRecord {
  slug: string;
  title: string;
  mediaType: LibraryMediaType;
  status: LibraryStatus;
  visibility: LibraryVisibility;
  /** Calendar year of the work, when known */
  year?: number;
  /** Short placard line for shelf cards — not a review */
  synopsis?: string;
  /**
   * Official cover artwork — identity of the work itself.
   * Not a photograph of the owned copy.
   */
  coverImage?: string;
  /** ISO date when filed into the library */
  filedAt: string;
  /** ISO date of the most recent curatorial review */
  curatorialRevisionAt?: string;
  /** Optional display shelf mark; defaults to slug */
  shelfMark?: string;
  /** Provenance of the filing itself — source-agnostic by design. */
  accession?: LibraryAccession;
  /**
   * Explicit Authority Record references (slugs).
   * Established deliberately — never inferred from catalog free text.
   */
  authorities?: LibraryAuthorityReferences;

  catalog: LibraryCatalogInformation;
  custody: LibraryArchivalCustody;
  curatorNotes?: string;
  collectionNotes?: string;
  preservation?: LibraryPreservationNotes;
  connections?: LibraryConnections;
  /** Photographs documenting the preserved physical artifact */
  artifacts?: LibraryArtifactImage[];
  /**
   * Dedicated Steam metadata — attached permanently when a Steam Pipeline
   * record is filed. Independent of editorial prose; Steam sync may refresh
   * this block without touching curator writing.
   */
  steam?: CollectionSteamMetadata;
  /**
   * Append-only chronology of the archival record itself.
   * Never rewritten in place; new events are only appended.
   */
  stewardshipHistory?: LibraryStewardshipEvent[];
}

/** Presentation model used by Library UI components. */
export interface LibraryEntry {
  slug: string;
  title: string;
  mediaType: LibraryMediaType;
  mediaTypeLabel: string;
  status: LibraryStatus;
  statusLabel: string;
  visibility: LibraryVisibility;
  year?: number;
  synopsis?: string;
  coverImage?: string;
  filedAt: string;
  curatorialRevisionAt?: string;
  shelfMark: string;
  href: string;
  accession?: LibraryAccession;
  /** Explicit Authority Record references (slugs). */
  authorities?: LibraryAuthorityReferences;
  catalog: LibraryCatalogInformation;
  custody: LibraryArchivalCustody;
  curatorNotes?: string;
  collectionNotes?: string;
  preservation?: LibraryPreservationNotes;
  connections: LibraryConnections;
  artifacts: LibraryArtifactImage[];
  /** Present when this accession was filed from a Steam acquisition. */
  steam?: CollectionSteamMetadata;
  /** Append-only chronology of the archival record itself. */
  stewardshipHistory: LibraryStewardshipEvent[];
  /** Derived subjects for browse / facets */
  subjects: string[];
  /** @deprecated Prefer subjects — retained for facet filtering alias */
  tags: string[];
}

/**
 * Lean on-disk shelf summary — stored in the catalog index.
 * Enough for browse cards and catalog lookup without opening accession JSON.
 * Labels and hrefs are derived at read time.
 */
export interface LibraryShelfSummary {
  slug: string;
  title: string;
  mediaType: LibraryMediaType;
  status: LibraryStatus;
  visibility: LibraryVisibility;
  year?: number;
  synopsis?: string;
  coverImage?: string;
  filedAt: string;
  shelfMark?: string;
  platform?: string;
  subjects?: string[];
  originalTitle?: string;
  developer?: string;
  publisher?: string;
  director?: string;
  artist?: string;
  /** Series name — the basis for derived archival lineage. */
  series?: string;
  accessionSource?: LibraryAccessionSource;
  /** Steam App ID when the accession carries Steam provenance — for Catalog Lookup. */
  steamAppId?: number;
}

/**
 * A peer filing within the same archival lineage.
 * Derived from the catalog index; never hand-listed in accession files.
 */
export interface LibraryLineageMember {
  slug: string;
  title: string;
  shelfMark: string;
  year?: number;
  href: string;
  /** True for the filing currently being read. */
  isCurrent: boolean;
}

/**
 * Browse / shelf card projection — never carries curator prose or artifacts.
 * One filing and five thousand filings share this shape on the shelves.
 */
export interface LibraryShelfCard {
  slug: string;
  title: string;
  mediaType: LibraryMediaType;
  mediaTypeLabel: string;
  status: LibraryStatus;
  statusLabel: string;
  year?: number;
  synopsis?: string;
  coverImage?: string;
  filedAt: string;
  shelfMark: string;
  href: string;
  platform?: string;
  subjects: string[];
  originalTitle?: string;
  developer?: string;
  publisher?: string;
  director?: string;
  artist?: string;
  series?: string;
  steamAppId?: number;
}

export interface LibraryCatalogIndex {
  /** Schema 2+ carries shelf summaries and publishedSlugs. */
  schemaVersion: number;
  entrySlugs: string[];
  /** Published slugs only — sitemap / static params without opening accession files. */
  publishedSlugs?: string[];
  /** Shelf projections keyed by slug. */
  shelf?: Record<string, LibraryShelfSummary>;
  updatedAt: string | null;
}

export interface LibraryCatalog {
  /** Current shelf page only — never the full filtered set. */
  entries: LibraryShelfCard[];
  /** Filtered match count across the whole shelf. */
  total: number;
  /** Published works in the archive (ignores lookup / facets). */
  publishedTotal: number;
  /** True when the archive has no published filings. */
  isEmpty: boolean;
  page: number;
  pageSize: number;
  pageCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

/** Browse query shape — wired from /library searchParams. */
export interface LibraryBrowseQuery {
  q?: string;
  /** Curated platform facets — OR within, AND with other dimensions. */
  platforms?: LibraryBrowsePlatform[];
  /** Genre facets from catalog subjects — OR within, AND with other dimensions. */
  genres?: string[];
  /** 1-based shelf page. Omitted or invalid values resolve to page 1. */
  page?: number;
}
