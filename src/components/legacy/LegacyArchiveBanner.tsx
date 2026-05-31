import Link from "next/link";
import { publication } from "@/config/publication";
import { formatDate } from "@/lib/format";
import type { Post } from "@/types/content";

interface LegacyArchiveBannerProps {
  post: Post;
}

export function LegacyArchiveBanner({ post }: LegacyArchiveBannerProps) {
  if (!post.legacy || !post.originalPublication) return null;

  const originalDate = post.originalPublicationDate
    ? formatDate(post.originalPublicationDate)
    : null;

  return (
    <aside
      className="legacy-archive-banner"
      aria-label="Legacy archive notice"
    >
      <p className="font-mono text-[0.62rem] uppercase tracking-[0.28em] text-accent-bright">
        {publication.legacyArchivedFrom(post.originalPublication)}
      </p>
      {originalDate && (
        <p className="mt-2 font-mono text-[0.58rem] uppercase tracking-[0.14em] text-foreground-muted">
          {publication.originallyPublished}: {originalDate}
          {post.originalSite && (
            <>
              <span aria-hidden="true"> · </span>
              {post.originalSite}
            </>
          )}
        </p>
      )}
      {post.archiveDate && (
        <p className="mt-1 font-mono text-[0.55rem] uppercase tracking-[0.12em] text-foreground-muted/70">
          {publication.archivedOn}: {formatDate(post.archiveDate)}
        </p>
      )}
      <p className="mt-4 text-sm leading-relaxed text-foreground-muted">
        This article has been preserved as part of the Bloodsoaked Media archive
        project. Wording and opinions reflect the era in which they were written.
      </p>
      <Link
        href="/the-archives"
        className="mt-3 inline-block font-mono text-[0.58rem] uppercase tracking-[0.15em] text-accent-bright/80 transition-colors hover:text-accent-bright"
      >
        Explore {publication.theArchives} →
      </Link>
    </aside>
  );
}
