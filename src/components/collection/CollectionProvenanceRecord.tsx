import { publication } from "@/config/publication";
import {
  formatAcquisitionStamp,
  formatCatalogueStamp,
  type CollectionArchiveEntry,
} from "@/lib/collection-archive";

interface CollectionProvenanceRecordProps {
  entry: CollectionArchiveEntry;
}

export function CollectionProvenanceRecord({
  entry,
}: CollectionProvenanceRecordProps) {
  const { provenance } = entry;
  const acquired = formatAcquisitionStamp(provenance.acquisitionDate);
  const catalogued = formatCatalogueStamp(provenance.cataloguedDate);

  const timeline = [
    acquired && `${publication.collectionAcquiredStamp} ${acquired}`,
    `${publication.collectionCatalogueStamp} ${catalogued}`,
    provenance.sourceLabel,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <aside
      className="collection-provenance-record"
      aria-label="Original filing record"
    >
      <p className="font-mono text-[0.56rem] uppercase tracking-[0.22em] text-foreground-muted/80">
        {publication.collectionProvenanceEyebrow}
      </p>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-foreground-muted/90">
        {publication.collectionProvenanceLead}
      </p>

      <p className="collection-provenance-timeline mt-5 font-mono text-[0.54rem] uppercase tracking-[0.1em] text-foreground-muted/70">
        {timeline}
      </p>

      {provenance.captionSnapshot && (
        <figure className="collection-provenance-fieldnote mt-6">
          <figcaption className="font-mono text-[0.52rem] uppercase tracking-[0.18em] text-foreground-muted/75">
            {publication.collectionFieldNoteEyebrow}
          </figcaption>
          <blockquote className="collection-provenance-caption mt-3 max-w-xl font-serif text-sm italic leading-relaxed text-foreground-muted">
            {provenance.captionSnapshot}
          </blockquote>
        </figure>
      )}

      {provenance.sourcePermalink && (
        <p className="mt-6">
          <a
            href={provenance.sourcePermalink}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[0.52rem] uppercase tracking-[0.12em] text-foreground-muted/70 transition-colors hover:text-accent-bright"
          >
            {publication.collectionViewSource}
          </a>
        </p>
      )}

      <p className="mt-5 font-mono text-[0.48rem] uppercase tracking-[0.1em] text-foreground-muted/45">
        {publication.collectionArchiveRef} {entry.id}
      </p>
    </aside>
  );
}
