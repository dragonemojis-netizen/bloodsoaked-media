import Link from "next/link";
import { formatDate } from "@/lib/format";
import { publication } from "@/config/publication";
import type { PostMeta } from "@/types/content";

interface LegacyArtifactCardProps {
  post: PostMeta;
}

export function LegacyArtifactCard({ post }: LegacyArtifactCardProps) {
  const originalDate = post.originalPublicationDate
    ? formatDate(post.originalPublicationDate)
    : null;

  return (
    <article className="legacy-artifact group relative vhs-card border border-border bg-background-panel/40 p-5 md:p-6">
      <div className="flex flex-wrap items-center gap-2 font-mono text-[0.55rem] uppercase tracking-[0.16em] text-foreground-muted">
        {post.originalPublication && (
          <span className="text-accent-bright/90">{post.originalPublication}</span>
        )}
        {originalDate && (
          <>
            <span aria-hidden="true">·</span>
            <time dateTime={post.originalPublicationDate}>{originalDate}</time>
          </>
        )}
        <span aria-hidden="true">·</span>
        <span>{post.type}</span>
      </div>

      <h3 className="mt-3 font-serif text-xl leading-snug text-foreground transition-colors group-hover:text-accent-bright">
        <Link href={`/articles/${post.slug}`} className="after:absolute after:inset-0 relative">
          {post.title}
        </Link>
      </h3>

      {post.subtitle && (
        <p className="mt-1 font-serif text-sm italic text-foreground-muted">
          {post.subtitle}
        </p>
      )}

      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-foreground-muted">
        {post.excerpt}
      </p>

      <p className="mt-4 font-mono text-[0.52rem] uppercase tracking-[0.14em] text-foreground-muted/60">
        {publication.legacyPreserved}
        {post.archiveDate && (
          <>
            <span aria-hidden="true"> · </span>
            {publication.archivedOn} {formatDate(post.archiveDate)}
          </>
        )}
      </p>
    </article>
  );
}
