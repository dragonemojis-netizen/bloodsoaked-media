import {
  libraryAccessionSourceLabels,
  libraryFields,
  libraryVoice,
} from "@/config/library-voice";
import { formatLibraryFiledDate } from "@/lib/library";
import type { LibraryEntry } from "@/types/library";

interface LibraryArchiveColophonProps {
  entry: LibraryEntry;
}

/**
 * Closing museum-catalog note. Intentionally quiet and subordinate to the record.
 */
export function LibraryArchiveColophon({
  entry,
}: LibraryArchiveColophonProps) {
  const filed = entry.custody.filed ?? formatLibraryFiledDate(entry.filedAt);
  const revised = entry.curatorialRevisionAt
    ? formatLibraryFiledDate(entry.curatorialRevisionAt)
    : filed;

  const rows = [
    { label: libraryFields.archiveIdentifier, value: entry.shelfMark },
    { label: libraryFields.filed, value: filed },
    { label: libraryFields.lastCuratorialRevision, value: revised },
    ...(entry.accession
      ? [
          {
            label: libraryFields.accessionSource,
            value: libraryAccessionSourceLabels[entry.accession.source],
          },
        ]
      : []),
    { label: libraryFields.archivalStatus, value: entry.statusLabel },
  ];

  return (
    <footer className="library-archive-colophon" aria-label={libraryVoice.record.colophonLabel}>
      <p className="library-archive-colophon-label">
        {libraryVoice.record.colophonLabel}
      </p>
      <dl className="library-archive-colophon-list">
        {rows.map((row) => (
          <div key={row.label} className="library-archive-colophon-row">
            <dt>{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>
    </footer>
  );
}
