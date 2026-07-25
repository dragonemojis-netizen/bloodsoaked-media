import type { MediaLogEntry, MediaLogStatus, MediaLogType } from "@/types/media-log";
import {
  formatMediaLogAction as formatAction,
  formatMediaLogStatus as formatStatus,
} from "@/lib/media-log-display";

export function formatDate(date: string) {
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  const value = dateOnly
    ? new Date(
        Number(dateOnly[1]),
        Number(dateOnly[2]) - 1,
        Number(dateOnly[3]),
      )
    : new Date(date);

  return value.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** Date plus time when the frontmatter includes an ISO datetime (e.g. publish moment). */
export function formatPublishedAt(date: string) {
  if (!/T\d{2}:\d{2}/.test(date)) return formatDate(date);
  const d = new Date(date);
  return `${formatDate(date)} at ${d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })}`;
}

export function formatMediaLogDate(entry: Pick<MediaLogEntry, "date" | "logYear">) {
  if (entry.date) return formatDate(entry.date);
  if (entry.logYear) return String(entry.logYear);
  return null;
}

export function formatMediaLogStatus(status: MediaLogStatus): string {
  return formatStatus(status);
}

export function formatMediaLogAction(
  status: MediaLogStatus,
  mediaType: MediaLogType,
): string {
  return formatAction(status, mediaType);
}
