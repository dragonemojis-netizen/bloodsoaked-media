import { LibraryAccessionPanel } from "@/components/library/LibraryAccessionPanel";
import { libraryVoice } from "@/config/library-voice";

interface LibraryProsePanelProps {
  id: string;
  eyebrow: string;
  body?: string;
  /** Quiet archival language when the section has no writing yet. */
  awaiting?: string;
  /** When true, show the awaiting placard instead of omitting the panel. */
  prepareEmpty?: boolean;
}

/**
 * Editorial prose panel — Curator Notes / Collection Documentation.
 * Not a review. Measured archival writing.
 */
export function LibraryProsePanel({
  id,
  eyebrow,
  body,
  awaiting,
  prepareEmpty = false,
}: LibraryProsePanelProps) {
  const hasBody = Boolean(body?.trim());
  if (!hasBody && !prepareEmpty) return null;

  return (
    <LibraryAccessionPanel id={id} eyebrow={eyebrow} tone="prose">
      {hasBody ? (
        <div className="library-prose whitespace-pre-line">{body}</div>
      ) : (
        <p className="library-editorial-awaiting">{awaiting}</p>
      )}
    </LibraryAccessionPanel>
  );
}

export function LibraryCuratorNotesPanel({
  body,
  prepareEmpty = false,
}: {
  body?: string;
  prepareEmpty?: boolean;
}) {
  return (
    <LibraryProsePanel
      id="curator-notes"
      eyebrow={libraryVoice.record.notesEyebrow}
      body={body}
      awaiting={libraryVoice.record.editorialAwaiting.curatorNotes}
      prepareEmpty={prepareEmpty}
    />
  );
}

export function LibraryCollectionNotesPanel({
  body,
  prepareEmpty = false,
}: {
  body?: string;
  prepareEmpty?: boolean;
}) {
  return (
    <LibraryProsePanel
      id="collection-notes"
      eyebrow={libraryVoice.record.collectionNotesEyebrow}
      body={body}
      awaiting={libraryVoice.record.editorialAwaiting.collectionDocumentation}
      prepareEmpty={prepareEmpty}
    />
  );
}
