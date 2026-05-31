export const MEDIA_LOG_TYPES = [
  "Game",
  "Film",
  "Music",
  "TV",
  "Book",
] as const;

export type MediaLogType = (typeof MEDIA_LOG_TYPES)[number];

/** Slug values stored in frontmatter; labels are uppercase in the UI */
export const MEDIA_LOG_STATUSES = [
  "started",
  "finished",
  "replayed",
  "platinum",
  "rewatched",
  "listened",
  "read",
  "abandoned",
  /** @deprecated use `finished` — kept for existing entries */
  "completed",
  /** @deprecated use `read` */
  "reading",
] as const;

export type MediaLogStatus = (typeof MEDIA_LOG_STATUSES)[number];

export interface MediaLogEntry {
  slug: string;
  title: string;
  /** Optional — omit when the exact completion date is unknown */
  date?: string;
  mediaType: MediaLogType;
  /** Where the experience happened — archival shelf context */
  platform?: string;
  status: MediaLogStatus;
  notes: string;
  /** Local path under public/ (e.g. /images/media-log/slug.jpg) */
  coverArt?: string;
  /** Manual remote override when local/curated art is unavailable */
  coverEmbed?: string;
  tags: string[];
  reviewSlug?: string;
  /** Optional Dakota rating (0–100) — publication record, not an aggregator score */
  score?: number;
  platinumNumber?: number;
  isReplay?: boolean;
  logYear?: number;
  /** Preserves manifest order within a year when date is unknown */
  archiveOrder?: number;
  /** Resolved at load time: local file, library, or embed */
  coverSrc?: string;
}

export interface MediaLogCoverLibraryEntry {
  local?: string;
  wikipedia?: string;
  embed?: string;
}

export interface MediaLogYearArchive {
  year: number;
  title: string;
  introduction: string;
  themes: string[];
  multiplayer: {
    label: string;
    title: string;
    hours: number;
    unit: string;
  };
}
