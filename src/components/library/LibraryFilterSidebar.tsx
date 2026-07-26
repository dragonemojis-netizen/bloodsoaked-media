import { libraryVoice } from "@/config/library-voice";
import { getLibraryFilterTaxonomy } from "@/lib/library";

interface LibraryFilterSidebarProps {
  className?: string;
}

/**
 * Catalog Facets — archival index cards, resting until works are filed.
 * Deliberately dormant: presentation only, no wiring yet.
 */
export function LibraryFilterSidebar({
  className = "",
}: LibraryFilterSidebarProps) {
  const taxonomy = getLibraryFilterTaxonomy();

  return (
    <aside
      className={`library-filter-sidebar ${className}`}
      aria-label={libraryVoice.facets.asideLabel}
    >
      <div className="library-filter-intro">
        <p className="font-mono text-[0.56rem] uppercase tracking-[0.3em] text-accent-bright/90">
          {libraryVoice.facets.eyebrow}
        </p>
        <p className="mt-3 max-w-[16rem] font-serif text-sm italic leading-relaxed text-foreground-muted/85">
          {libraryVoice.facets.lead}
        </p>
        <p className="mt-4 font-mono text-[0.48rem] uppercase tracking-[0.22em] text-foreground-muted/45">
          {libraryVoice.facets.dormant}
        </p>
      </div>

      <div className="mt-6 space-y-4">
        <IndexCard
          legend={libraryVoice.facets.mediaType}
          options={taxonomy.mediaTypes}
        />
        <IndexCard
          legend={libraryVoice.facets.archivalStatus}
          options={taxonomy.statuses}
        />
        <IndexCard
          legend={libraryVoice.facets.era}
          options={taxonomy.decades}
        />
      </div>
    </aside>
  );
}

interface IndexCardProps {
  legend: string;
  options: { value: string; label: string }[];
}

function IndexCard({ legend, options }: IndexCardProps) {
  return (
    <fieldset
      className="library-index-card border border-border/70 bg-background-panel/45 p-4 md:p-5"
      disabled
    >
      <legend className="sr-only">{legend}</legend>
      <p
        className="library-index-card-heading border-b border-border-subtle/70 pb-2.5 font-mono text-[0.52rem] uppercase tracking-[0.26em] text-foreground-muted/75"
        aria-hidden="true"
      >
        {legend}
      </p>
      <ul className="library-index-card-rows mt-1 divide-y divide-border-subtle/40" role="list">
        {options.map((option) => (
          <li
            key={option.value}
            className="library-index-card-row flex items-baseline justify-between gap-3 py-2"
          >
            <span className="font-serif text-[0.8rem] leading-snug text-foreground-muted/70">
              {option.label}
            </span>
            <span
              className="library-index-card-leader font-mono text-[0.48rem] tracking-[0.2em] text-foreground-muted/30"
              aria-hidden="true"
            >
              · · ·
            </span>
          </li>
        ))}
      </ul>
    </fieldset>
  );
}
