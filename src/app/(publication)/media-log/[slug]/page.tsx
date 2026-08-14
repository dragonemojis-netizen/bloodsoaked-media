import Link from "next/link";
import { notFound } from "next/navigation";
import { CoverFrame } from "@/components/ui/CoverFrame";
import { MediaLogPlatform } from "@/components/media-log/MediaLogPlatform";
import { MediaLogStatusBadge } from "@/components/media-log/MediaLogStatusBadge";
import { MediaLogScore } from "@/components/media-log/MediaLogScore";
import { MediaLogTags } from "@/components/media-log/MediaLogTags";
import { formatMediaLogDate } from "@/lib/format";
import { getMediaLogCoverSrc } from "@/lib/media-log-cover";
import { getMediaLogReplayPhrase } from "@/lib/media-log-display";
import {
  getAllMediaLogEntries,
  getMediaLogEntry,
} from "@/lib/media-log";
import { publication } from "@/config/publication";
import type { Metadata } from "next";

interface MediaLogEntryPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllMediaLogEntries().map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({
  params,
}: MediaLogEntryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = getMediaLogEntry(slug);
  if (!entry) return { title: "Not Found" };

  return {
    title: entry.title,
    description: entry.notes,
  };
}

export default async function MediaLogEntryPage({
  params,
}: MediaLogEntryPageProps) {
  const { slug } = await params;
  const entry = getMediaLogEntry(slug);
  if (!entry) notFound();

  const replayPhrase = getMediaLogReplayPhrase(entry);
  const coverSrc = getMediaLogCoverSrc(entry);
  const loggedWhen = formatMediaLogDate(entry);

  return (
    <article className="mx-auto max-w-3xl px-6 py-12">
      <Link
        href="/media-log"
        className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-foreground-muted transition-colors hover:text-accent-bright"
      >
        ← {publication.mediaLog}
      </Link>

      <div className="mt-8 flex flex-col gap-8 md:flex-row">
        <CoverFrame
          src={coverSrc}
          alt={entry.title}
          label={entry.mediaType}
          className="w-full max-w-[200px] shrink-0"
        />

        <header className="min-w-0 flex-1">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-foreground-muted">
            {loggedWhen && (
              <>
                {entry.date ? (
                  <time dateTime={entry.date}>{loggedWhen}</time>
                ) : (
                  <span>{loggedWhen}</span>
                )}
                <span aria-hidden="true"> · </span>
              </>
            )}
            <span>{entry.mediaType}</span>
          </p>
          <div className="mt-2">
            <MediaLogStatusBadge entry={entry} variant="action" />
          </div>
          {replayPhrase && (
            <p className="mt-2 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-accent-bright">
              {replayPhrase}
            </p>
          )}
          <h1 className="mt-3 font-serif text-3xl leading-tight text-foreground md:text-4xl">
            {entry.title}
          </h1>
          {entry.platform && (
            <MediaLogPlatform platform={entry.platform} className="mt-3 text-base md:text-lg" />
          )}
          {entry.score != null && (
            <MediaLogScore score={entry.score} className="mt-4" />
          )}
          <div className="mt-4">
            <MediaLogStatusBadge entry={entry} variant="status" />
          </div>
        </header>
      </div>

      {entry.notes && (
        <div className="prose-article mt-10 border-t border-border-subtle pt-8">
          <p>{entry.notes}</p>
        </div>
      )}

      {entry.tags.length > 0 && (
        <div className="mt-8 border-t border-border-subtle pt-6">
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-foreground-muted">
            Tags
          </p>
          <MediaLogTags tags={entry.tags} className="mt-3" />
        </div>
      )}

      {entry.reviewSlug && (
        <p className="mt-10">
          <Link
            href={`/articles/${entry.reviewSlug}`}
            className="inline-block border border-accent bg-accent/10 px-5 py-2.5 font-mono text-[0.7rem] uppercase tracking-[0.15em] text-foreground transition-colors hover:bg-accent hover:text-white vhs-button"
          >
            Read full review →
          </Link>
        </p>
      )}
    </article>
  );
}
