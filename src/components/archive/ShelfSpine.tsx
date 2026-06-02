import Link from "next/link";
import { MoodBadge } from "@/components/content/MoodBadge";
import { categoryLabels } from "@/config/publication";
import { formatPublishedAt } from "@/lib/format";
import type { PostMeta } from "@/types/content";

interface ShelfSpineProps {
  post: PostMeta;
}

export function ShelfSpine({ post }: ShelfSpineProps) {
  return (
    <li>
      <Link
        href={`/articles/${post.slug}`}
        className="group shelf-spine vhs-card flex gap-4 border border-border bg-background-panel/40 p-4 md:gap-6 md:p-5"
      >
        <div
          className="hidden w-1 shrink-0 bg-accent/60 transition-colors group-hover:bg-accent-bright sm:block"
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 font-mono text-[0.55rem] uppercase tracking-[0.15em] text-foreground-muted">
            <time dateTime={post.date}>{formatPublishedAt(post.date)}</time>
            <span aria-hidden="true">·</span>
            <span>{categoryLabels[post.category] ?? post.category}</span>
            <span aria-hidden="true">·</span>
            <span>{post.type}</span>
          </div>
          <h3 className="mt-2 font-serif text-lg leading-snug text-foreground transition-colors group-hover:text-accent-bright md:text-xl">
            {post.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm text-foreground-muted">
            {post.excerpt}
          </p>
          <div className="mt-3">
            <MoodBadge mood={post.mood} />
          </div>
        </div>
      </Link>
    </li>
  );
}
