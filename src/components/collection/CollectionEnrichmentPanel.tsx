import Link from "next/link";
import { publication } from "@/config/publication";
import {
  getEnrichmentLinks,
  getSpecimenDescriptor,
  getSpecimenTags,
  type CollectionArchiveEntry,
} from "@/lib/collection-archive";

interface CollectionEnrichmentPanelProps {
  entry: CollectionArchiveEntry;
}

export function CollectionEnrichmentPanel({
  entry,
}: CollectionEnrichmentPanelProps) {
  const descriptor = getSpecimenDescriptor(entry);
  const tags = getSpecimenTags(entry);
  const links = getEnrichmentLinks(entry);

  if (!descriptor && tags.length === 0 && links.length === 0) {
    return null;
  }

  return (
    <div className="collection-enrichment-panel mt-8 border-t border-border-subtle pt-6">
      <p className="font-mono text-[0.56rem] uppercase tracking-[0.22em] text-foreground-muted/80">
        {publication.collectionEnrichmentEyebrow}
      </p>

      {descriptor && (
        <p className="mt-3 font-serif text-sm leading-relaxed text-foreground-muted">
          {descriptor}
        </p>
      )}

      {tags.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2" role="list">
          {tags.map((tag) => (
            <li key={tag}>
              <span className="collection-enrichment-tag font-mono text-[0.52rem] uppercase tracking-[0.12em] text-foreground-muted/85">
                {tag}
              </span>
            </li>
          ))}
        </ul>
      )}

      {links.length > 0 && (
        <div className="mt-5">
          <p className="font-mono text-[0.52rem] uppercase tracking-[0.18em] text-foreground-muted/75">
            {publication.collectionRelatedReading}
          </p>
          <ul className="mt-3 space-y-2" role="list">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="font-serif text-sm text-accent-bright transition-colors hover:text-foreground"
                >
                  {link.label} →
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
