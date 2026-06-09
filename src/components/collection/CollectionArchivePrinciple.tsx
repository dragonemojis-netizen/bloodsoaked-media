import { publication } from "@/config/publication";

/** Permanent Collection inscription — fixed copy, not tied to archive size or featured specimen. */
export function CollectionArchivePrinciple() {
  return (
    <section
      aria-labelledby="collection-archive-principle-heading"
      className="collection-archive-principle"
    >
      <p className="collection-archive-principle-eyebrow font-mono text-[0.56rem] uppercase tracking-[0.26em] text-foreground-muted/80">
        {publication.collectionArchivePrincipleEyebrow}
      </p>
      <blockquote
        id="collection-archive-principle-heading"
        className="collection-archive-principle-inscription mt-3 font-serif text-base italic leading-[1.72] text-foreground-muted/90 md:text-lg"
      >
        {publication.collectionArchivePrinciple}
      </blockquote>
    </section>
  );
}
