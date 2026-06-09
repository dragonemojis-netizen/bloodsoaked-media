import { publication } from "@/config/publication";

export function CollectionEmptyArchive() {
  return (
    <section
      aria-labelledby="collection-empty-heading"
      className="collection-empty-archive vault-plaque border border-border bg-background-panel/60 p-8 md:p-12"
    >
      <p className="font-mono text-[0.65rem] uppercase tracking-[0.28em] text-accent-bright">
        Archive Awaiting Filing
      </p>
      <h2
        id="collection-empty-heading"
        className="mt-3 font-serif text-2xl text-foreground md:text-3xl"
      >
        No artifacts on display
      </h2>
      <p className="section-lead mt-4 max-w-2xl text-foreground-muted leading-relaxed">
        {publication.collectionEmptyArchive}
      </p>
    </section>
  );
}
