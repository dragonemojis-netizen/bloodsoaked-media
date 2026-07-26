import { LibraryAccessionPanel } from "@/components/library/LibraryAccessionPanel";
import { LibraryFieldList } from "@/components/library/LibraryFieldList";
import { libraryFields, libraryVoice } from "@/config/library-voice";
import type { LibraryEntry } from "@/types/library";

interface LibraryPreservationPanelProps {
  entry: LibraryEntry;
  prepareEmpty?: boolean;
}

export function LibraryPreservationPanel({
  entry,
  prepareEmpty = false,
}: LibraryPreservationPanelProps) {
  const notes = entry.preservation;

  const rows = [
    { label: libraryFields.playableOn, value: notes?.playableOn ?? "" },
    {
      label: libraryFields.originalHardware,
      value: notes?.originalHardware ?? "",
    },
    { label: libraryFields.compatibility, value: notes?.compatibility ?? "" },
    { label: libraryFields.concerns, value: notes?.concerns ?? "" },
    {
      label: libraryFields.knownRevisions,
      value: notes?.knownRevisions ?? "",
    },
    { label: libraryFields.availability, value: notes?.availability ?? "" },
  ].filter((row) => row.value.trim().length > 0);

  if (rows.length === 0 && !prepareEmpty) return null;

  return (
    <LibraryAccessionPanel
      id="preservation-notes"
      eyebrow={libraryVoice.record.preservationNotesEyebrow}
    >
      {rows.length > 0 ? (
        <LibraryFieldList rows={rows} />
      ) : (
        <p className="library-editorial-awaiting">
          {libraryVoice.record.editorialAwaiting.preservationNotes}
        </p>
      )}
    </LibraryAccessionPanel>
  );
}
