/**
 * Editorial Batches — temporary stewardship groups for filed drafts.
 *
 * Curator overlay under content/workbench/. Not part of the public archive schema.
 * One accession may belong to zero or one batch. Pipeline holdings never enter.
 */

import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { EDITORIAL_BATCH_SIZE } from "@/lib/editorial-batch-limits";
import {
  buildEditorialBatchReview,
  type EditorialBatchObservation,
  type EditorialBatchReview,
} from "@/lib/editorial-batch-review";
import {
  getAllLibraryRecords,
  getLibraryRecord,
  rebuildLibraryCatalogIndex,
} from "@/lib/library";
import { appendStewardshipEvent } from "@/lib/library-stewardship-history";
import { rebuildAuthorityCatalogIndex } from "@/lib/authority";
import type { LibraryRecord } from "@/types/library";

export { EDITORIAL_BATCH_SIZE } from "@/lib/editorial-batch-limits";
export type { EditorialBatchObservation, EditorialBatchReview };

const WORKBENCH_DIR = path.join(process.cwd(), "content", "workbench");
const BATCHES_PATH = path.join(WORKBENCH_DIR, "batches.json");

export interface EditorialBatchRecord {
  id: string;
  name: string;
  accessionSlugs: string[];
  createdAt: string;
  revisedAt: string;
  /** Short issue title for the batch introduction. */
  editorialTitle?: string;
  /** Editorial note — becomes part of Stewardship History on publish. */
  editorialNote?: string;
}

export interface EditorialBatchesStore {
  schemaVersion: number;
  batches: EditorialBatchRecord[];
  updatedAt: string | null;
}

export type EditorialBatchReadinessKind =
  | "empty"
  | "gathering"
  | "in-progress"
  | "ready";

export interface EditorialBatchFieldStatus {
  id: string;
  label: string;
  present: boolean;
}

export interface EditorialBatchAccessionRow {
  slug: string;
  title: string;
  shelfMark: string;
  href: string;
  publicHref: string | null;
  fields: EditorialBatchFieldStatus[];
  ready: boolean;
  stewardshipEventCount: number;
  /** Quiet editorial standing notes for this accession. */
  observations: string[];
}

export interface EditorialBatchSummary {
  id: string;
  name: string;
  accessionCount: number;
  createdAt: string;
  revisedAt: string;
  readiness: EditorialBatchReadinessKind;
  readinessLabel: string;
  readyCount: number;
  sizeNote: string | null;
  href: string;
  editorialTitle?: string;
  editorialNote?: string;
}

export interface EditorialBatchDetail extends EditorialBatchSummary {
  accessions: EditorialBatchAccessionRow[];
  eligibleToAdd: Array<{
    slug: string;
    title: string;
    shelfMark: string;
  }>;
  review: EditorialBatchReview;
}

export interface PublishBatchResult {
  published: string[];
  remaining: string[];
  failed: Array<{ slug: string; message: string }>;
}

const DEFAULT_STORE: EditorialBatchesStore = {
  schemaVersion: 1,
  batches: [],
  updatedAt: null,
};

function writeJsonAtomic(filePath: string, data: unknown) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const tmp = `${filePath}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  fs.renameSync(tmp, filePath);
}

function writeLibraryRecord(record: LibraryRecord) {
  const filePath = path.join(
    process.cwd(),
    "content",
    "library",
    "entries",
    `${record.slug}.json`,
  );
  writeJsonAtomic(filePath, record);
}

/** Filed editorial drafts eligible for batch membership. */
export function isEditorialDraftAccession(record: LibraryRecord): boolean {
  if (record.visibility === "published") return false;
  if (record.status === "archived") return false;
  return (
    record.status === "in-progress" || record.visibility === "hidden"
  );
}

function preservationHasContent(
  preservation: LibraryRecord["preservation"],
): boolean {
  if (!preservation) return false;
  return Object.values(preservation).some(
    (value) => typeof value === "string" && value.trim().length > 0,
  );
}

function connectionsPresent(record: LibraryRecord): boolean {
  const c = record.connections;
  if (!c) return false;
  return Boolean(
    c.series?.trim() ||
      (c.relatedEntrySlugs?.length ?? 0) > 0 ||
      c.mediaLogSlug?.trim() ||
      (c.articleSlugs?.length ?? 0) > 0 ||
      c.futureReview?.trim(),
  );
}

function authoritiesPresent(record: LibraryRecord): boolean {
  const a = record.authorities;
  if (!a) return false;
  return Object.values(a).some(
    (slugs) => Array.isArray(slugs) && slugs.length > 0,
  );
}

export function getEditorialBatchFieldStatuses(
  record: LibraryRecord,
): EditorialBatchFieldStatus[] {
  return [
    {
      id: "authorities",
      label: "Authority references",
      present: authoritiesPresent(record),
    },
    {
      id: "curator-notes",
      label: "Curator Notes",
      present: Boolean(record.curatorNotes?.trim()),
    },
    {
      id: "collection-documentation",
      label: "Collection Documentation",
      present: Boolean(record.collectionNotes?.trim()),
    },
    {
      id: "preservation",
      label: "Preservation Notes",
      present: preservationHasContent(record.preservation),
    },
    {
      id: "relationships",
      label: "Relationships",
      present: connectionsPresent(record),
    },
    {
      id: "stewardship-history",
      label: "Stewardship History",
      present: (record.stewardshipHistory?.length ?? 0) > 0,
    },
  ];
}

function accessionReady(fields: EditorialBatchFieldStatus[]): boolean {
  // Stewardship History is always present after filing; readiness requires
  // the editorial fields the curator tends before publication.
  return fields
    .filter((field) => field.id !== "stewardship-history")
    .every((field) => field.present);
}

function sizeNote(count: number): string | null {
  if (count === 0) return null;
  if (count < EDITORIAL_BATCH_SIZE.suggestedMin) {
    return `Gathering — batches of ${EDITORIAL_BATCH_SIZE.suggestedMin}–${EDITORIAL_BATCH_SIZE.suggestedMax} accessions are preferred.`;
  }
  if (count > EDITORIAL_BATCH_SIZE.suggestedMax) {
    return `Large batch — prefer no more than ${EDITORIAL_BATCH_SIZE.suggestedMax} accessions in a single issue.`;
  }
  return null;
}

function readinessFor(
  count: number,
  readyCount: number,
  leadObservation?: string,
): { kind: EditorialBatchReadinessKind; label: string } {
  if (count === 0) {
    return { kind: "empty", label: "Empty — awaiting accessions" };
  }
  if (count < EDITORIAL_BATCH_SIZE.suggestedMin) {
    return {
      kind: "gathering",
      label: leadObservation ?? "Gathering — still assembling the issue",
    };
  }
  if (readyCount === count) {
    return {
      kind: "ready",
      label: leadObservation ?? "Ready for publication.",
    };
  }
  return {
    kind: "in-progress",
    label: leadObservation ?? "Editorial review in progress.",
  };
}

export function readEditorialBatchesStore(): EditorialBatchesStore {
  if (!fs.existsSync(BATCHES_PATH)) {
    return { ...DEFAULT_STORE, batches: [] };
  }
  const raw = JSON.parse(
    fs.readFileSync(BATCHES_PATH, "utf8"),
  ) as EditorialBatchesStore;
  return {
    schemaVersion: 1,
    batches: Array.isArray(raw.batches) ? raw.batches : [],
    updatedAt: raw.updatedAt ?? null,
  };
}

function writeEditorialBatchesStore(store: EditorialBatchesStore): void {
  writeJsonAtomic(BATCHES_PATH, {
    ...store,
    schemaVersion: 1,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Drop published / missing accessions from every batch.
 * Published entries leave automatically.
 */
export function reconcileEditorialBatches(): EditorialBatchesStore {
  const store = readEditorialBatchesStore();
  let changed = false;
  const batches = store.batches.map((batch) => {
    const nextSlugs = batch.accessionSlugs.filter((slug) => {
      const record = getLibraryRecord(slug);
      return record != null && isEditorialDraftAccession(record);
    });
    if (nextSlugs.length !== batch.accessionSlugs.length) {
      changed = true;
      return {
        ...batch,
        accessionSlugs: nextSlugs,
        revisedAt: new Date().toISOString(),
      };
    }
    return batch;
  });

  if (!changed) return store;
  const next = { ...store, batches };
  writeEditorialBatchesStore(next);
  return next;
}

function findBatch(
  store: EditorialBatchesStore,
  batchId: string,
): EditorialBatchRecord | null {
  return store.batches.find((batch) => batch.id === batchId) ?? null;
}

export function getBatchIdForAccession(slug: string): string | null {
  const store = reconcileEditorialBatches();
  for (const batch of store.batches) {
    if (batch.accessionSlugs.includes(slug)) return batch.id;
  }
  return null;
}

export function listEligibleDraftSlugs(
  excludeBatchId?: string,
): LibraryRecord[] {
  const store = reconcileEditorialBatches();
  const claimed = new Set<string>();
  for (const batch of store.batches) {
    if (excludeBatchId && batch.id === excludeBatchId) continue;
    for (const slug of batch.accessionSlugs) claimed.add(slug);
  }

  return getAllLibraryRecords()
    .filter(isEditorialDraftAccession)
    .filter((record) => !claimed.has(record.slug))
    .sort(
      (a, b) =>
        Date.parse(b.filedAt) - Date.parse(a.filedAt) ||
        a.title.localeCompare(b.title),
    );
}

function toAccessionRow(
  record: LibraryRecord,
  notes: string[] = [],
): EditorialBatchAccessionRow {
  const fields = getEditorialBatchFieldStatuses(record);
  return {
    slug: record.slug,
    title: record.title,
    shelfMark: record.shelfMark ?? record.slug,
    href: `/workbench/accessions/${encodeURIComponent(record.slug)}`,
    publicHref:
      record.visibility === "published"
        ? `/library/${encodeURIComponent(record.slug)}`
        : null,
    fields,
    ready: accessionReady(fields),
    stewardshipEventCount: record.stewardshipHistory?.length ?? 0,
    observations: notes,
  };
}

function batchRecords(batch: EditorialBatchRecord): LibraryRecord[] {
  return batch.accessionSlugs
    .map((slug) => getLibraryRecord(slug))
    .filter((record): record is LibraryRecord => record != null)
    .filter(isEditorialDraftAccession);
}

function toSummary(batch: EditorialBatchRecord): EditorialBatchSummary {
  const records = batchRecords(batch);
  const review = buildEditorialBatchReview(records);
  const rows = records.map((record) =>
    toAccessionRow(record, review.accessionNotes[record.slug] ?? []),
  );

  const readyCount = rows.filter((row) => row.ready).length;
  const lead = review.observations[0]?.text;
  const readiness = readinessFor(rows.length, readyCount, lead);

  return {
    id: batch.id,
    name: batch.name,
    accessionCount: rows.length,
    createdAt: batch.createdAt,
    revisedAt: batch.revisedAt,
    readiness: readiness.kind,
    readinessLabel: readiness.label,
    readyCount,
    sizeNote: sizeNote(rows.length),
    href: `/workbench/batches/${encodeURIComponent(batch.id)}`,
    editorialTitle: batch.editorialTitle,
    editorialNote: batch.editorialNote,
  };
}

export function listEditorialBatchSummaries(): EditorialBatchSummary[] {
  const store = reconcileEditorialBatches();
  return store.batches
    .map(toSummary)
    .sort(
      (a, b) =>
        Date.parse(b.revisedAt) - Date.parse(a.revisedAt) ||
        a.name.localeCompare(b.name),
    );
}

export function getEditorialBatchDetail(
  batchId: string,
): EditorialBatchDetail | null {
  const store = reconcileEditorialBatches();
  const batch = findBatch(store, batchId);
  if (!batch) return null;

  const records = batchRecords(batch);
  const review = buildEditorialBatchReview(records);
  const summary = toSummary(batch);
  const accessions = records.map((record) =>
    toAccessionRow(record, review.accessionNotes[record.slug] ?? []),
  );

  const eligibleToAdd = listEligibleDraftSlugs(batchId).map((record) => ({
    slug: record.slug,
    title: record.title,
    shelfMark: record.shelfMark ?? record.slug,
  }));

  return {
    ...summary,
    accessions,
    eligibleToAdd,
    review,
  };
}

export function createEditorialBatch(name: string): EditorialBatchRecord {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("A batch requires a name.");

  const store = reconcileEditorialBatches();
  const now = new Date().toISOString();
  const batch: EditorialBatchRecord = {
    id: randomUUID(),
    name: trimmed,
    accessionSlugs: [],
    createdAt: now,
    revisedAt: now,
  };

  writeEditorialBatchesStore({
    ...store,
    batches: [...store.batches, batch],
  });
  return batch;
}

export function renameEditorialBatch(
  batchId: string,
  name: string,
): EditorialBatchRecord {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("A batch requires a name.");

  const store = reconcileEditorialBatches();
  const batch = findBatch(store, batchId);
  if (!batch) throw new Error("Editorial Batch not found.");

  const next: EditorialBatchRecord = {
    ...batch,
    name: trimmed,
    revisedAt: new Date().toISOString(),
  };

  writeEditorialBatchesStore({
    ...store,
    batches: store.batches.map((item) =>
      item.id === batchId ? next : item,
    ),
  });
  return next;
}

export function updateEditorialBatchIntroduction(
  batchId: string,
  input: { editorialTitle?: string; editorialNote?: string },
): EditorialBatchRecord {
  const store = reconcileEditorialBatches();
  const batch = findBatch(store, batchId);
  if (!batch) throw new Error("Editorial Batch not found.");

  const title = input.editorialTitle?.trim() ?? "";
  const note = input.editorialNote?.trim() ?? "";

  const next: EditorialBatchRecord = {
    ...batch,
    revisedAt: new Date().toISOString(),
  };

  if (title) next.editorialTitle = title;
  else delete next.editorialTitle;

  if (note) next.editorialNote = note;
  else delete next.editorialNote;

  writeEditorialBatchesStore({
    ...store,
    batches: store.batches.map((item) =>
      item.id === batchId ? next : item,
    ),
  });
  return next;
}

export function addAccessionsToBatch(
  batchId: string,
  slugs: string[],
): EditorialBatchRecord {
  const store = reconcileEditorialBatches();
  const batch = findBatch(store, batchId);
  if (!batch) throw new Error("Editorial Batch not found.");

  const unique = [...new Set(slugs.map((slug) => slug.trim()).filter(Boolean))];
  if (unique.length === 0) throw new Error("No accessions selected.");

  const claimedElsewhere = new Set<string>();
  for (const other of store.batches) {
    if (other.id === batchId) continue;
    for (const slug of other.accessionSlugs) claimedElsewhere.add(slug);
  }

  const current = new Set(batch.accessionSlugs);
  const toAdd: string[] = [];

  for (const slug of unique) {
    if (current.has(slug)) continue;
    if (claimedElsewhere.has(slug)) {
      throw new Error(
        `${slug} already belongs to another Editorial Batch.`,
      );
    }
    const record = getLibraryRecord(slug);
    if (!record || !isEditorialDraftAccession(record)) {
      throw new Error(
        `${slug} is not a filed Editorial Draft and cannot enter a batch.`,
      );
    }
    toAdd.push(slug);
  }

  if (toAdd.length === 0) {
    throw new Error("Those accessions are already in this batch.");
  }

  const nextCount = current.size + toAdd.length;
  if (nextCount > EDITORIAL_BATCH_SIZE.hardMax) {
    throw new Error(
      `A batch may hold at most ${EDITORIAL_BATCH_SIZE.hardMax} accessions. Bloodsoaked publishes curated collections, not bulk imports.`,
    );
  }

  const next: EditorialBatchRecord = {
    ...batch,
    accessionSlugs: [...batch.accessionSlugs, ...toAdd],
    revisedAt: new Date().toISOString(),
  };

  writeEditorialBatchesStore({
    ...store,
    batches: store.batches.map((item) =>
      item.id === batchId ? next : item,
    ),
  });
  return next;
}

export function removeAccessionsFromBatch(
  batchId: string,
  slugs: string[],
): EditorialBatchRecord {
  const store = reconcileEditorialBatches();
  const batch = findBatch(store, batchId);
  if (!batch) throw new Error("Editorial Batch not found.");

  const remove = new Set(slugs);
  const next: EditorialBatchRecord = {
    ...batch,
    accessionSlugs: batch.accessionSlugs.filter((slug) => !remove.has(slug)),
    revisedAt: new Date().toISOString(),
  };

  writeEditorialBatchesStore({
    ...store,
    batches: store.batches.map((item) =>
      item.id === batchId ? next : item,
    ),
  });
  return next;
}

export function deleteEditorialBatch(batchId: string): void {
  const store = reconcileEditorialBatches();
  if (!findBatch(store, batchId)) throw new Error("Editorial Batch not found.");
  writeEditorialBatchesStore({
    ...store,
    batches: store.batches.filter((batch) => batch.id !== batchId),
  });
}

/**
 * Publish every draft in the batch that can be published.
 * Failures leave that accession in the batch; successes are removed.
 */
export function publishEditorialBatch(batchId: string): PublishBatchResult {
  const store = reconcileEditorialBatches();
  const batch = findBatch(store, batchId);
  if (!batch) throw new Error("Editorial Batch not found.");

  const published: string[] = [];
  const failed: Array<{ slug: string; message: string }> = [];
  const remaining: string[] = [];
  const now = new Date().toISOString();

  for (const slug of batch.accessionSlugs) {
    try {
      const record = getLibraryRecord(slug);
      if (!record) {
        failed.push({ slug, message: "Accession not found." });
        continue;
      }
      if (record.visibility === "published") {
        published.push(slug);
        continue;
      }
      if (!isEditorialDraftAccession(record)) {
        failed.push({
          slug,
          message: "Not an Editorial Draft — left unpublished.",
        });
        remaining.push(slug);
        continue;
      }

      const introParts = [
        batch.editorialTitle?.trim(),
        batch.editorialNote?.trim(),
      ].filter(Boolean);
      const introNote =
        introParts.length > 0
          ? ` ${introParts.join(" — ")}`
          : "";

      let next = appendStewardshipEvent(record, {
        kind: "published",
        at: now,
        summary: "Published to the Bloodsoaked Library",
        note: `Published with Editorial Batch “${batch.name}”.${introNote}`,
        id: `published-${now}-${slug}`,
      });

      next = {
        ...next,
        status: "catalogued",
        visibility: "published",
        curatorialRevisionAt: now,
      };

      writeLibraryRecord(next);
      published.push(slug);
    } catch (err) {
      failed.push({
        slug,
        message: err instanceof Error ? err.message : "Publication failed.",
      });
      remaining.push(slug);
    }
  }

  // Keep only accessions that did not publish.
  const stillDraft = batch.accessionSlugs.filter(
    (slug) => !published.includes(slug),
  );

  writeEditorialBatchesStore({
    ...store,
    batches: store.batches.map((item) =>
      item.id === batchId
        ? {
            ...item,
            accessionSlugs: stillDraft,
            revisedAt: now,
          }
        : item,
    ),
  });

  rebuildLibraryCatalogIndex();
  rebuildAuthorityCatalogIndex();

  return { published, remaining: stillDraft, failed };
}

/** Neighbors within a batch for quiet accession-to-accession navigation. */
export function getBatchNeighbors(
  slug: string,
): { batchId: string; batchName: string; previous: string | null; next: string | null } | null {
  const store = reconcileEditorialBatches();
  for (const batch of store.batches) {
    const index = batch.accessionSlugs.indexOf(slug);
    if (index < 0) continue;
    return {
      batchId: batch.id,
      batchName: batch.name,
      previous: index > 0 ? batch.accessionSlugs[index - 1]! : null,
      next:
        index < batch.accessionSlugs.length - 1
          ? batch.accessionSlugs[index + 1]!
          : null,
    };
  }
  return null;
}
