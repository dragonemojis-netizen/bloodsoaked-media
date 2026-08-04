import Link from "next/link";
import { libraryFields, libraryVoice } from "@/config/library-voice";
import {
  getLibraryBrowseHref,
  libraryBrowseQueryHasFacets,
  toggleLibraryBrowseValue,
} from "@/lib/library";
import type {
  LibraryBrowsePlatform,
  LibraryBrowseQuery,
} from "@/types/library";

interface LibraryActiveFiltersProps {
  query: LibraryBrowseQuery;
  /** Filtered match count after the current query. */
  matchCount: number;
  className?: string;
}

/**
 * Removable facet chips above the shelves — quiet ledger of what is open.
 */
export function LibraryActiveFilters({
  query,
  matchCount,
  className = "",
}: LibraryActiveFiltersProps) {
  if (!libraryBrowseQueryHasFacets(query)) return null;

  const chips: {
    key: string;
    label: string;
    href: string;
  }[] = [];

  if (query.q?.trim()) {
    chips.push({
      key: "q",
      label: `${libraryVoice.lookup.eyebrow}: ${query.q.trim()}`,
      href: getLibraryBrowseHref({ ...query, q: undefined, page: undefined }),
    });
  }

  for (const platform of query.platforms ?? []) {
    chips.push({
      key: `platform:${platform}`,
      label: `${libraryFields.platform}: ${platform}`,
      href: getLibraryBrowseHref({
        ...query,
        platforms: toggleLibraryBrowseValue(
          query.platforms,
          platform,
        ) as LibraryBrowsePlatform[],
        page: undefined,
      }),
    });
  }

  for (const genre of query.genres ?? []) {
    chips.push({
      key: `genre:${genre}`,
      label: `${libraryVoice.facets.genre}: ${genre}`,
      href: getLibraryBrowseHref({
        ...query,
        genres: toggleLibraryBrowseValue(query.genres, genre),
        page: undefined,
      }),
    });
  }

  return (
    <div className={`library-active-filters mb-8 ${className}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-3">
        <p className="font-mono text-[0.56rem] uppercase tracking-[0.24em] text-foreground-muted/75">
          {matchCount === 1
            ? libraryVoice.facets.matchOne
            : libraryVoice.facets.matchMany(matchCount)}
        </p>
        <Link
          href="/library"
          scroll={false}
          className="font-mono text-[0.5rem] uppercase tracking-[0.22em] text-foreground-muted/55 transition-colors hover:text-accent-bright"
        >
          {libraryVoice.facets.clearAll}
        </Link>
      </div>

      <ul
        className="library-active-filter-chips mt-4 flex list-none flex-wrap gap-2"
        aria-label={libraryVoice.facets.activeLabel}
      >
        {chips.map((chip) => (
          <li key={chip.key}>
            <Link
              href={chip.href}
              scroll={false}
              className="library-active-filter-chip inline-flex items-center gap-2 border border-border/80 bg-background-panel/55 px-3 py-1.5 font-mono text-[0.52rem] uppercase tracking-[0.14em] text-foreground-muted transition-colors hover:border-accent/40 hover:text-accent-bright"
            >
              <span>{chip.label}</span>
              <span aria-hidden="true" className="text-foreground-muted/45">
                ×
              </span>
              <span className="sr-only">
                {libraryVoice.facets.removeChip(chip.label)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
