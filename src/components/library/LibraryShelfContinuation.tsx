import Link from "next/link";
import { libraryVoice } from "@/config/library-voice";
import { getLibraryBrowseHref } from "@/lib/library";
import type { LibraryBrowseQuery, LibraryCatalog } from "@/types/library";

interface LibraryShelfContinuationProps {
  catalog: LibraryCatalog;
  query: LibraryBrowseQuery;
}

/**
 * Quiet shelf pacing — not pagination chrome.
 * Absent when a single page holds every match (including one filing).
 */
export function LibraryShelfContinuation({
  catalog,
  query,
}: LibraryShelfContinuationProps) {
  if (catalog.pageCount <= 1 || catalog.total === 0) return null;

  const from = (catalog.page - 1) * catalog.pageSize + 1;
  const to = Math.min(catalog.page * catalog.pageSize, catalog.total);

  return (
    <nav
      className="library-shelf-continuation"
      aria-label={libraryVoice.shelves.continuationLabel}
    >
      <p className="font-mono text-[0.55rem] uppercase tracking-[0.18em] text-foreground-muted/70">
        {libraryVoice.shelves.rangeOnShelf(from, to, catalog.total)}
      </p>

      <div className="mt-4 flex flex-wrap items-baseline gap-x-8 gap-y-3">
        {catalog.hasPreviousPage ? (
          <Link
            href={getLibraryBrowseHref({ ...query, page: catalog.page - 1 })}
            className="library-shelf-continuation-link font-serif text-sm text-foreground-muted transition-colors hover:text-accent-bright"
          >
            {libraryVoice.shelves.earlierOn}
          </Link>
        ) : (
          <span className="font-serif text-sm text-foreground-muted/35">
            {libraryVoice.shelves.earlierOn}
          </span>
        )}

        {catalog.hasNextPage ? (
          <Link
            href={getLibraryBrowseHref({ ...query, page: catalog.page + 1 })}
            className="library-shelf-continuation-link font-serif text-sm text-foreground-muted transition-colors hover:text-accent-bright"
          >
            {libraryVoice.shelves.furtherAlong}
          </Link>
        ) : (
          <span className="font-serif text-sm text-foreground-muted/35">
            {libraryVoice.shelves.furtherAlong}
          </span>
        )}
      </div>
    </nav>
  );
}
