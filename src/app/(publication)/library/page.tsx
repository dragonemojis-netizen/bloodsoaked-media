import { Suspense } from "react";
import { LibraryHero } from "@/components/library";
import { LibraryBrowseClient } from "@/components/library/LibraryBrowseClient";
import { libraryVoice } from "@/config/library-voice";
import { listPublishedAuthorityLookups } from "@/lib/authority";
import { listPublishedCatalogHoldings } from "@/lib/catalog-lookup";
import {
  getLibraryFilterTaxonomy,
  getPublishedShelfCards,
} from "@/lib/library";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: libraryVoice.name,
  description: libraryVoice.description.replace(/\n+/g, " "),
};

/**
 * Prerender the Library shelf. Facets stay bookmarkable via the URL, but
 * filtering runs in the browser so crawlers cannot force Fluid Active CPU.
 */
export default function LibraryPage() {
  const cards = getPublishedShelfCards();
  const taxonomy = getLibraryFilterTaxonomy();
  const authorities = listPublishedAuthorityLookups();
  const holdings = listPublishedCatalogHoldings();

  return (
    <div className="library-world archive-world relative mx-auto max-w-6xl px-6 py-10">
      <LibraryHero />

      <div className="library-body mt-10 md:mt-12">
        <Suspense
          fallback={
            <div className="border border-border bg-background-panel/40 px-4 py-3 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-foreground-muted">
              {libraryVoice.empty.loading}
            </div>
          }
        >
          <LibraryBrowseClient
            cards={cards}
            taxonomy={taxonomy}
            authorities={authorities}
            holdings={holdings}
          />
        </Suspense>
      </div>
    </div>
  );
}
