import {
  formatMediaLogAction,
  formatMediaLogStatus,
  formatPlatinumLabel,
  getMediaLogReplayPhrase,
  getMediaLogStatusModifier,
} from "@/lib/media-log-display";
import type { MediaLogEntry } from "@/types/media-log";

interface MediaLogStatusBadgeProps {
  entry: MediaLogEntry;
  /** Show full action line (STATUS · TYPE) or status label only */
  variant?: "action" | "status";
  className?: string;
}

export function MediaLogStatusBadge({
  entry,
  variant = "action",
  className = "",
}: MediaLogStatusBadgeProps) {
  const modifier = getMediaLogStatusModifier(entry.status, entry);
  const replayPhrase = getMediaLogReplayPhrase(entry);
  const display =
    variant === "action"
      ? formatMediaLogAction(entry.status, entry.mediaType, entry)
      : formatMediaLogStatus(entry.status);

  return (
    <span className={`inline-flex flex-wrap items-center gap-2 ${className}`}>
      <span
        className={`media-log-status ${modifier}`}
        title={replayPhrase ?? undefined}
      >
        {display}
      </span>
      {entry.platinumNumber != null && (
        <span className="media-log-platinum-tag">
          {formatPlatinumLabel(entry.platinumNumber)}
        </span>
      )}
      {replayPhrase && variant === "status" && (
        <span className="media-log-replay-phrase">{replayPhrase}</span>
      )}
    </span>
  );
}
