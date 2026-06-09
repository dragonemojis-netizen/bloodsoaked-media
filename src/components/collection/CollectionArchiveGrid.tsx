import { publication } from "@/config/publication";
import type { CollectionArchiveEntry } from "@/lib/collection-archive";
import { CollectionArtifactCard } from "./CollectionArtifactCard";

interface CollectionArchiveGridProps {
  entries: CollectionArchiveEntry[];
}

export function CollectionArchiveGrid({ entries }: CollectionArchiveGridProps) {
  if (entries.length === 0) return null;

  return (
    <section
      aria-labelledby="collection-grid-heading"
      className="collection-grid-section"
    >
      <header className="collection-grid-header mb-8 border-b border-border-subtle pb-6">
        <h2
          id="collection-grid-heading"
          className="font-mono text-[0.68rem] uppercase tracking-[0.28em] text-foreground-muted"
        >
          {publication.collectionGridEyebrow}
        </h2>
        <p className="collection-grid-lead mt-4 max-w-2xl font-serif text-base italic leading-relaxed text-foreground-muted md:text-lg">
          {publication.collectionGridDescription}
        </p>
      </header>

      <ul
        className="collection-catalog-shelf grid gap-6 sm:grid-cols-2"
        role="list"
      >
        {entries.map((entry) => (
          <li key={entry.id}>
            <CollectionArtifactCard entry={entry} />
          </li>
        ))}
      </ul>
    </section>
  );
}
