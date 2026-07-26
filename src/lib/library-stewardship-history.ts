/**
 * Stewardship History — append-only chronology of an archival record.
 *
 * Records the life of the accession itself. Never destructive: prior events
 * are never edited or removed. Callers always receive a new record object.
 */

import { randomUUID } from "crypto";
import type {
  LibraryRecord,
  LibraryStewardshipEvent,
  LibraryStewardshipEventKind,
} from "@/types/library";
import { LIBRARY_STEWARDSHIP_EVENT_KINDS } from "@/types/library";

export interface StewardshipEventInput {
  kind: LibraryStewardshipEventKind;
  summary: string;
  note?: string;
  /** Defaults to now. */
  at?: string;
  /** Optional stable id; generated when omitted. */
  id?: string;
}

const DEFAULT_SUMMARIES: Record<LibraryStewardshipEventKind, string> = {
  filed: "Filed into the Library",
  "curator-notes-entered": "Curator Notes entered",
  "curator-notes-revised": "Curator Notes revised",
  "collection-documentation-entered": "Collection Documentation entered",
  "collection-documentation-revised": "Collection Documentation revised",
  "preservation-notes-entered": "Preservation Notes entered",
  "preservation-notes-revised": "Preservation Notes revised",
  "connections-established": "Connections established",
  "connections-revised": "Connections revised",
  "artifact-documentation-added": "Collection photography added",
  "cover-artwork-entered": "Official artwork entered",
  published: "Published to the Bloodsoaked Library",
  unpublished: "Withdrawn from the public shelf",
  "editorial-revision": "Editorial revision",
  "acquisition-reconciled": "Acquisition record reconciled",
};

export function stewardshipSummary(
  kind: LibraryStewardshipEventKind,
  override?: string,
): string {
  return override?.trim() || DEFAULT_SUMMARIES[kind];
}

export function createStewardshipEvent(
  input: StewardshipEventInput,
): LibraryStewardshipEvent {
  if (!LIBRARY_STEWARDSHIP_EVENT_KINDS.includes(input.kind)) {
    throw new Error(`Unknown stewardship event kind: ${input.kind}`);
  }
  const summary = stewardshipSummary(input.kind, input.summary);
  if (!summary) {
    throw new Error("Stewardship events require a summary");
  }

  const event: LibraryStewardshipEvent = {
    id: input.id?.trim() || randomUUID(),
    at: input.at ?? new Date().toISOString(),
    kind: input.kind,
    summary,
  };
  if (input.note?.trim()) event.note = input.note.trim();
  return event;
}

/**
 * Appends one event to the Stewardship History.
 * Never mutates prior events. Returns a new record object.
 */
export function appendStewardshipEvent(
  record: LibraryRecord,
  input: StewardshipEventInput,
): LibraryRecord {
  const event = createStewardshipEvent(input);
  const history = [...(record.stewardshipHistory ?? [])];

  if (history.some((existing) => existing.id === event.id)) {
    throw new Error(
      `Stewardship History already contains event id "${event.id}"`,
    );
  }

  history.push(event);
  return {
    ...record,
    stewardshipHistory: history,
  };
}

/** First event written when an accession is filed into the Library. */
export function createFilingStewardshipEvent({
  at,
  shelfMark,
  note,
}: {
  at: string;
  shelfMark?: string;
  note?: string;
}): LibraryStewardshipEvent {
  return createStewardshipEvent({
    kind: "filed",
    at,
    summary: "Filed into the Library",
    note:
      note ??
      (shelfMark
        ? `Accessioned as ${shelfMark}.`
        : "Accessioned into the permanent archive."),
    id: `filed-${at}`,
  });
}

/** Chronological order — oldest first, as a ledger reads. */
export function sortStewardshipHistory(
  events: LibraryStewardshipEvent[],
): LibraryStewardshipEvent[] {
  return [...events].sort((a, b) => {
    const byTime = Date.parse(a.at) - Date.parse(b.at);
    if (byTime !== 0) return byTime;
    return a.id.localeCompare(b.id);
  });
}
