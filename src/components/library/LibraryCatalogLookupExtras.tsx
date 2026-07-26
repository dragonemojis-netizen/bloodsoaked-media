import Link from "next/link";
import { authorityVoice } from "@/config/authority-voice";
import { libraryFields } from "@/config/library-voice";
import type { CatalogHoldingLookupResult } from "@/lib/catalog-lookup";
import type { AuthorityLookupResult } from "@/types/authority";

interface LibraryCatalogLookupExtrasProps {
  query: string;
  authorities: AuthorityLookupResult[];
  holdings: CatalogHoldingLookupResult[];
}

/**
 * Supplemental Catalog Lookup results — Authority Records and holdings
 * shown beside the shelf, clearly marked as reference material / holdings.
 */
export function LibraryCatalogLookupExtras({
  query,
  authorities,
  holdings,
}: LibraryCatalogLookupExtrasProps) {
  if (!query.trim()) return null;
  if (authorities.length === 0 && holdings.length === 0) return null;

  return (
    <div className="library-lookup-extras mb-10 space-y-8">
      {authorities.length > 0 ? (
        <section
          className="library-lookup-authority"
          aria-labelledby="lookup-authority-heading"
        >
          <h2
            id="lookup-authority-heading"
            className="library-lookup-extras-eyebrow"
          >
            {authorityVoice.lookupKind}
          </h2>
          <p className="library-lookup-extras-note">
            Reference identities — not holdings on the shelf.
          </p>
          <ul className="library-lookup-extras-list">
            {authorities.map((hit) => (
              <li key={hit.slug}>
                <Link href={hit.href} className="library-lookup-extras-link">
                  <span className="library-lookup-extras-id">
                    {hit.authorityId}
                  </span>
                  <span className="library-lookup-extras-title">
                    {hit.preferredName}
                  </span>
                  <span className="library-lookup-extras-meta">
                    {hit.typeLabel}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {holdings.length > 0 ? (
        <section
          className="library-lookup-holdings"
          aria-labelledby="lookup-holdings-heading"
        >
          <h2
            id="lookup-holdings-heading"
            className="library-lookup-extras-eyebrow"
          >
            {libraryFields.relatedHoldings}
          </h2>
          <ul className="library-lookup-extras-list">
            {holdings.map((hit) => (
              <li key={hit.id}>
                <Link href={hit.href} className="library-lookup-extras-link">
                  <span className="library-lookup-extras-title">{hit.title}</span>
                  <span className="library-lookup-extras-meta">{hit.meta}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
