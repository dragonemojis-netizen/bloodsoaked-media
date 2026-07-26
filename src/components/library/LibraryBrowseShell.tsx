import type { ReactNode } from "react";
import { LibraryFilterSidebar } from "@/components/library/LibraryFilterSidebar";
import { LibrarySearch } from "@/components/library/LibrarySearch";

interface LibraryBrowseShellProps {
  children: ReactNode;
}

/**
 * Responsive browse chrome: search across the top, filter rail beside the stacks.
 */
export function LibraryBrowseShell({ children }: LibraryBrowseShellProps) {
  return (
    <div className="library-browse">
      <div className="library-browse-search mb-8 md:mb-10">
        <LibrarySearch />
      </div>

      <div className="library-browse-layout grid gap-8 lg:grid-cols-[minmax(0,15.5rem)_minmax(0,1fr)] lg:gap-10 xl:grid-cols-[minmax(0,16.5rem)_minmax(0,1fr)]">
        <div className="library-browse-sidebar order-2 lg:order-1 lg:sticky lg:top-8 lg:self-start">
          <LibraryFilterSidebar />
        </div>
        <div className="library-browse-main order-1 min-w-0 lg:order-2">
          {children}
        </div>
      </div>
    </div>
  );
}
