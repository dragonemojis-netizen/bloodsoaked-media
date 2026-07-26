import Link from "next/link";
import { CoverArtwork } from "@/components/ui/CoverArtwork";
import { LibraryMetadata } from "@/components/library/LibraryMetadata";
import { libraryFields, libraryVoice } from "@/config/library-voice";
import type { LibraryShelfCard } from "@/types/library";

interface LibraryCardProps {
  entry: LibraryShelfCard;
}

/**
 * Shared shelf card — one doorway into a preservation record.
 * Accepts shelf projections only; never full accession payloads.
 * See library-stewardship.ts — browseUsesShelfCardsOnly.
 *
 * Cover presentation is the Archive Entry hero at reduced scale —
 * same optical field, same containment, never cropped.
 */
export function LibraryCard({ entry }: LibraryCardProps) {
  return (
    <article className="library-card museum-item group relative flex h-full flex-col overflow-hidden border border-border bg-background-panel/60">
      <div className="library-card-cover">
        <CoverArtwork
          src={entry.coverImage}
          alt={entry.title}
          label={entry.mediaTypeLabel}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 240px"
          className="library-card-cover-artwork border-0"
        />
      </div>

      <div className="library-card-body flex flex-1 flex-col border-t border-border-subtle p-5 md:p-6">
        <p className="font-mono text-[0.52rem] uppercase tracking-[0.2em] text-accent-bright/90">
          {entry.mediaTypeLabel}
          {entry.year != null && (
            <>
              <span aria-hidden="true" className="mx-1.5 text-foreground-muted/40">
                ·
              </span>
              <span className="text-foreground-muted/80">{entry.year}</span>
            </>
          )}
        </p>

        <h3 className="mt-2 font-serif text-xl leading-snug text-foreground transition-colors group-hover:text-accent-bright md:text-2xl">
          <Link
            href={entry.href}
            className="after:absolute after:inset-0"
            aria-label={libraryVoice.record.openAria(entry.title)}
          >
            {entry.title}
          </Link>
        </h3>

        {entry.synopsis && (
          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-foreground-muted">
            {entry.synopsis}
          </p>
        )}

        <div className="mt-auto pt-5">
          <LibraryMetadata
            entry={entry}
            variant="inline"
            items={[
              {
                label: libraryFields.archivalStatus,
                value: entry.statusLabel,
              },
              ...(entry.platform
                ? [
                    {
                      label: libraryFields.platform,
                      value: entry.platform,
                    },
                  ]
                : []),
            ]}
          />
        </div>
      </div>
    </article>
  );
}
