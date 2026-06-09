import { publication } from "@/config/publication";
import {
  formatCatalogueStamp,
  type CollectionArchiveStats,
} from "@/lib/collection-archive";

interface CollectionArchiveJournalProps {
  stats: CollectionArchiveStats;
}

export function CollectionArchiveJournal({ stats }: CollectionArchiveJournalProps) {
  const { preservationProjects, lastCatalogued } = stats;

  const scopeNarrative = publication.collectionJournalSolo;

  const lastFiling = lastCatalogued
    ? formatCatalogueStamp(lastCatalogued)
    : null;

  return (
    <section
      aria-labelledby="collection-journal-heading"
      className="collection-archive-journal"
    >
      <h2
        id="collection-journal-heading"
        className="font-mono text-[0.68rem] uppercase tracking-[0.3em] text-foreground-muted"
      >
        {publication.collectionJournalEyebrow}
      </h2>

      <div className="collection-journal-body vault-plaque mt-6 border border-border bg-background-panel/45 px-6 py-8 md:px-10 md:py-9">
        <p className="vault-lead max-w-3xl whitespace-pre-line leading-relaxed text-foreground-muted">
          {scopeNarrative}
        </p>

        {preservationProjects > 0 && (
          <p className="mt-5 max-w-3xl text-sm leading-relaxed text-foreground-muted/90">
            {publication.collectionJournalPreservation(preservationProjects)}
          </p>
        )}

        {lastFiling && (
          <p className="collection-journal-stamp mt-6 font-mono text-[0.55rem] uppercase tracking-[0.14em] text-foreground-muted/65">
            {publication.collectionJournalLastFiling}
            <span aria-hidden="true"> · </span>
            {lastFiling}
          </p>
        )}
      </div>
    </section>
  );
}
