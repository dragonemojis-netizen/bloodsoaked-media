import { CoverFrame } from "@/components/ui/CoverFrame";
import type { Collection, CollectionItem } from "@/types/collection";
import { publication } from "@/config/publication";
import { formatDate } from "@/lib/format";

interface CollectionExhibitProps {
  collection: Collection;
}

function ExhibitItem({ item }: { item: CollectionItem }) {
  return (
    <li className="museum-item vhs-card border border-border bg-background-panel/60 p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
        <CoverFrame
          src={item.coverImage}
          alt={item.title}
          className="w-full shrink-0 sm:w-28"
        />
        <div className="min-w-0 flex-1">
          <h3 className="font-serif text-lg text-foreground">{item.title}</h3>
          <p className="mt-1 font-mono text-[0.6rem] uppercase tracking-[0.15em] text-foreground-muted">
            {[item.year, item.platform].filter(Boolean).join(" · ")}
          </p>
          {item.notes && (
            <p className="mt-3 text-sm text-foreground-muted leading-relaxed">
              {item.notes}
            </p>
          )}
        </div>
      </div>
    </li>
  );
}

export function CollectionExhibit({ collection }: CollectionExhibitProps) {
  return (
    <div>
      <div className="mb-12 border border-border bg-background-panel/50 p-6 md:p-10">
        <CoverFrame
          src={collection.coverImage}
          alt={collection.title}
          label="Collection"
          aspect="wide"
          className="mb-8 max-h-64 w-full md:max-h-80"
          sizes="(max-width: 768px) 100vw, 800px"
        />
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-accent-bright">
          {collection.items.length} entries · {publication.collectionsEyebrow}
        </p>
        <h1 className="mt-3 font-serif text-3xl text-foreground md:text-4xl">
          {collection.title}
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-foreground-muted leading-relaxed">
          {collection.description}
        </p>
        {collection.personalNote && (
          <blockquote className="mt-6 border-l-2 border-accent pl-5 font-serif italic text-foreground leading-relaxed">
            {collection.personalNote}
          </blockquote>
        )}
        {collection.catalogued && (
          <p className="mt-4 font-mono text-[0.55rem] uppercase tracking-[0.12em] text-foreground-muted/70">
            Catalogued {formatDate(collection.catalogued)}
          </p>
        )}
      </div>

      <section aria-labelledby="exhibit-items">
        <h2
          id="exhibit-items"
          className="mb-6 font-mono text-[0.7rem] uppercase tracking-[0.3em] text-foreground-muted"
        >
          On Display
        </h2>
        <ul className="grid gap-4 md:grid-cols-2" role="list">
          {collection.items.map((item) => (
            <ExhibitItem key={`${item.title}-${item.year ?? ""}`} item={item} />
          ))}
        </ul>
      </section>
    </div>
  );
}
