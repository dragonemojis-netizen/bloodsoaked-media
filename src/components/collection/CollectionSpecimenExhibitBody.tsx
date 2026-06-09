import { publication } from "@/config/publication";
import { site } from "@/config/site";
import { getCollectionImageDimensions } from "@/lib/collection-cover";
import {
  formatEventType,
  getEventNarrative,
  getSpecimenArtifactLabel,
  type CollectionArchiveEntry,
} from "@/lib/collection-archive";
import type { ReactNode } from "react";
import { CollectionArtifactFrame } from "./CollectionArtifactFrame";
import { CollectionEnrichmentPanel } from "./CollectionEnrichmentPanel";

interface CollectionSpecimenExhibitBodyProps {
  entry: CollectionArchiveEntry;
  title: string;
  storyLead: string;
  curatorSlot: ReactNode;
}

export function CollectionSpecimenExhibitBody({
  entry,
  title,
  storyLead,
  curatorSlot,
}: CollectionSpecimenExhibitBodyProps) {
  const dimensions = getCollectionImageDimensions(entry.coverImage);
  const artifactLabel = getSpecimenArtifactLabel(entry);

  return (
    <div className="collection-specimen-layout">
      <div className="collection-specimen-gallery">
        <div className="collection-specimen-chamber">
          <CollectionArtifactFrame
            src={entry.coverImage}
            alt={title}
            variant="exhibit"
            dimensions={dimensions}
            sizes="(max-width: 1024px) 100vw, 640px"
          />
        </div>
        <footer className="collection-specimen-label">
          <p className="font-mono text-[0.5rem] uppercase tracking-[0.16em] text-foreground-muted/55">
            {formatEventType(entry.eventType)}
            <span aria-hidden="true"> · </span>
            {publication.collectionArchiveRef} {entry.id}
          </p>
        </footer>
      </div>

      <div className="collection-specimen-placard">
        <div className="collection-specimen-placard-inner">
          <p className="collection-placard-eyebrow font-mono text-[0.54rem] uppercase tracking-[0.22em] text-foreground-muted/75">
            Specimen Documentation
          </p>
          <h2
            id="collection-specimen-heading"
            className="collection-placard-title mt-3 font-serif text-[1.75rem] leading-[1.1] text-foreground md:text-[2.15rem]"
          >
            {title}
          </h2>

          {artifactLabel && (
            <div className="collection-placard-artifact mt-4">
              <p className="font-mono text-[0.52rem] uppercase tracking-[0.2em] text-foreground-muted/75">
                {publication.collectionSpecimenArtifactEyebrow}
              </p>
              <p className="mt-2 font-serif text-base leading-snug text-foreground-muted md:text-lg">
                {artifactLabel}
              </p>
            </div>
          )}

          <p className="collection-placard-story mt-4 text-sm leading-[1.72] text-foreground-muted md:text-base">
            {storyLead}
          </p>

          <div className="collection-curator-voice mt-7 border-t border-border-subtle pt-6">
            <p className="font-mono text-[0.54rem] uppercase tracking-[0.2em] text-foreground-muted/80">
              {publication.collectionCuratorNoteEyebrow}
            </p>
            {curatorSlot}
          </div>

          <CollectionEnrichmentPanel entry={entry} />
        </div>
      </div>
    </div>
  );
}

export function CollectionSpecimenCuratorPending() {
  return (
    <>
      <p className="collection-curator-pending mt-4 text-sm italic leading-relaxed text-foreground-muted">
        {publication.collectionCuratorNotePending}
      </p>
      <p className="collection-curator-attribution mt-4 font-serif text-sm italic text-foreground-muted/90">
        — {site.curator}
      </p>
    </>
  );
}
