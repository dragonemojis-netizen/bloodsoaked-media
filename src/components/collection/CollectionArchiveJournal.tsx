import { publication } from "@/config/publication";

/** Permanent archive journal inscription — fixed copy, not tied to entry count or dates. */
export function CollectionArchiveJournal() {
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
          {publication.collectionJournalSolo}
        </p>
      </div>
    </section>
  );
}
