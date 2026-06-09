import fs from "fs";
import path from "path";
import { formatDate } from "@/lib/format";
import { resolveCollectionCover } from "@/lib/collection-cover";
import type {
  CollectionArchive,
  CollectionArchiveEntry,
  CollectionArchiveIndex,
  CollectionArchiveRecord,
  CollectionArchiveStats,
  CollectionEventType,
  CollectionRecordOrigin,
} from "@/types/collection-archive";

export type {
  CollectionArchive,
  CollectionArchiveEntry,
  CollectionArchiveRecord,
  CollectionArchiveStats,
  CollectionEventType,
} from "@/types/collection-archive";

const COLLECTION_DIR = path.join(process.cwd(), "content", "collection");
const ENTRIES_DIR = path.join(COLLECTION_DIR, "entries");
const ARCHIVE_INDEX_PATH = path.join(COLLECTION_DIR, "archive.json");
const SCHEMA_VERSION_PATH = path.join(COLLECTION_DIR, "schema-version.json");

const EVENT_TYPE_LABELS: Record<CollectionEventType, string> = {
  acquisition: "Acquisition",
  discovery: "Discovery",
  preservation: "Preservation",
  expansion: "Expansion",
  arrival: "Arrival",
};

const EVENT_NARRATIVES: Record<CollectionEventType, string> = {
  acquisition:
    "A deliberate addition to the permanent shelf — sought, secured, and filed for preservation.",
  discovery:
    "Unearthed without plan — a find that demanded a place in the record.",
  preservation:
    "Held for survival — media whose condition and continuity matter as much as playback.",
  expansion:
    "The collection widened — a new chapter on the shelf taking shape.",
  arrival:
    "Recently home — crossed the threshold and entered the permanent archive.",
};

function getEntrySlugs(): string[] {
  if (!fs.existsSync(ENTRIES_DIR)) return [];
  return fs
    .readdirSync(ENTRIES_DIR)
    .filter((file) => file.endsWith(".json") && !file.startsWith("_"))
    .map((file) => file.replace(/\.json$/, ""));
}

function resolveOrigin(record: CollectionArchiveRecord): CollectionRecordOrigin {
  if (record.origin) return record.origin;
  if (record.source.platform === "instagram" || record.id.startsWith("ig-")) {
    return "instagram";
  }
  if (record.developmentMeta?.synthetic) return "development";
  return "curated";
}

function isAuthenticRecord(record: CollectionArchiveRecord): boolean {
  return resolveOrigin(record) !== "development";
}

export function getCollectionArchiveRecord(
  id: string,
): CollectionArchiveRecord | null {
  const filePath = path.join(ENTRIES_DIR, `${id}.json`);
  if (!fs.existsSync(filePath)) return null;

  return JSON.parse(fs.readFileSync(filePath, "utf8")) as CollectionArchiveRecord;
}

export function getAllCollectionArchiveRecords(): CollectionArchiveRecord[] {
  return getEntrySlugs()
    .map((id) => getCollectionArchiveRecord(id))
    .filter((record): record is CollectionArchiveRecord => record !== null);
}

function getArchiveIndex(): CollectionArchiveIndex | null {
  if (!fs.existsSync(ARCHIVE_INDEX_PATH)) return null;
  return JSON.parse(
    fs.readFileSync(ARCHIVE_INDEX_PATH, "utf8"),
  ) as CollectionArchiveIndex;
}

function isDisplayable(record: CollectionArchiveRecord): boolean {
  return (
    isAuthenticRecord(record) &&
    record.visibility === "published" &&
    !record.tombstone
  );
}

function buildProvenance(
  record: CollectionArchiveRecord,
): CollectionArchiveEntry["provenance"] {
  const origin = resolveOrigin(record);
  const sourceLabel =
    origin === "instagram"
      ? "Instagram acquisition"
      : origin === "curated"
        ? "Curated filing"
        : "Archive filing";

  return {
    origin,
    sourceLabel,
    acquisitionDate: record.source.postedAt,
    cataloguedDate: record.catalogued,
    captionSnapshot: record.source.captionSnapshot,
    sourcePermalink: record.source.permalink,
  };
}

function toDisplayEntry(record: CollectionArchiveRecord): CollectionArchiveEntry {
  return {
    id: record.id,
    title: record.title,
    eventType: record.eventType,
    status: record.status,
    catalogued: record.catalogued,
    notes: record.notes,
    coverImage: resolveCollectionCover(record),
    enrichment: record.enrichment,
    provenance: buildProvenance(record),
  };
}

function buildStats(
  records: CollectionArchiveRecord[],
  index: CollectionArchiveIndex | null,
): CollectionArchiveStats {
  const visible = records.filter(isDisplayable);
  const catalogued = visible.filter((r) => r.status === "Catalogued");
  const pipeline = visible.filter((r) => r.status === "Pipeline");
  const preservation = visible.filter((r) => r.status === "Preservation");

  const sorted = [...catalogued].sort(
    (a, b) => new Date(b.catalogued).getTime() - new Date(a.catalogued).getTime(),
  );

  return {
    catalogued: catalogued.length,
    pendingPipeline:
      index?.statsOverrides?.pendingPipeline ?? pipeline.length,
    preservationProjects:
      index?.statsOverrides?.preservationProjects ?? preservation.length,
    lastCatalogued: sorted[0]?.catalogued ?? null,
  };
}

function emptyArchive(
  allRecords: CollectionArchiveRecord[],
  index: CollectionArchiveIndex | null,
): CollectionArchive {
  return {
    featured: null,
    entries: [],
    stats: buildStats(allRecords, index),
    isEmpty: true,
  };
}

export function getCollectionArchive(): CollectionArchive {
  const index = getArchiveIndex();
  const allRecords = getAllCollectionArchiveRecords();

  if (!index || index.entryIds.length === 0) {
    const displayRecords = allRecords
      .filter(isDisplayable)
      .filter((r) => r.status === "Catalogued" || r.status === "Preservation")
      .sort(
        (a, b) =>
          new Date(b.catalogued).getTime() - new Date(a.catalogued).getTime(),
      );

    if (displayRecords.length === 0) {
      return emptyArchive(allRecords, index);
    }

    const featuredRecord =
      displayRecords.find((r) => r.featured) ?? displayRecords[0];

    const entries = displayRecords
      .filter((r) => r.id !== featuredRecord.id)
      .map(toDisplayEntry);

    return {
      featured: toDisplayEntry(featuredRecord),
      entries,
      stats: buildStats(allRecords, index),
      isEmpty: false,
    };
  }

  const orderedRecords = index.entryIds
    .map((id) => getCollectionArchiveRecord(id))
    .filter((record): record is CollectionArchiveRecord => record !== null)
    .filter(isDisplayable)
    .filter((r) => r.status === "Catalogued" || r.status === "Preservation");

  if (orderedRecords.length === 0) {
    return emptyArchive(allRecords, index);
  }

  const featuredRecord =
    (index.featuredId
      ? orderedRecords.find((r) => r.id === index.featuredId)
      : null) ??
    orderedRecords.find((r) => r.featured) ??
    orderedRecords[0];

  const entries = orderedRecords
    .filter((r) => r.id !== featuredRecord.id)
    .map(toDisplayEntry);

  return {
    featured: toDisplayEntry(featuredRecord),
    entries,
    stats: buildStats(allRecords, index),
    isEmpty: false,
  };
}

export function getCollectionSpecimenHref(id: string): string {
  return `/collection/${encodeURIComponent(id)}`;
}

/** Published specimen for exhibit pages — null when hidden, tombstoned, or pipeline. */
export function getCollectionArchiveEntry(
  id: string,
): CollectionArchiveEntry | null {
  const record = getCollectionArchiveRecord(id);
  if (!record || !isDisplayable(record)) return null;
  if (record.status !== "Catalogued" && record.status !== "Preservation") {
    return null;
  }
  return toDisplayEntry(record);
}

export function getPublishedCollectionSpecimenIds(): string[] {
  return getEntrySlugs().filter((id) => getCollectionArchiveEntry(id) !== null);
}

export function formatEventType(eventType: CollectionEventType): string {
  return EVENT_TYPE_LABELS[eventType];
}

export function getEventNarrative(eventType: CollectionEventType): string {
  return EVENT_NARRATIVES[eventType];
}

/** Exhibit filing name — the Instagram caption title, preserved as posted. */
export function getSpecimenTitle(entry: CollectionArchiveEntry): string {
  return entry.title;
}

/** Curator-documented media identity — e.g. franchise, collection, or work name. */
export function getSpecimenArtifactLabel(
  entry: CollectionArchiveEntry,
): string | null {
  const label = entry.enrichment?.artifactLabel?.trim();
  return label || null;
}

/** Human descriptor from enrichment — not event-type metadata. */
export function getSpecimenDescriptor(entry: CollectionArchiveEntry): string | null {
  const parts = [
    entry.enrichment?.medium,
    entry.enrichment?.platform,
    entry.enrichment?.year,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : null;
}

export function getSpecimenTags(entry: CollectionArchiveEntry): string[] {
  return entry.enrichment?.tags?.filter((tag) => tag.trim().length > 0) ?? [];
}

export interface CollectionEnrichmentLink {
  href: string;
  label: string;
}

export function getEnrichmentLinks(
  entry: CollectionArchiveEntry,
): CollectionEnrichmentLink[] {
  const links: CollectionEnrichmentLink[] = [];
  const { enrichment } = entry;
  if (!enrichment) return links;

  if (enrichment.linkedArticleSlug) {
    links.push({
      href: `/articles/${enrichment.linkedArticleSlug}`,
      label: "Related article",
    });
  }
  if (enrichment.linkedMediaLogSlug) {
    links.push({
      href: `/media-log/${enrichment.linkedMediaLogSlug}`,
      label: "Media log entry",
    });
  }
  return links;
}

/** @deprecated Prefer getSpecimenDescriptor for narrative presentation */
export function formatArchiveMeta(entry: CollectionArchiveEntry): string {
  return [
    formatEventType(entry.eventType),
    entry.enrichment?.year,
    entry.enrichment?.platform ?? entry.enrichment?.medium,
  ]
    .filter(Boolean)
    .join(" · ");
}

export function formatCatalogueStamp(date: string): string {
  return formatDate(date);
}

export function formatAcquisitionStamp(date?: string): string | null {
  if (!date) return null;
  return formatDate(date);
}

export function getCollectionSchemaVersion(): number {
  if (!fs.existsSync(SCHEMA_VERSION_PATH)) return 0;
  const raw = JSON.parse(fs.readFileSync(SCHEMA_VERSION_PATH, "utf8")) as {
    version?: number;
  };
  return raw.version ?? 0;
}
