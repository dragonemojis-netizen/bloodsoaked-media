import Link from "next/link";
import { KnifeMotif } from "@/components/brand/KnifeMotif";
import { MediaArtifact } from "@/components/brand/MediaArtifact";
import { MoodBadge } from "@/components/content/MoodBadge";
import { formatPublishedAt } from "@/lib/format";
import type { PostMeta } from "@/types/content";

interface CoverStoryProps {
  post: PostMeta;
}

export function CoverStory({ post }: CoverStoryProps) {
  return (
    <div className="cover-story group relative block">
      <KnifeMotif corner="br" className="!h-8 !w-5 !opacity-[0.18]" />

      <div className="relative z-10">
        <div className="flex flex-wrap items-center gap-2">
          <MediaArtifact label="Cover Feature" variant="accent" />
          <MediaArtifact label="Now Reading" variant="vhs" />
        </div>

        <h2 className="mt-5 font-serif text-2xl leading-[1.15] text-foreground md:text-[2.125rem]">
          <Link
            href={`/articles/${post.slug}`}
            className="transition-colors after:absolute after:inset-0 group-hover:text-accent-bright"
          >
            {post.title}
          </Link>
        </h2>

        {post.subtitle && (
          <p className="mt-3 font-serif text-lg italic leading-snug text-accent-bright/90">
            {post.subtitle}
          </p>
        )}

        <p className="mt-4 max-w-2xl text-base leading-relaxed text-foreground-muted">
          {post.excerpt}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <span className="relative z-10 inline-block">
            <MoodBadge mood={post.mood} />
          </span>
          <span className="font-mono text-[0.58rem] uppercase tracking-[0.14em] text-foreground-muted">
            <time dateTime={post.date}>{formatPublishedAt(post.date)}</time>
            <span aria-hidden="true"> · </span>
            {post.readingTime}
          </span>
        </div>

        <p className="mt-6 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-accent-bright">
          Read the feature →
        </p>
      </div>
    </div>
  );
}
