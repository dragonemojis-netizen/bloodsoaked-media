import type { MediaLogEntry, MediaLogStatus, MediaLogType } from "@/types/media-log";

const statusLabels: Record<MediaLogStatus, string> = {
  started: "Started",
  finished: "Finished",
  replayed: "Replayed",
  platinum: "Platinum Achieved",
  rewatched: "Rewatched",
  listened: "Listened",
  read: "Read",
  abandoned: "Abandoned",
  completed: "Finished",
  reading: "Read",
};

/** Secondary shelf phrase for replay-family entries */
const replayPhrases: Partial<Record<MediaLogStatus, string>> = {
  replayed: "Returned to the Shelf",
  platinum: "Returned to the Shelf",
};

export function formatMediaLogStatus(status: MediaLogStatus): string {
  return statusLabels[status];
}

export function getMediaLogStatusModifier(
  status: MediaLogStatus,
  entry?: Pick<MediaLogEntry, "isReplay" | "platinumNumber">,
): string {
  const base = status === "completed" ? "finished" : status === "reading" ? "read" : status;
  if (entry?.platinumNumber != null) return "media-log-status--platinum";
  if (entry?.isReplay || base === "replayed") return "media-log-status--replayed";
  return `media-log-status--${base}`;
}

export function formatMediaLogAction(
  status: MediaLogStatus,
  mediaType: MediaLogType,
  options?: Pick<MediaLogEntry, "isReplay" | "platinumNumber">,
): string {
  const label = statusLabels[status];
  const type = mediaType.toUpperCase();

  if (status === "platinum" && options?.isReplay) {
    return `${label} · REPLAY`;
  }

  return `${label} · ${type}`;
}

export function formatPlatinumLabel(platinumNumber: number): string {
  return `Platinum #${platinumNumber}`;
}

export function getMediaLogReplayPhrase(
  entry: Pick<MediaLogEntry, "status" | "isReplay" | "platinumNumber">,
): string | null {
  if (entry.platinumNumber != null && entry.isReplay) {
    return replayPhrases.platinum ?? null;
  }
  if (entry.status === "replayed" || entry.isReplay) {
    return replayPhrases.replayed ?? null;
  }
  if (entry.status === "platinum" && entry.isReplay) {
    return replayPhrases.platinum ?? null;
  }
  return null;
}

export function isReplayEntry(
  entry: Pick<MediaLogEntry, "status" | "isReplay">,
): boolean {
  return entry.status === "replayed" || entry.isReplay === true;
}
