import Link from "next/link";
import { publication } from "@/config/publication";
import type { PostMeta } from "@/types/content";

interface ArticlePrevNextProps {
  prev: PostMeta | null;
  next: PostMeta | null;
}

export function ArticlePrevNext({ prev, next }: ArticlePrevNextProps) {
  if (!prev && !next) return null;

  return (
    <nav
      className="article-prev-next grid gap-4 border-t border-border pt-10 sm:grid-cols-2"
      aria-label="Article navigation"
    >
      {prev ? (
        <Link
          href={`/articles/${prev.slug}`}
          className="group vhs-card border border-border bg-background-panel/30 p-5"
        >
          <span className="font-mono text-[0.55rem] uppercase tracking-[0.2em] text-foreground-muted">
            ← {publication.earlierInCatalog}
          </span>
          <span className="mt-2 block font-serif text-base leading-snug text-foreground transition-colors group-hover:text-accent-bright">
            {prev.title}
          </span>
        </Link>
      ) : (
        <div aria-hidden="true" />
      )}

      {next ? (
        <Link
          href={`/articles/${next.slug}`}
          className="group vhs-card border border-border bg-background-panel/30 p-5 sm:text-right"
        >
          <span className="font-mono text-[0.55rem] uppercase tracking-[0.2em] text-foreground-muted">
            {publication.laterInCatalog} →
          </span>
          <span className="mt-2 block font-serif text-base leading-snug text-foreground transition-colors group-hover:text-accent-bright">
            {next.title}
          </span>
        </Link>
      ) : (
        <div aria-hidden="true" />
      )}
    </nav>
  );
}
