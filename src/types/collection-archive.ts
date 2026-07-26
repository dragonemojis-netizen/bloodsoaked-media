export const COLLECTION_EVENT_TYPES = [
  "acquisition",
  "discovery",
  "preservation",
  "expansion",
  "arrival",
] as const;

export type CollectionEventType = (typeof COLLECTION_EVENT_TYPES)[number];

export const COLLECTION_ARCHIVE_STATUSES = [
  "Catalogued",
  "Preservation",
  "Pipeline",
  "Filed",
] as const;

export type CollectionArchiveStatus = (typeof COLLECTION_ARCHIVE_STATUSES)[number];

export const COLLECTION_VISIBILITY = ["published", "hidden"] as const;

export type CollectionVisibility = (typeof COLLECTION_VISIBILITY)[number];

/** Distinguishes authentic archive content from development placeholders. */
export const COLLECTION_RECORD_ORIGINS = [
  "instagram",
  "curated",
  "steam",
  "development",
] as const;

export type CollectionRecordOrigin = (typeof COLLECTION_RECORD_ORIGINS)[number];

export interface CollectionDevelopmentMeta {
  purpose: "system-validation";
  synthetic: true;
  description?: string;
  createdAt?: string;
}

/** Immutable provenance captured at first sync — never overwritten. */
export interface CollectionSourceProvenance {
  platform: "instagram" | "manual" | "steam";
  /** Steam App ID when platform is steam — stable dedupe key. */
  steamAppId?: number;
  /** Original Instagram caption at first synchronization */
  captionSnapshot?: string;
  /** ISO date when captionSnapshot was captured */
  captionSnapshotAt?: string;
  /** Local path to first-sync image preserved permanently */
  imageSnapshot?: string;
  /** Instagram media ID at time of first sync */
  mediaId?: string;
  permalink?: string;
  postedAt?: string;
  mediaType?: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  lastSyncedAt?: string;
  /** Notes for manually seeded records before Instagram is connected */
  provenanceNote?: string;
}

/** Curator-facing metadata — separate from Instagram provenance. */
export interface CollectionArchiveEnrichment {
  /** Documented media identity — separate from the Instagram filing name in `title`. */
  artifactLabel?: string;
  medium?: string;
  year?: number;
  platform?: string;
  tags?: string[];
  linkedArticleSlug?: string;
  linkedMediaLogSlug?: string;
}

export interface CollectionArchiveTombstone {
  removedFromInstagramAt?: string;
  reason?: string;
}

/**
 * Pointer written when a Pipeline record is filed into the Library.
 * Filing is a transformation of this accession — not a second copy.
 */
export interface CollectionFiling {
  librarySlug: string;
  shelfMark: string;
  filedAt: string;
}

/** Supported-platform flags reported by Steam for a title. */
export interface CollectionSteamPlatforms {
  windows?: boolean;
  mac?: boolean;
  linux?: boolean;
}

/** Locally preserved Steam artwork paths (public/). Steam art, not editorial cover. */
export interface CollectionSteamArtwork {
  /** Header capsule (store banner). */
  headerCapsule?: string;
  /** Vertical library capsule (600x900). */
  capsule?: string;
  /** Wide library hero, when available. */
  hero?: string;
}

/**
 * Dedicated Steam metadata section.
 *
 * Independent of editorial content: synchronization replaces only this block
 * and never the record's notes, enrichment, cover, status, or connections.
 * A record carrying `steam` remains eligible to be promoted to a full Library
 * Archive Entry later without migrating or recreating this data.
 */
export interface CollectionSteamMetadata {
  appId: number;
  /** Steam's own title for the app — metadata, distinct from the filing title. */
  title: string;
  owned: boolean;
  playtimeMinutes: number;
  /** Playtime in the last two weeks, when Steam reports it. */
  playtime2Weeks?: number | null;
  playtimeWindowsMinutes?: number;
  playtimeMacMinutes?: number;
  playtimeLinuxMinutes?: number;
  /** ISO timestamp Steam last recorded a play session, when available. */
  lastPlayedAt?: string | null;
  storeUrl: string;
  developers?: string[];
  publishers?: string[];
  /** ISO date when resolvable; otherwise the raw Steam string. */
  releaseDate?: string | null;
  releaseDateRaw?: string | null;
  comingSoon?: boolean;
  genres?: string[];
  categories?: string[];
  platforms?: CollectionSteamPlatforms;
  shortDescription?: string;
  artwork?: CollectionSteamArtwork;
  /** ISO timestamp of the last store-metadata (appdetails) refresh. */
  metadataSyncedAt?: string;
  /** ISO timestamp of the last ownership/playtime sync. */
  lastSynced: string;
  /** Provenance tag for the sync pipeline. */
  source: "steam-web-api";
}

export interface CollectionArchiveRecord {
  id: string;
  /** instagram = synced post · curated = real manual entry · development = removable seed */
  origin: CollectionRecordOrigin;
  title: string;
  eventType: CollectionEventType;
  status: CollectionArchiveStatus;
  catalogued: string;
  visibility: CollectionVisibility;
  /** Present only on synthetic development seed records */
  developmentMeta?: CollectionDevelopmentMeta;
  /** Curator note — never sourced from Instagram caption */
  notes?: string;
  /** Display image path (resolved at read time) */
  coverImage?: string;
  featured?: boolean;
  source: CollectionSourceProvenance;
  enrichment?: CollectionArchiveEnrichment;
  /** Imported Steam metadata — present on origin "steam" records. */
  steam?: CollectionSteamMetadata;
  /**
   * Set when this Collection accession has been filed into the Library.
   * Status becomes "Filed"; the Library entry is the accession page.
   */
  filing?: CollectionFiling;
  tombstone?: CollectionArchiveTombstone;
}

export interface CollectionArchiveIndex {
  schemaVersion: number;
  featuredId: string | null;
  entryIds: string[];
  statsOverrides?: Partial<{
    pendingPipeline: number;
    preservationProjects: number;
  }>;
  updatedAt: string;
}

export interface CollectionArchiveSyncState {
  schemaVersion: number;
  lastSyncedAt: string | null;
  lastSyncStatus: "idle" | "ok" | "partial" | "failed";
  lastError?: string;
}

export interface CollectionArchiveStats {
  catalogued: number;
  pendingPipeline: number;
  preservationProjects: number;
  lastCatalogued: string | null;
}

/** Presentation-layer provenance — separate from curator voice. */
export interface CollectionArchiveProvenance {
  origin: CollectionRecordOrigin;
  sourceLabel: string;
  acquisitionDate?: string;
  cataloguedDate: string;
  captionSnapshot?: string;
  /** External reference only — source, not destination */
  sourcePermalink?: string;
}

/** Record prepared for page rendering with resolved cover path. */
export interface CollectionArchiveEntry {
  id: string;
  title: string;
  eventType: CollectionEventType;
  status: CollectionArchiveStatus;
  catalogued: string;
  notes?: string;
  coverImage?: string;
  enrichment?: CollectionArchiveEnrichment;
  provenance: CollectionArchiveProvenance;
}

export interface CollectionArchive {
  featured: CollectionArchiveEntry | null;
  entries: CollectionArchiveEntry[];
  stats: CollectionArchiveStats;
  isEmpty: boolean;
}
