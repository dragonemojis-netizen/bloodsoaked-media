import { LibraryCard } from "@/components/library/LibraryCard";
import { libraryVoice } from "@/config/library-voice";
import type { LibraryShelfCard } from "@/types/library";

interface LibraryGridProps {
  /** Current shelf page only — never dump the full filtered catalog into the DOM. */
  entries: LibraryShelfCard[];
  /** Filtered total across all shelf pages (for the placard count). */
  total?: number;
  showHeader?: boolean;
}

/**
 * Shelf grid. Card count per page is governed by LIBRARY_SCALING_CONTRACT.
 * The header reflects the filtered archive total, not the page slice.
 */
export function LibraryGrid({
  entries,
  total,
  showHeader = true,
}: LibraryGridProps) {
  if (entries.length === 0) return null;

  const filedCount = total ?? entries.length;

  return (
    <section
      aria-labelledby={showHeader ? "library-grid-heading" : undefined}
      className="library-grid-section"
    >
      {showHeader && (
        <header className="mb-8 max-w-2xl">
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.26em] text-foreground-muted/80">
            {libraryVoice.shelves.eyebrow}
          </p>
          <h2
            id="library-grid-heading"
            className="mt-2 font-serif text-2xl text-foreground md:text-3xl"
          >
            {filedCount === 1
              ? libraryVoice.shelves.countOne
              : libraryVoice.shelves.countMany(filedCount)}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-foreground-muted">
            {libraryVoice.shelves.description}
          </p>
        </header>
      )}

      <ul className="library-shelf grid list-none grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {entries.map((entry) => (
          <li key={entry.slug} className="min-w-0">
            <LibraryCard entry={entry} />
          </li>
        ))}
      </ul>
    </section>
  );
}
