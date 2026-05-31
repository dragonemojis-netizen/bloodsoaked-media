import Link from "next/link";
import { MediaLogCard } from "@/components/media-log/MediaLogCard";
import { MoodBadge } from "@/components/content/MoodBadge";
import { publication } from "@/config/publication";
import { formatDate } from "@/lib/format";
import { getMediaLogEntry } from "@/lib/media-log";
import { getPostBySlug } from "@/lib/content";

interface CollectionLinkedProps {
  articleSlugs: string[];
  mediaLogSlugs: string[];
}

export async function CollectionLinked({
  articleSlugs,
  mediaLogSlugs,
}: CollectionLinkedProps) {
  const articles = (
    await Promise.all(articleSlugs.map((slug) => getPostBySlug(slug)))
  ).filter((a) => a !== null);

  const logEntries = mediaLogSlugs
    .map((slug) => getMediaLogEntry(slug))
    .filter((e) => e !== null);

  if (articles.length === 0 && logEntries.length === 0) return null;

  return (
    <div className="mt-16 space-y-12 border-t border-border-subtle pt-16">
      {articles.length > 0 && (
        <section aria-labelledby="linked-articles">
          <h2
            id="linked-articles"
            className="font-mono text-[0.7rem] uppercase tracking-[0.3em] text-foreground-muted"
          >
            Associated Writing
          </h2>
          <ul className="mt-6 space-y-4">
            {articles.map((article) => (
              <li key={article.slug}>
                <Link
                  href={`/articles/${article.slug}`}
                  className="group vhs-card block border border-border bg-background-panel/50 p-5"
                >
                  <p className="font-mono text-[0.55rem] uppercase tracking-[0.15em] text-foreground-muted">
                    <time dateTime={article.date}>{formatDate(article.date)}</time>
                    <span aria-hidden="true"> · </span>
                    {article.type}
                  </p>
                  <h3 className="mt-2 font-serif text-lg text-foreground group-hover:text-accent-bright">
                    {article.title}
                  </h3>
                  <div className="mt-3">
                    <MoodBadge mood={article.mood} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {logEntries.length > 0 && (
        <section aria-labelledby="linked-log">
          <h2
            id="linked-log"
            className="font-mono text-[0.7rem] uppercase tracking-[0.3em] text-foreground-muted"
          >
            {publication.mediaLog} Entries
          </h2>
          <div className="mt-6">
            {logEntries.map((entry) => (
              <MediaLogCard key={entry.slug} entry={entry} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
