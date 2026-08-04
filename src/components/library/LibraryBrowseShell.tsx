import type { ReactNode } from "react";
import { LibraryFilterSidebar } from "@/components/library/LibraryFilterSidebar";
import type { LibraryBrowseQuery } from "@/types/library";

interface LibraryBrowseShellProps {
  children: ReactNode;
  query: LibraryBrowseQuery;
}

/**
 * Responsive browse chrome: Catalog Facets beside the stacks.
 * Search lives in the facet rail — one composition, not a storefront toolbar.
 */
export function LibraryBrowseShell({
  children,
  query,
}: LibraryBrowseShellProps) {
  return (
    <div className="library-browse">
      <div className="library-browse-layout grid gap-8 lg:grid-cols-[minmax(0,15.5rem)_minmax(0,1fr)] lg:gap-10 xl:grid-cols-[minmax(0,16.5rem)_minmax(0,1fr)]">
        <div className="library-browse-sidebar lg:sticky lg:top-8 lg:self-start">
          <LibraryFilterSidebar query={query} />
        </div>
        <div className="library-browse-main min-w-0">
          {children}
        </div>
      </div>
    </div>
  );
}
