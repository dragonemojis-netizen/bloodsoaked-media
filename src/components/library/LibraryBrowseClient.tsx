"use client";

import { useSearchParams } from "next/navigation";
import {
  LibraryBrowseShell,
  LibraryEmpty,
  LibraryGrid,
  LibraryShelfContinuation,
} from "@/components/library";
import { LibraryActiveFilters } from "@/components/library/LibraryActiveFilters";
import { LibraryCatalogLookupExtras } from "@/components/library/LibraryCatalogLookupExtras";
import type { LibraryFilterTaxonomy } from "@/components/library/LibraryFilterSidebar";
import { libraryVoice } from "@/config/library-voice";
import {
  libraryBrowseQueryHasFacets,
  paginateLibraryCatalog,
  parseLibraryBrowseSearchParams,
} from "@/lib/library-browse";
import type { CatalogHoldingLookupResult } from "@/lib/catalog-lookup";
import type { AuthorityLookupResult } from "@/types/authority";
import type { LibraryShelfCard } from "@/types/library";

interface LibraryBrowseClientProps {
  cards: LibraryShelfCard[];
  taxonomy: LibraryFilterTaxonomy;
  authorities: AuthorityLookupResult[];
  holdings: CatalogHoldingLookupResult[];
}

function filterLookups<T extends { searchHaystack?: string; title?: string }>(
  items: T[],
  query: string,
  fallback: (item: T) => string,
  limit = 12,
): T[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return items
    .filter((item) => (item.searchHaystack ?? fallback(item)).includes(q))
    .slice(0, limit);
}

export function LibraryBrowseClient({
  cards,
  taxonomy,
  authorities,
  holdings,
}: LibraryBrowseClientProps) {
  const searchParams = useSearchParams();
  const query = parseLibraryBrowseSearchParams(searchParams);
  const catalog = paginateLibraryCatalog(cards, query);
  const lookupQuery = query.q?.trim() ?? "";
  const authorityHits = filterLookups(
    authorities,
    lookupQuery,
    (item) => item.preferredName.toLowerCase(),
  );
  const holdingHits = filterLookups(
    holdings,
    lookupQuery,
    (item) => item.title.toLowerCase(),
  );
  const hasLookupExtras = authorityHits.length > 0 || holdingHits.length > 0;
  const shelfEmpty = catalog.entries.length === 0;
  const lookupMiss =
    Boolean(lookupQuery) && shelfEmpty && !hasLookupExtras && !catalog.isEmpty;

  return (
    <LibraryBrowseShell query={query} taxonomy={taxonomy}>
      <LibraryActiveFilters query={query} matchCount={catalog.total} />
      {catalog.isEmpty && !hasLookupExtras ? (
        <LibraryEmpty />
      ) : (
        <>
          <LibraryCatalogLookupExtras
            query={lookupQuery}
            authorities={authorityHits}
            holdings={holdingHits}
          />
          {lookupMiss || (shelfEmpty && !hasLookupExtras) ? (
            <p className="border border-border/70 bg-background-panel/50 px-8 py-10 font-serif text-base italic leading-relaxed text-foreground-muted">
              {libraryVoice.empty.noMatch}
            </p>
          ) : shelfEmpty && hasLookupExtras ? null : (
            <>
              <LibraryGrid
                entries={catalog.entries}
                total={catalog.total}
                showHeader={!libraryBrowseQueryHasFacets(query)}
              />
              <LibraryShelfContinuation catalog={catalog} query={query} />
            </>
          )}
        </>
      )}
    </LibraryBrowseShell>
  );
}
