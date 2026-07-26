import Link from "next/link";
import { CoverArtwork } from "@/components/ui/CoverArtwork";
import { libraryFields, libraryVoice } from "@/config/library-voice";
import type { LibraryEntry } from "@/types/library";

interface LibraryEntryHeroProps {
  entry: LibraryEntry;
}

/**
 * Archive Entry hero — title, shelf mark, and editorial standing first.
 * Quiet accession header. No decorative chrome.
 *
 * Official release artwork is shown complete within a neutral optical field.
 * Platform branding, ratings, publisher marks, and packaging edges are part
 * of the archival object and must never be cropped.
 */
export function LibraryEntryHero({ entry }: LibraryEntryHeroProps) {
  return (
    <header className="library-entry-hero">
      <nav aria-label={libraryVoice.record.navigationLabel} className="mb-12">
        <Link
          href="/library"
          className="library-detail-back font-mono text-[0.58rem] uppercase tracking-[0.24em] text-foreground-muted transition-colors hover:text-accent-bright"
        >
          {libraryVoice.record.backLink}
        </Link>
      </nav>

      <div className="library-entry-hero-layout grid gap-10 md:grid-cols-[minmax(0,13.5rem)_minmax(0,1fr)] md:gap-14 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:gap-16">
        <div className="library-entry-cover mx-auto w-full max-w-[220px] md:mx-0 md:max-w-none">
          <CoverArtwork
            src={entry.coverImage}
            alt={entry.title}
            label={entry.mediaTypeLabel}
            sizes="(max-width: 767px) 220px, (max-width: 1023px) 216px, 240px"
            className="library-entry-cover-frame border-border/80"
          />
        </div>

        <div className="library-entry-identity min-w-0 self-end pb-1">
          <p className="font-mono text-[0.52rem] uppercase tracking-[0.32em] text-foreground-muted/60">
            {libraryVoice.record.archiveEntry}
            <span aria-hidden="true" className="mx-2.5 text-foreground-muted/30">
              ·
            </span>
            {libraryVoice.record.preservationRecord}
          </p>

          <h1 className="mt-5 font-serif text-[2.35rem] leading-[1.08] tracking-[0.005em] text-foreground md:text-[2.85rem] lg:text-[3.15rem]">
            {entry.title}
          </h1>

          <p className="mt-6 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-foreground-muted">
            <span className="text-foreground-muted/55">
              {libraryFields.shelfMark}
            </span>
            <span className="ml-2 text-foreground-muted/85">{entry.shelfMark}</span>
          </p>

          <p className="mt-3 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-foreground-muted">
            <span className="text-foreground-muted/55">
              {libraryFields.editorialStanding}
            </span>
            <span className="ml-2 text-foreground-muted/85">
              {entry.statusLabel}
            </span>
          </p>

          {(entry.year != null || entry.mediaTypeLabel) && (
            <p className="mt-8 border-t border-border-subtle/70 pt-4 font-mono text-[0.5rem] uppercase tracking-[0.2em] text-foreground-muted/50">
              {entry.year != null && (
                <>
                  <span>{entry.year}</span>
                  <span
                    aria-hidden="true"
                    className="mx-2 text-foreground-muted/35"
                  >
                    ·
                  </span>
                </>
              )}
              <span>{entry.mediaTypeLabel}</span>
            </p>
          )}
        </div>
      </div>
    </header>
  );
}
