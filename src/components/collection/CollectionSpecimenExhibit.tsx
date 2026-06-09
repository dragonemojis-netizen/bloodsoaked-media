import { publication } from "@/config/publication";
import {
  getEventNarrative,
  getSpecimenTitle,
  type CollectionArchiveEntry,
} from "@/lib/collection-archive";
import {
  CollectionCuratorAnnotationFiling,
  CollectionCuratorAnnotationPlacard,
  CollectionCuratorAnnotationProvider,
} from "./CollectionCuratorAnnotation";
import { CollectionProvenanceRecord } from "./CollectionProvenanceRecord";
import {
  CollectionSpecimenCuratorPending,
  CollectionSpecimenExhibitBody,
} from "./CollectionSpecimenExhibitBody";

interface CollectionSpecimenExhibitProps {
  entry: CollectionArchiveEntry;
  solo?: boolean;
}

export function CollectionSpecimenExhibit({
  entry,
  solo = false,
}: CollectionSpecimenExhibitProps) {
  const title = getSpecimenTitle(entry);
  const storyLead = getEventNarrative(entry.eventType);

  const provenanceFold = (
    <details className="collection-provenance-fold group border-t border-border-subtle">
      <summary className="collection-provenance-fold-trigger cursor-pointer list-none px-6 py-5 font-mono text-[0.58rem] uppercase tracking-[0.2em] text-foreground-muted transition-colors hover:text-accent-bright md:px-10">
        <span className="collection-provenance-fold-label">
          {publication.collectionProvenanceFoldLabel}
        </span>
      </summary>
      <div className="collection-specimen-provenance border-t border-border-subtle">
        <CollectionProvenanceRecord entry={entry} />
      </div>
    </details>
  );

  return (
    <section
      aria-labelledby="collection-specimen-heading"
      className={`collection-specimen-exhibit ${solo ? "collection-specimen-exhibit--solo" : ""}`}
    >
      <article className="collection-specimen-case vault-plaque border border-border bg-background-panel/70">
        {entry.notes ? (
          <CollectionCuratorAnnotationProvider
            notes={entry.notes}
            specimenTitle={title}
          >
            <CollectionSpecimenExhibitBody
              entry={entry}
              title={title}
              storyLead={storyLead}
              curatorSlot={<CollectionCuratorAnnotationPlacard />}
            />
            <CollectionCuratorAnnotationFiling />
            {provenanceFold}
          </CollectionCuratorAnnotationProvider>
        ) : (
          <>
            <CollectionSpecimenExhibitBody
              entry={entry}
              title={title}
              storyLead={storyLead}
              curatorSlot={<CollectionSpecimenCuratorPending />}
            />
            {provenanceFold}
          </>
        )}
      </article>
    </section>
  );
}
