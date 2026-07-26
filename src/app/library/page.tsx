import { Suspense } from "react";
import {
  LibraryBrowseShell,
  LibraryEmpty,
  LibraryGrid,
  LibraryHero,
  LibraryShelfContinuation,
} from "@/components/library";
import { LibraryCatalogLookupExtras } from "@/components/library/LibraryCatalogLookupExtras";
import { libraryVoice } from "@/config/library-voice";
import { searchAuthorityRecords } from "@/lib/authority";
import { searchCatalogHoldings } from "@/lib/catalog-lookup";
import {
  getLibraryCatalog,
  type LibraryBrowseQuery,
  type LibraryMediaType,
  type LibraryStatus,
} from "@/lib/library";
import { LIBRARY_MEDIA_TYPES, LIBRARY_STATUSES } from "@/types/library";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: libraryVoice.name,
  description: libraryVoice.description.replace(/\n+/g, " "),
};

interface LibraryPageProps {
  searchParams: Promise<{
    q?: string;
    mediaType?: string;
    status?: string;
    decade?: string;
    tag?: string;
    page?: string;
  }>;
}

function parseBrowseQuery(
  params: Awaited<LibraryPageProps["searchParams"]>,
): LibraryBrowseQuery {
  const mediaType = params.mediaType;
  const status = params.status;
  const pageRaw = params.page ? Number.parseInt(params.page, 10) : undefined;

  return {
    q: params.q,
    mediaType:
      mediaType &&
      (LIBRARY_MEDIA_TYPES as readonly string[]).includes(mediaType)
        ? (mediaType as LibraryMediaType)
        : undefined,
    status:
      status && (LIBRARY_STATUSES as readonly string[]).includes(status)
        ? (status as LibraryStatus)
        : undefined,
    decade: params.decade,
    tag: params.tag,
    page:
      pageRaw != null && !Number.isNaN(pageRaw) && pageRaw > 0
        ? pageRaw
        : undefined,
  };
}

export default async function LibraryPage({ searchParams }: LibraryPageProps) {
  const params = await searchParams;
  const query = parseBrowseQuery(params);
  const catalog = getLibraryCatalog(query);
  const lookupQuery = query.q?.trim() ?? "";
  const authorityHits = lookupQuery
    ? searchAuthorityRecords(lookupQuery)
    : [];
  const holdingHits = lookupQuery ? searchCatalogHoldings(lookupQuery) : [];
  const hasLookupExtras = authorityHits.length > 0 || holdingHits.length > 0;
  const shelfEmpty = catalog.entries.length === 0;
  const lookupMiss =
    Boolean(lookupQuery) && shelfEmpty && !hasLookupExtras && !catalog.isEmpty;

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
          <LibraryBrowseShell>
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
                    />
                    <LibraryShelfContinuation catalog={catalog} query={query} />
                  </>
                )}
              </>
            )}
          </LibraryBrowseShell>
        </Suspense>
      </div>
    </div>
  );
}
