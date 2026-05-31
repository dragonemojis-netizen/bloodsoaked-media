import Link from "next/link";
import { CoverFrame } from "@/components/ui/CoverFrame";
import { MediaLogPlatform } from "@/components/media-log/MediaLogPlatform";
import { MediaLogStatusBadge } from "@/components/media-log/MediaLogStatusBadge";
import { MediaLogScore } from "@/components/media-log/MediaLogScore";
import { MediaLogTags } from "@/components/media-log/MediaLogTags";
import { formatMediaLogDate } from "@/lib/format";
import { getMediaLogCoverSrc } from "@/lib/media-log-cover";
import { getMediaLogReplayPhrase } from "@/lib/media-log-display";
import type { MediaLogEntry } from "@/types/media-log";

interface MediaLogCardProps {
  entry: MediaLogEntry;
}

export function MediaLogCard({ entry }: MediaLogCardProps) {
  const replayPhrase = getMediaLogReplayPhrase(entry);
  const coverSrc = getMediaLogCoverSrc(entry);
  const loggedWhen = formatMediaLogDate(entry);

  return (
    <article className="group vhs-card flex gap-4 border-b border-border-subtle py-5 md:gap-6">
      <Link
        href={`/media-log/${entry.slug}`}
        className="relative shrink-0 w-20 md:w-24"
      >
        <CoverFrame
          src={coverSrc}
          alt={entry.title}
          label={entry.mediaType}
          className="vhs-hover-lift"
        />
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2 font-mono text-meta uppercase tracking-[0.12em] text-foreground-muted">
          {loggedWhen && (
            <>
              {entry.date ? (
                <time dateTime={entry.date}>{loggedWhen}</time>
              ) : (
                <span>{loggedWhen}</span>
              )}
              <span aria-hidden="true">·</span>
            </>
          )}
          <MediaLogStatusBadge entry={entry} variant="action" />
        </div>

        {replayPhrase && (
          <p className="mt-1 font-mono text-meta-sm uppercase tracking-[0.14em] text-accent-bright/80">
            {replayPhrase}
          </p>
        )}

        <h3 className="mt-1 font-serif text-lg leading-snug text-foreground transition-colors group-hover:text-accent-bright">
          <Link href={`/media-log/${entry.slug}`}>{entry.title}</Link>
        </h3>

        {entry.platform && (
          <MediaLogPlatform platform={entry.platform} className="mt-1.5" />
        )}

        {entry.score != null && (
          <MediaLogScore score={entry.score} className="mt-2" />
        )}

        {entry.notes && (
          <p className="mt-2 line-clamp-2 text-body-sm text-foreground-muted leading-relaxed">
            {entry.notes}
          </p>
        )}

        <div className="mt-3 flex flex-col gap-3">
          <MediaLogTags tags={entry.tags} />
          {entry.reviewSlug && (
            <Link
              href={`/articles/${entry.reviewSlug}`}
              className="font-mono text-[0.6rem] uppercase tracking-[0.12em] text-accent-bright transition-colors hover:text-foreground"
            >
              Full review →
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
