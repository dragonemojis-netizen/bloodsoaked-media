import Link from "next/link";
import { CoverFrame } from "@/components/ui/CoverFrame";
import type { Collection } from "@/types/collection";

interface CollectionCardProps {
  collection: Collection;
}

export function CollectionCard({ collection }: CollectionCardProps) {
  const count = collection.items.length;

  return (
    <article className="group vhs-card museum-card">
      <Link href={`/collections/${collection.slug}`} className="block">
        <CoverFrame
          src={collection.coverImage}
          alt={collection.title}
          label="Collection"
          aspect="wide"
          className="vhs-hover-lift w-full"
          sizes="(max-width: 768px) 100vw, 400px"
        />
        <div className="mt-4 border-t border-border-subtle pt-4">
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-foreground-muted">
            {count} {count === 1 ? "entry" : "entries"} catalogued
          </p>
          <h2 className="mt-2 font-serif text-xl text-foreground transition-colors group-hover:text-accent-bright">
            {collection.title}
          </h2>
          <p className="mt-2 line-clamp-2 text-sm text-foreground-muted leading-relaxed">
            {collection.description}
          </p>
        </div>
      </Link>
    </article>
  );
}
