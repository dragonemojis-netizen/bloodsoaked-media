import { publication } from "@/config/publication";

/** Permanent curator introduction — fixed copy, not tied to archive size or entries. */
export function CollectionCuratorPreface() {
  return (
    <section
      aria-labelledby="collection-curator-preface-heading"
      className="collection-curator-preface vault-plaque max-w-2xl border border-border bg-background-panel/50 px-5 py-5 md:px-8 md:py-7"
    >
      <p className="font-mono text-[0.58rem] uppercase tracking-[0.26em] text-accent-bright/90">
        {publication.collectionCuratorPrefaceEyebrow}
      </p>
      <h2
        id="collection-curator-preface-heading"
        className="sr-only"
      >
        Curator introduction
      </h2>
      <p className="collection-curator-preface-body mt-3 whitespace-pre-line text-foreground-muted">
        {publication.collectionCuratorPreface}
      </p>
      <p className="collection-curator-signature mt-4 font-serif text-sm italic text-foreground/85">
        {publication.collectionCuratorPrefaceSignature}
      </p>
    </section>
  );
}
