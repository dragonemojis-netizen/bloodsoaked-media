import Link from "next/link";
import { MoodBadge } from "@/components/content/MoodBadge";
import { publication, categoryLabels } from "@/config/publication";
import { formatDate } from "@/lib/format";
import type { PostMeta } from "@/types/content";

interface RelatedArticlesProps {
  posts: PostMeta[];
}

export function RelatedArticles({ posts }: RelatedArticlesProps) {
  if (posts.length === 0) return null;

  return (
    <section
      className="article-related"
      aria-labelledby="related-heading"
    >
      <h2
        id="related-heading"
        className="font-mono text-[0.65rem] uppercase tracking-[0.28em] text-foreground-muted"
      >
        {publication.relatedOnShelf}
      </h2>

      <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-2">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link
              href={`/articles/${post.slug}`}
              className="group article-shelf-card block h-full border border-border bg-background-panel/40 p-6"
            >
              <p className="font-mono text-[0.55rem] uppercase tracking-[0.15em] text-foreground-muted">
                {categoryLabels[post.category]} ·{" "}
                <time dateTime={post.date}>{formatDate(post.date)}</time>
              </p>
              <h3 className="mt-3 font-serif text-lg leading-snug text-foreground transition-colors group-hover:text-accent-bright">
                {post.subtitle ? (
                  <>
                    <span className="block">{post.title}</span>
                    <span className="mt-1 block text-sm font-normal italic text-foreground-muted">
                      {post.subtitle}
                    </span>
                  </>
                ) : (
                  post.title
                )}
              </h3>
              <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-foreground-muted">
                {post.excerpt}
              </p>
              <div className="mt-4">
                <MoodBadge mood={post.mood} />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
