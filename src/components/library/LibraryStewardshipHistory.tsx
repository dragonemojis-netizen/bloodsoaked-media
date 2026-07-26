import { LibraryAccessionPanel } from "@/components/library/LibraryAccessionPanel";
import { libraryVoice } from "@/config/library-voice";
import { formatLibraryFiledDate } from "@/lib/library";
import type { LibraryEntry, LibraryStewardshipEvent } from "@/types/library";

interface LibraryStewardshipHistoryProps {
  entry: LibraryEntry;
}

/**
 * Stewardship History — archival chronology of the record itself.
 * Oldest first. Never a software activity feed.
 */
export function LibraryStewardshipHistory({
  entry,
}: LibraryStewardshipHistoryProps) {
  const events = entry.stewardshipHistory;
  if (!events.length) return null;

  return (
    <LibraryAccessionPanel
      id="stewardship-history"
      eyebrow={libraryVoice.record.stewardshipHistoryEyebrow}
    >
      <p className="library-stewardship-lead">
        {libraryVoice.record.stewardshipHistoryLead}
      </p>
      <ol className="library-stewardship-chronology">
        {events.map((event) => (
          <StewardshipEntry key={event.id} event={event} />
        ))}
      </ol>
    </LibraryAccessionPanel>
  );
}

function StewardshipEntry({ event }: { event: LibraryStewardshipEvent }) {
  return (
    <li className="library-stewardship-entry">
      <time dateTime={event.at} className="library-stewardship-date">
        {formatLibraryFiledDate(event.at)}
      </time>
      <div className="library-stewardship-body">
        <p className="library-stewardship-summary">{event.summary}</p>
        {event.note ? (
          <p className="library-stewardship-note">{event.note}</p>
        ) : null}
      </div>
    </li>
  );
}
