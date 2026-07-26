/**
 * Archive Workbench — read model for the curator operations room.
 *
 * Aggregates Collection + Library holdings into quiet stewardship views.
 * Does not invent scores with AI — readiness uses deterministic rules only.
 */

import fs from "fs";
import path from "path";
import { getAllCollectionArchiveRecords, getCollectionArchiveRecord } from "@/lib/collection-archive";
import { getAllLibraryRecords, getLibraryRecord } from "@/lib/library";
import { readWorkbenchState } from "@/lib/workbench-state";
import type { CollectionArchiveRecord } from "@/types/collection-archive";
import type { LibraryRecord } from "@/types/library";

export interface WorkbenchHoldingsOverview {
  totalHoldings: number;
  pipeline: number;
  filed: number;
  inProgress: number;
  published: number;
}

export type WorkbenchLane = "pipeline" | "filed" | "published" | "in-progress";

export interface WorkbenchHoldingRow {
  id: string;
  title: string;
  importDate: string | null;
  playtimeMinutes: number;
  playtimeLabel: string;
  lastPlayedAt: string | null;
  status: string;
  lane: WorkbenchLane;
  starred: boolean;
  steamAppId?: number;
  librarySlug?: string;
  shelfMark?: string;
}

export interface WorkbenchEditorialNeed {
  id: string;
  label: string;
  needed: boolean;
}

export interface WorkbenchEditorialRow {
  slug: string;
  title: string;
  shelfMark: string;
  filedAt: string;
  href: string;
  publicHref: string | null;
  needs: WorkbenchEditorialNeed[];
}

export interface WorkbenchActivityEvent {
  id: string;
  at: string;
  kind: "filed" | "steam-sync" | "published" | "updated";
  headline: string;
  detail?: string;
}

export interface WorkbenchSearchResult {
  id: string;
  title: string;
  kind: "collection" | "library";
  lane: WorkbenchLane;
  href: string;
  meta: string;
}

function daysSince(iso: string | null | undefined, now = Date.now()): number | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return null;
  return (now - t) / (1000 * 60 * 60 * 24);
}

export function formatPlaytime(minutes: number): string {
  if (!minutes || minutes <= 0) return "Unplayed";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rem = minutes % 60;
  if (hours < 100) {
    return rem > 0 ? `${hours}h ${rem}m` : `${hours}h`;
  }
  return `${hours}h`;
}

function collectionLane(record: CollectionArchiveRecord): WorkbenchLane {
  if (record.status === "Filed" || record.filing?.librarySlug) return "filed";
  if (record.status === "Pipeline") return "pipeline";
  return "pipeline";
}

function libraryLane(record: LibraryRecord): WorkbenchLane {
  if (record.visibility === "published") return "published";
  if (record.status === "in-progress") return "in-progress";
  return "filed";
}

function buildReferencedCollectionIds(library: LibraryRecord[]): Set<string> {
  const ids = new Set<string>();
  for (const record of library) {
    for (const id of record.connections?.collectionIds ?? []) {
      ids.add(id);
    }
    if (record.accession?.sourceReference) {
      ids.add(record.accession.sourceReference);
    }
  }
  return ids;
}

/**
 * Deterministic readiness weight — higher means sooner to file.
 * Rules (additive): playtime, recent play, recent import, referenced, starred.
 */
export function readinessWeight(
  record: CollectionArchiveRecord,
  {
    starred,
    referenced,
    now = Date.now(),
  }: { starred: boolean; referenced: boolean; now?: number },
): number {
  let weight = 0;
  const play = record.steam?.playtimeMinutes ?? 0;
  weight += Math.min(play, 12_000);

  const playedDays = daysSince(record.steam?.lastPlayedAt, now);
  if (playedDays != null) {
    if (playedDays <= 14) weight += 5_000;
    else if (playedDays <= 60) weight += 2_000;
    else if (playedDays <= 180) weight += 500;
  }

  const importDays = daysSince(record.catalogued, now);
  if (importDays != null) {
    if (importDays <= 7) weight += 1_500;
    else if (importDays <= 30) weight += 500;
  }

  if (referenced) weight += 3_000;
  if (starred) weight += 8_000;

  return weight;
}

export function getWorkbenchOverview(): WorkbenchHoldingsOverview {
  const collection = getAllCollectionArchiveRecords().filter(
    (r) => r.origin !== "development",
  );
  const library = getAllLibraryRecords();

  return {
    totalHoldings: collection.length,
    pipeline: collection.filter((r) => r.status === "Pipeline").length,
    filed: collection.filter((r) => r.status === "Filed").length,
    inProgress: library.filter((r) => r.status === "in-progress").length,
    published: library.filter((r) => r.visibility === "published").length,
  };
}

function toHoldingRow(
  record: CollectionArchiveRecord,
  starredIds: Set<string>,
  libraryByCollection: Map<string, LibraryRecord>,
): WorkbenchHoldingRow {
  const linked =
    libraryByCollection.get(record.id) ??
    (record.filing?.librarySlug
      ? getLibraryRecord(record.filing.librarySlug) ?? undefined
      : undefined);

  return {
    id: record.id,
    title: record.title,
    importDate: record.catalogued ?? null,
    playtimeMinutes: record.steam?.playtimeMinutes ?? 0,
    playtimeLabel: formatPlaytime(record.steam?.playtimeMinutes ?? 0),
    lastPlayedAt: record.steam?.lastPlayedAt ?? null,
    status: record.status,
    lane: collectionLane(record),
    starred: starredIds.has(record.id),
    steamAppId: record.steam?.appId,
    librarySlug: record.filing?.librarySlug ?? linked?.slug,
    shelfMark: record.filing?.shelfMark ?? linked?.shelfMark,
  };
}

/** Recently imported Steam holdings — newest first. */
export function getRecentSteamAcquisitions(limit = 12): WorkbenchHoldingRow[] {
  const starred = new Set(readWorkbenchState().starredIds);
  const library = getAllLibraryRecords();
  const byCollection = new Map<string, LibraryRecord>();
  for (const entry of library) {
    if (entry.accession?.sourceReference) {
      byCollection.set(entry.accession.sourceReference, entry);
    }
  }

  return getAllCollectionArchiveRecords()
    .filter((r) => r.origin === "steam")
    .sort(
      (a, b) =>
        Date.parse(b.catalogued) - Date.parse(a.catalogued) ||
        a.title.localeCompare(b.title),
    )
    .slice(0, limit)
    .map((r) => toHoldingRow(r, starred, byCollection));
}

/** Pipeline holdings ranked for filing — deterministic readiness. */
export function getReadyToFile(limit = 16): WorkbenchHoldingRow[] {
  const starred = new Set(readWorkbenchState().starredIds);
  const library = getAllLibraryRecords();
  const referenced = buildReferencedCollectionIds(library);
  const byCollection = new Map<string, LibraryRecord>();
  for (const entry of library) {
    if (entry.accession?.sourceReference) {
      byCollection.set(entry.accession.sourceReference, entry);
    }
  }

  const now = Date.now();
  return getAllCollectionArchiveRecords()
    .filter((r) => r.status === "Pipeline" && r.origin !== "development")
    .map((record) => ({
      record,
      weight: readinessWeight(record, {
        starred: starred.has(record.id),
        referenced: referenced.has(record.id),
        now,
      }),
    }))
    .sort((a, b) => {
      if (b.weight !== a.weight) return b.weight - a.weight;
      return a.record.title.localeCompare(b.record.title);
    })
    .slice(0, limit)
    .map(({ record }) => toHoldingRow(record, starred, byCollection));
}

function preservationHasContent(
  preservation: LibraryRecord["preservation"],
): boolean {
  if (!preservation) return false;
  return Object.values(preservation).some(
    (value) => typeof value === "string" && value.trim().length > 0,
  );
}

function connectionsNeedWork(record: LibraryRecord): boolean {
  const c = record.connections;
  if (!c) return true;
  const hasSeries = Boolean(c.series?.trim());
  const hasRelated = (c.relatedEntrySlugs?.length ?? 0) > 0;
  const hasMedia = Boolean(c.mediaLogSlug?.trim());
  const hasArticles = (c.articleSlugs?.length ?? 0) > 0;
  // collectionIds alone (auto-linked on filing) do not count as editorial work.
  return !(hasSeries || hasRelated || hasMedia || hasArticles);
}

function coverNeedsVerification(record: LibraryRecord): boolean {
  if (!record.coverImage?.trim()) return true;
  // Steam-sourced paths are provisional until the curator verifies or replaces them.
  return record.coverImage.includes("/images/collection/steam/");
}

/** Library entries still in editorial progress. */
export function getEditorialWork(): WorkbenchEditorialRow[] {
  return getAllLibraryRecords()
    .filter(
      (r) =>
        r.status === "in-progress" ||
        (r.visibility === "hidden" && r.status !== "archived"),
    )
    .sort(
      (a, b) =>
        Date.parse(b.filedAt) - Date.parse(a.filedAt) ||
        a.title.localeCompare(b.title),
    )
    .map((record) => {
      const needs: WorkbenchEditorialNeed[] = [
        {
          id: "curator-notes",
          label: "Curator Notes",
          needed: !record.curatorNotes?.trim(),
        },
        {
          id: "preservation-notes",
          label: "Preservation Notes",
          needed: !preservationHasContent(record.preservation),
        },
        {
          id: "collection-documentation",
          label: "Collection Documentation",
          needed: !record.collectionNotes?.trim(),
        },
        {
          id: "connections",
          label: "Connections",
          needed: connectionsNeedWork(record),
        },
        {
          id: "cover-verification",
          label: "Cover Artwork",
          needed: coverNeedsVerification(record),
        },
      ];

      return {
        slug: record.slug,
        title: record.title,
        shelfMark: record.shelfMark ?? record.slug,
        filedAt: record.filedAt,
        href: `/workbench/accessions/${record.slug}`,
        publicHref:
          record.visibility === "published" ? `/library/${record.slug}` : null,
        needs,
      };
    });
}

function readSteamSyncState(): {
  lastSyncedAt: string | null;
  recordsCreated?: number;
  ownedFetched?: number;
} | null {
  const filePath = path.join(
    process.cwd(),
    "content",
    "collection",
    "steam",
    "sync-state.json",
  );
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as {
    lastSyncedAt: string | null;
    recordsCreated?: number;
    ownedFetched?: number;
  };
}

/** Quiet archival logbook of recent events. */
export function getRecentActivity(limit = 20): WorkbenchActivityEvent[] {
  const events: WorkbenchActivityEvent[] = [];

  const sync = readSteamSyncState();
  if (sync?.lastSyncedAt) {
    const count = sync.recordsCreated ?? sync.ownedFetched ?? 0;
    events.push({
      id: `steam-sync-${sync.lastSyncedAt}`,
      at: sync.lastSyncedAt,
      kind: "steam-sync",
      headline: "Steam acquisition",
      detail: count > 0 ? `+${count} holdings reconciled` : "Library reconciled",
    });
  }

  for (const record of getAllCollectionArchiveRecords()) {
    if (record.filing?.filedAt) {
      events.push({
        id: `filed-${record.id}-${record.filing.filedAt}`,
        at: record.filing.filedAt,
        kind: "filed",
        headline: "Filed",
        detail: record.title,
      });
    }
  }

  for (const record of getAllLibraryRecords()) {
    if (record.visibility === "published") {
      events.push({
        id: `published-${record.slug}-${record.filedAt}`,
        at: record.curatorialRevisionAt ?? record.filedAt,
        kind: "published",
        headline: "Published",
        detail: record.title,
      });
    }
    if (
      record.curatorialRevisionAt &&
      record.curatorialRevisionAt !== record.filedAt
    ) {
      events.push({
        id: `updated-${record.slug}-${record.curatorialRevisionAt}`,
        at: record.curatorialRevisionAt,
        kind: "updated",
        headline: "Updated",
        detail: "Curator Notes",
      });
    }
  }

  return events
    .sort((a, b) => Date.parse(b.at) - Date.parse(a.at))
    .slice(0, limit);
}

/** Universal workbench search across holdings and accessions. */
export function searchWorkbench(query: string, limit = 24): WorkbenchSearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const results: WorkbenchSearchResult[] = [];
  const starred = new Set(readWorkbenchState().starredIds);

  for (const record of getAllCollectionArchiveRecords()) {
    if (record.origin === "development") continue;
    const haystack = [
      record.id,
      record.title,
      record.filing?.shelfMark,
      record.filing?.librarySlug,
      record.steam?.appId != null ? String(record.steam.appId) : "",
      record.steam?.title,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    if (!haystack.includes(q)) continue;

    const lane = collectionLane(record);
    results.push({
      id: record.id,
      title: record.title,
      kind: "collection",
      lane,
      href: `/workbench/holdings/${encodeURIComponent(record.id)}`,
      meta: [
        lane === "pipeline"
          ? "Pipeline"
          : lane === "filed"
            ? "Filed"
            : "Holding",
        record.steam?.appId != null
          ? `Steam App ${record.steam.appId}`
          : null,
        starred.has(record.id) ? "Set aside" : null,
      ]
        .filter(Boolean)
        .join(" · "),
    });
  }

  for (const record of getAllLibraryRecords()) {
    const haystack = [
      record.slug,
      record.title,
      record.shelfMark,
      record.steam?.appId != null ? String(record.steam.appId) : "",
      record.accession?.sourceReference,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    if (!haystack.includes(q)) continue;

    const lane = libraryLane(record);
    results.push({
      id: record.slug,
      title: record.title,
      kind: "library",
      lane,
      href: `/workbench/accessions/${encodeURIComponent(record.slug)}`,
      meta: [
        lane === "published"
          ? "Published"
          : lane === "in-progress"
            ? "Editorial Draft"
            : "Filed",
        record.shelfMark ?? null,
      ]
        .filter(Boolean)
        .join(" · "),
    });
  }

  return results.slice(0, limit);
}

export function getWorkbenchHolding(
  id: string,
): (WorkbenchHoldingRow & { record: CollectionArchiveRecord }) | null {
  const record = getCollectionArchiveRecord(id);
  if (!record) return null;
  const starred = new Set(readWorkbenchState().starredIds);
  const library = getAllLibraryRecords();
  const byCollection = new Map<string, LibraryRecord>();
  for (const entry of library) {
    if (entry.accession?.sourceReference) {
      byCollection.set(entry.accession.sourceReference, entry);
    }
  }
  return {
    ...toHoldingRow(record, starred, byCollection),
    record,
  };
}
