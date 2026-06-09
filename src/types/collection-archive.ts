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
] as const;

export type CollectionArchiveStatus = (typeof COLLECTION_ARCHIVE_STATUSES)[number];

export const COLLECTION_VISIBILITY = ["published", "hidden"] as const;

export type CollectionVisibility = (typeof COLLECTION_VISIBILITY)[number];

/** Distinguishes authentic archive content from development placeholders. */
export const COLLECTION_RECORD_ORIGINS = [
  "instagram",
  "curated",
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
  platform: "instagram" | "manual";
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
  subjectTitle?: string;
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
