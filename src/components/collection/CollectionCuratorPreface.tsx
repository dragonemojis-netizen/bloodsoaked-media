import { publication } from "@/config/publication";
import { site } from "@/config/site";

interface CollectionCuratorPrefaceProps {
  specimenCount: number;
}

export function CollectionCuratorPreface({
  specimenCount,
}: CollectionCuratorPrefaceProps) {
  const preface =
    specimenCount === 1
      ? publication.collectionCuratorPrefaceSolo
      : publication.collectionCuratorPrefaceSmall;

  return (
    <section
      aria-labelledby="collection-curator-preface-heading"
      className="collection-curator-preface vault-plaque border border-border bg-background-panel/50 px-6 py-8 md:px-10 md:py-10"
    >
      <p className="font-mono text-[0.62rem] uppercase tracking-[0.28em] text-accent-bright">
        {publication.collectionCuratorPrefaceEyebrow}
      </p>
      <h2
        id="collection-curator-preface-heading"
        className="sr-only"
      >
        Curator introduction
      </h2>
      <p className="collection-curator-preface-body vault-lead mt-5 max-w-3xl whitespace-pre-line leading-relaxed text-foreground-muted">
        {preface}
      </p>
      <p className="collection-curator-signature mt-6 font-serif text-base italic text-foreground/90">
        {specimenCount === 1
          ? publication.collectionCuratorPrefaceSignatureSolo
          : `— ${site.curator}, ${publication.collectionCuratorRole}`}
      </p>
    </section>
  );
}
