import type { ReactNode } from "react";
import Link from "next/link";
import { LibrarySearch } from "@/components/library/LibrarySearch";
import { libraryFields, libraryVoice } from "@/config/library-voice";
import {
  getLibraryBrowseHref,
  getLibraryFilterTaxonomy,
  toggleLibraryBrowseValue,
} from "@/lib/library";
import type {
  LibraryBrowsePlatform,
  LibraryBrowseQuery,
} from "@/types/library";

interface LibraryFilterSidebarProps {
  query: LibraryBrowseQuery;
  className?: string;
}

/**
 * Catalog Facets — Search, Platform, and Genre.
 * Every control writes the browse URL so shelves stay bookmarkable.
 */
export function LibraryFilterSidebar({
  query,
  className = "",
}: LibraryFilterSidebarProps) {
  const taxonomy = getLibraryFilterTaxonomy();
  const activePlatforms = new Set(query.platforms ?? []);
  const activeGenres = new Set(query.genres ?? []);

  return (
    <aside
      className={`library-filter-sidebar space-y-8 ${className}`}
      aria-label={libraryVoice.facets.asideLabel}
    >
      <div className="library-filter-intro">
        <p className="font-mono text-[0.56rem] uppercase tracking-[0.3em] text-accent-bright/90">
          {libraryVoice.facets.eyebrow}
        </p>
        <p className="mt-3 max-w-[16rem] font-serif text-sm italic leading-relaxed text-foreground-muted/85">
          {libraryVoice.facets.lead}
        </p>
      </div>

      <LibrarySearch />

      <IndexCard legend={libraryVoice.facets.platform}>
        {taxonomy.platforms.map((option) => {
          const selected = activePlatforms.has(option.value);
          const href = getLibraryBrowseHref({
            ...query,
            platforms: toggleLibraryBrowseValue(
              query.platforms,
              option.value,
            ) as LibraryBrowsePlatform[],
            page: undefined,
          });

          return (
            <FacetRow
              key={option.value}
              href={href}
              label={option.label}
              selected={selected}
              facet={libraryFields.platform}
            />
          );
        })}
      </IndexCard>

      <IndexCard legend={libraryVoice.facets.genre}>
        {taxonomy.genres.length === 0 ? (
          <li className="py-2 font-serif text-[0.8rem] italic text-foreground-muted/55">
            {libraryVoice.facets.genreEmpty}
          </li>
        ) : (
          taxonomy.genres.map((option) => {
            const selected = activeGenres.has(option.value);
            const href = getLibraryBrowseHref({
              ...query,
              genres: toggleLibraryBrowseValue(query.genres, option.value),
              page: undefined,
            });

            return (
              <FacetRow
                key={option.value}
                href={href}
                label={option.label}
                selected={selected}
                facet={libraryVoice.facets.genre}
              />
            );
          })
        )}
      </IndexCard>
    </aside>
  );
}

interface IndexCardProps {
  legend: string;
  children: ReactNode;
}

function IndexCard({ legend, children }: IndexCardProps) {
  return (
    <fieldset className="library-index-card border border-border/70 bg-background-panel/45 p-4 md:p-5">
      <legend className="sr-only">{legend}</legend>
      <p
        className="library-index-card-heading border-b border-border-subtle/70 pb-2.5 font-mono text-[0.52rem] uppercase tracking-[0.26em] text-foreground-muted/75"
        aria-hidden="true"
      >
        {legend}
      </p>
      <ul
        className="library-index-card-rows mt-1 divide-y divide-border-subtle/40"
        role="list"
      >
        {children}
      </ul>
    </fieldset>
  );
}

interface FacetRowProps {
  href: string;
  label: string;
  selected: boolean;
  facet: string;
}

function FacetRow({ href, label, selected, facet }: FacetRowProps) {
  return (
    <li className="library-index-card-row">
      <Link
        href={href}
        scroll={false}
        aria-pressed={selected}
        aria-label={
          selected
            ? `Remove ${facet} filter: ${label}`
            : `Filter by ${facet}: ${label}`
        }
        className={`flex w-full items-baseline justify-between gap-3 py-2 text-left transition-colors ${
          selected
            ? "text-accent-bright"
            : "text-foreground-muted/80 hover:text-foreground"
        }`}
      >
        <span
          className={`font-serif text-[0.8rem] leading-snug ${
            selected ? "text-accent-bright" : ""
          }`}
        >
          {label}
        </span>
        <span
          className={`library-index-card-leader font-mono text-[0.48rem] tracking-[0.2em] ${
            selected ? "text-accent-bright/70" : "text-foreground-muted/30"
          }`}
          aria-hidden="true"
        >
          {selected ? "●" : "· · ·"}
        </span>
      </Link>
    </li>
  );
}
