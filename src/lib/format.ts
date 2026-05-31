import type { MediaLogEntry, MediaLogStatus, MediaLogType } from "@/types/media-log";
import {
  formatMediaLogAction as formatAction,
  formatMediaLogStatus as formatStatus,
} from "@/lib/media-log-display";

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
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
