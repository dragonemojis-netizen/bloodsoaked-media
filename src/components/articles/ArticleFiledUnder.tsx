import Link from "next/link";
import { MoodBadge } from "@/components/content/MoodBadge";
import { publication, categoryLabels } from "@/config/publication";
import { slugifyTag } from "@/lib/slugs";
import type { Post } from "@/types/content";
import type { Collection } from "@/types/collection";

interface ArticleFiledUnderProps {
  post: Post;
  collections: Collection[];
}

export function ArticleFiledUnder({ post, collections }: ArticleFiledUnderProps) {
  return (
    <footer
      className="article-filed-under"
      aria-labelledby="filed-under-heading"
    >
      <h2
        id="filed-under-heading"
        className="font-mono text-[0.65rem] uppercase tracking-[0.32em] text-accent-bright"
      >
        {publication.filedUnder}
      </h2>

      <dl className="mt-6 grid gap-6 sm:grid-cols-2">
        {post.legacy && post.originalPublication && (
          <div className="sm:col-span-2">
            <dt className="font-mono text-[0.55rem] uppercase tracking-[0.18em] text-foreground-muted">
              {publication.originallyPublished}
            </dt>
            <dd className="mt-2 font-serif text-foreground">
              {post.originalPublication}
              {post.author && (
                <span className="text-foreground-muted"> · {post.author}</span>
              )}
              {post.archiveEra && (
                <span className="block mt-1 text-sm text-foreground-muted">
                  {publication.archiveEra}: {post.archiveEra}
                </span>
              )}
              {post.originalUrl && (
                <a
                  href={post.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 block font-mono text-[0.58rem] uppercase tracking-[0.12em] text-accent-bright transition-colors hover:text-foreground"
                >
                  {publication.originalSource} →
                </a>
              )}
            </dd>
          </div>
        )}

        <div>
          <dt className="font-mono text-[0.55rem] uppercase tracking-[0.18em] text-foreground-muted">
            Category
          </dt>
          <dd className="mt-2">
            <Link
              href={`/archive/category/${post.category}`}
              className="font-serif text-foreground transition-colors hover:text-accent-bright"
            >
              {categoryLabels[post.category] ?? post.category}
            </Link>
          </dd>
        </div>

        <div>
          <dt className="font-mono text-[0.55rem] uppercase tracking-[0.18em] text-foreground-muted">
            Mood
          </dt>
          <dd className="mt-2">
            <MoodBadge mood={post.mood} />
          </dd>
        </div>

        {post.tags.length > 0 && (
          <div className="sm:col-span-2">
            <dt className="font-mono text-[0.55rem] uppercase tracking-[0.18em] text-foreground-muted">
              Tags
            </dt>
            <dd className="mt-2 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/archive/tag/${slugifyTag(tag)}`}
                  className="border border-border px-2.5 py-1 font-mono text-[0.58rem] uppercase tracking-[0.1em] text-foreground-muted transition-colors hover:border-accent/50 hover:text-accent-bright"
                >
                  #{tag}
                </Link>
              ))}
            </dd>
          </div>
        )}

        {collections.length > 0 && (
          <div className="sm:col-span-2">
            <dt className="font-mono text-[0.55rem] uppercase tracking-[0.18em] text-foreground-muted">
              {publication.collections}
            </dt>
            <dd className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
              {collections.map((c) => (
                <Link
                  key={c.slug}
                  href={`/collections/${c.slug}`}
                  className="font-serif text-sm text-foreground-muted transition-colors hover:text-accent-bright"
                >
                  {c.title}
                </Link>
              ))}
            </dd>
          </div>
        )}
      </dl>
    </footer>
  );
}
