import Link from "next/link";
import { getCollectionImageDimensions } from "@/lib/collection-cover";
import {
  formatCatalogueStamp,
  getCollectionSpecimenHref,
  getEventNarrative,
  getSpecimenTitle,
  type CollectionArchiveEntry,
} from "@/lib/collection-archive";
import { publication } from "@/config/publication";
import { CollectionArtifactFrame } from "./CollectionArtifactFrame";

interface CollectionArtifactCardProps {
  entry: CollectionArchiveEntry;
}

export function CollectionArtifactCard({ entry }: CollectionArtifactCardProps) {
  const title = getSpecimenTitle(entry);
  const href = getCollectionSpecimenHref(entry.id);
  const dimensions = getCollectionImageDimensions(entry.coverImage);

  return (
    <article className="collection-artifact museum-item collection-catalog-card group relative overflow-hidden border border-border bg-background-panel/60">
      <div className="collection-catalog-card-image">
        <CollectionArtifactFrame
          src={entry.coverImage}
          alt={title}
          variant="catalog"
          dimensions={dimensions}
          sizes="(max-width: 768px) 50vw, 320px"
        />
      </div>
      <div className="collection-catalog-card-body border-t border-border-subtle p-5 md:p-6">
        <h3 className="font-serif text-xl leading-snug text-foreground transition-colors group-hover:text-accent-bright md:text-2xl">
          <Link
            href={href}
            className="after:absolute after:inset-0"
            aria-label={publication.collectionSpecimenOpenAria(title)}
          >
            {title}
          </Link>
        </h3>
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-foreground-muted">
          {entry.notes ?? getEventNarrative(entry.eventType)}
        </p>
        <p className="collection-catalog-card-stamp mt-5 font-mono text-[0.48rem] uppercase tracking-[0.11em] text-foreground-muted/55">
          Filed {formatCatalogueStamp(entry.catalogued)}
        </p>
      </div>
    </article>
  );
}
