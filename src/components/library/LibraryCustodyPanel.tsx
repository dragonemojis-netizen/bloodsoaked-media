import { LibraryAccessionPanel } from "@/components/library/LibraryAccessionPanel";
import { LibraryFieldList } from "@/components/library/LibraryFieldList";
import { libraryFields, libraryVoice } from "@/config/library-voice";
import { formatLibraryFiledDate } from "@/lib/library";
import type { LibraryEntry } from "@/types/library";

interface LibraryCustodyPanelProps {
  entry: LibraryEntry;
}

export function LibraryCustodyPanel({ entry }: LibraryCustodyPanelProps) {
  const { custody } = entry;

  return (
    <LibraryAccessionPanel
      id="archival-status"
      eyebrow={libraryVoice.record.archivalStatusEyebrow}
    >
      <LibraryFieldList
        rows={[
          { label: libraryFields.owned, value: custody.owned ?? "" },
          { label: libraryFields.physical, value: custody.physical ?? "" },
          { label: libraryFields.condition, value: custody.condition ?? "" },
          { label: libraryFields.acquired, value: custody.acquired ?? "" },
          {
            label: libraryFields.filed,
            value: custody.filed ?? formatLibraryFiledDate(entry.filedAt),
          },
        ]}
      />
    </LibraryAccessionPanel>
  );
}
