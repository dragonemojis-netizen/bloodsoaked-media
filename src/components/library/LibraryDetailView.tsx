import { LibraryArtifactDocumentation } from "@/components/library/LibraryArtifactDocumentation";
import { LibraryArchiveColophon } from "@/components/library/LibraryArchiveColophon";
import { LibraryAcquisitionRecord } from "@/components/library/LibraryAcquisitionRecord";
import { LibraryCatalogPanel } from "@/components/library/LibraryCatalogPanel";
import { LibraryConnectionsPanel } from "@/components/library/LibraryConnectionsPanel";
import { LibraryCustodyPanel } from "@/components/library/LibraryCustodyPanel";
import { LibraryEntryHero } from "@/components/library/LibraryEntryHero";
import { LibraryPreservationPanel } from "@/components/library/LibraryPreservationPanel";
import {
  LibraryCollectionNotesPanel,
  LibraryCuratorNotesPanel,
} from "@/components/library/LibraryProsePanel";
import { LibraryStewardshipHistory } from "@/components/library/LibraryStewardshipHistory";
import type { LibraryEntry } from "@/types/library";

interface LibraryDetailViewProps {
  entry: LibraryEntry;
}

/** Editorial drafts prepare empty sections; published records omit vacant prose. */
function isEditorialDraft(entry: LibraryEntry): boolean {
  return entry.status === "in-progress" || entry.visibility === "hidden";
}

/**
 * Canonical Archive Entry template — museum accession record.
 *
 * Hero = title, shelf mark, editorial standing.
 * Acquisition Record = provenance (Steam and other digital sources).
 * Artifact Documentation = photographs of the preserved copy.
 * Hydrates exactly one filing (library-stewardship accessionLoadsOneEntry).
 */
export function LibraryDetailView({ entry }: LibraryDetailViewProps) {
  const draft = isEditorialDraft(entry);

  return (
    <article className="library-detail library-accession">
      <LibraryEntryHero entry={entry} />

      <div className="library-accession-body-stack mt-16 space-y-14 md:mt-20 md:space-y-16 lg:mt-24 lg:space-y-20">
        <div className="library-accession-ledgers grid gap-14 md:grid-cols-2 md:gap-x-16 md:gap-y-14 lg:gap-x-20">
          <LibraryCatalogPanel entry={entry} />
          <LibraryCustodyPanel entry={entry} />
        </div>

        <LibraryAcquisitionRecord entry={entry} />

        <LibraryCuratorNotesPanel
          body={entry.curatorNotes}
          prepareEmpty={draft}
        />
        <LibraryCollectionNotesPanel
          body={entry.collectionNotes}
          prepareEmpty={draft}
        />
        <LibraryPreservationPanel entry={entry} prepareEmpty={draft} />
        <LibraryConnectionsPanel entry={entry} prepareEmpty={draft} />
        <LibraryArtifactDocumentation entry={entry} />
        <LibraryStewardshipHistory entry={entry} />
        <LibraryArchiveColophon entry={entry} />
      </div>
    </article>
  );
}
