/**
 * Archive Filing — TypeScript service (Workbench + CLI parity).
 *
 * Promotes a Collection Pipeline record into a full Library accession.
 * Mirrors scripts/lib/library/file-accession.mjs so the Workbench can file
 * without spawning the Node CLI.
 */

import fs from "fs";
import path from "path";
import {
  getAllCollectionArchiveRecords,
  getCollectionArchiveRecord,
} from "@/lib/collection-archive";
import {
  getAllLibraryRecords,
  getLibraryRecord,
  rebuildLibraryCatalogIndex,
} from "@/lib/library";
import { nextShelfMark } from "@/lib/library-shelf-mark";
import { createFilingStewardshipEvent } from "@/lib/library-stewardship-history";
import type {
  CollectionArchiveRecord,
  CollectionSteamMetadata,
} from "@/types/collection-archive";
import type { LibraryRecord } from "@/types/library";

const COLLECTION_ENTRIES_DIR = path.join(
  process.cwd(),
  "content",
  "collection",
  "entries",
);
const LIBRARY_ENTRIES_DIR = path.join(
  process.cwd(),
  "content",
  "library",
  "entries",
);

const FILEABLE_STATUSES = new Set(["Pipeline"]);

function deepClone<T>(value: T): T {
  return value == null ? value : (JSON.parse(JSON.stringify(value)) as T);
}

function writeJsonAtomic(filePath: string, data: unknown, dryRun: boolean) {
  if (dryRun) return;
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const tmp = `${filePath}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  fs.renameSync(tmp, filePath);
}

function writeCollectionRecord(
  record: CollectionArchiveRecord,
  { dryRun = false } = {},
) {
  writeJsonAtomic(
    path.join(COLLECTION_ENTRIES_DIR, `${record.id}.json`),
    record,
    dryRun,
  );
}

function writeLibraryRecord(record: LibraryRecord, { dryRun = false } = {}) {
  writeJsonAtomic(
    path.join(LIBRARY_ENTRIES_DIR, `${record.slug}.json`),
    record,
    dryRun,
  );
}

export function slugifyTitle(title: string): string {
  return (
    String(title ?? "")
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .replace(/-{2,}/g, "-")
      .slice(0, 80) || "untitled"
  );
}

export function allocateUniqueSlug(base: string, existingSlugs: string[]): string {
  const taken = new Set(existingSlugs);
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}

function joinList(list?: string[]): string | undefined {
  if (!Array.isArray(list) || list.length === 0) return undefined;
  return list.filter(Boolean).join(" · ");
}

function yearFromSteam(steam?: CollectionSteamMetadata): number | undefined {
  if (!steam?.releaseDate) return undefined;
  const iso = String(steam.releaseDate);
  if (/^\d{4}-\d{2}-\d{2}/.test(iso)) return Number(iso.slice(0, 4));
  const year = Number(iso.slice(0, 4));
  return Number.isFinite(year) ? year : undefined;
}

function formatFiledStamp(iso: string): string {
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

function resolveCoverImage(
  collection: CollectionArchiveRecord,
): string | undefined {
  const art = collection.steam?.artwork;
  return (
    art?.capsule ||
    art?.headerCapsule ||
    art?.hero ||
    collection.coverImage ||
    undefined
  );
}

export function findLibraryByCollectionId(
  collectionId: string,
): LibraryRecord | null {
  for (const record of getAllLibraryRecords()) {
    if (record.accession?.sourceReference === collectionId) return record;
    if (record.connections?.collectionIds?.includes(collectionId)) return record;
  }
  return null;
}

export function findLibraryBySteamAppId(appId: number): LibraryRecord | null {
  for (const record of getAllLibraryRecords()) {
    if (record.steam?.appId === appId) return record;
  }
  return null;
}

export function assertFileable(collection: CollectionArchiveRecord | null): void {
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

export function assertNotDuplicate(collection: CollectionArchiveRecord): void {
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

export function markCollectionFiled(
  collection: CollectionArchiveRecord,
  {
    librarySlug,
    shelfMark,
    now,
  }: { librarySlug: string; shelfMark: string; now: string },
): CollectionArchiveRecord {
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

export function draftLibraryRecordFromCollection({
  collection,
  shelfMark,
  slug,
  now,
}: {
  collection: CollectionArchiveRecord;
  shelfMark: string;
  slug: string;
  now: string;
}): LibraryRecord {
  if (!collection?.id) {
    throw new Error("Collection record is required to draft a Library filing");
  }

  const steam = collection.steam ? deepClone(collection.steam) : undefined;
  const title = collection.title?.trim() || steam?.title || collection.id;
  const year = yearFromSteam(steam);
  const developers = joinList(steam?.developers);
  const publishers = joinList(steam?.publishers);
  const subjects = steam?.genres?.filter(Boolean) ?? [];

  const record: LibraryRecord = {
    slug,
    title,
    mediaType: "game",
    status: "in-progress",
    visibility: "hidden",
    year,
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
    curatorNotes: "",
    collectionNotes: "",
    preservation: {},
    connections: {
      collectionIds: [collection.id],
    },
    artifacts: [],
    stewardshipHistory: [
      createFilingStewardshipEvent({
        at: now,
        shelfMark,
      }),
    ],
  };

  if (steam) record.steam = steam;
  return record;
}

export function allocateFilingIdentity({
  collection,
  existingLibraryRecords,
  slugOverride = null,
}: {
  collection: CollectionArchiveRecord;
  existingLibraryRecords: LibraryRecord[];
  slugOverride?: string | null;
}): { slug: string; shelfMark: string } {
  const base = slugOverride?.trim()
    ? slugifyTitle(slugOverride)
    : slugifyTitle(
        collection.title || collection.steam?.title || collection.id,
      );
  const existingSlugs = existingLibraryRecords.map((r) => r.slug);
  const slug = allocateUniqueSlug(base, existingSlugs);
  const shelfMark = nextShelfMark(existingLibraryRecords);
  return { slug, shelfMark };
}

export interface FilingResult {
  library: LibraryRecord;
  collection: CollectionArchiveRecord;
  created: true;
  dryRun: boolean;
}

export function fileCollectionAccession({
  collectionId,
  slugOverride = null,
  dryRun = false,
  now = new Date().toISOString(),
  reindex = true,
}: {
  collectionId: string;
  slugOverride?: string | null;
  dryRun?: boolean;
  now?: string;
  reindex?: boolean;
}): FilingResult {
  if (!collectionId) {
    throw new Error("collectionId is required");
  }

  const collection = getCollectionArchiveRecord(collectionId);
  assertFileable(collection);
  assertNotDuplicate(collection!);

  const existingLibraryRecords = getAllLibraryRecords();
  const { slug, shelfMark } = allocateFilingIdentity({
    collection: collection!,
    existingLibraryRecords,
    slugOverride,
  });

  if (existingLibraryRecords.some((r) => r.slug === slug)) {
    throw new Error(`Library slug "${slug}" already exists`);
  }
  if (getLibraryRecord(slug)) {
    throw new Error(`Library slug "${slug}" already exists`);
  }

  const library = draftLibraryRecordFromCollection({
    collection: collection!,
    shelfMark,
    slug,
    now,
  });

  const filedCollection = markCollectionFiled(collection!, {
    librarySlug: slug,
    shelfMark,
    now,
  });

  if (collection!.steam) {
    library.steam = deepClone(collection!.steam);
  }

  writeLibraryRecord(library, { dryRun });
  writeCollectionRecord(filedCollection, { dryRun });

  if (!dryRun && reindex) {
    rebuildLibraryCatalogIndex();
  }

  return {
    library,
    collection: filedCollection,
    created: true,
    dryRun,
  };
}

export function listFileableCollectionIds(): string[] {
  return getAllCollectionArchiveRecords()
    .filter((record) => {
      try {
        assertFileable(record);
        return true;
      } catch {
        return false;
      }
    })
    .map((record) => record.id);
}
