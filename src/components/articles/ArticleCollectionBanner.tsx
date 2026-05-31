import Link from "next/link";
import { publication } from "@/config/publication";
import type { Collection } from "@/types/collection";

interface ArticleCollectionBannerProps {
  collections: Collection[];
}

export function ArticleCollectionBanner({
  collections,
}: ArticleCollectionBannerProps) {
  if (collections.length === 0) return null;

  return (
    <div className="mt-8 space-y-2 border-t border-border-subtle pt-6">
      {collections.map((collection) => (
        <Link
          key={collection.slug}
          href={`/collections/${collection.slug}`}
          className="group block font-mono text-[0.62rem] uppercase tracking-[0.2em] text-foreground-muted transition-colors hover:text-accent-bright"
        >
          <span className="text-accent-bright/70 group-hover:text-accent-bright">
            →
          </span>{" "}
          {publication.partOfCollection(collection.title)}
        </Link>
      ))}
    </div>
  );
}
