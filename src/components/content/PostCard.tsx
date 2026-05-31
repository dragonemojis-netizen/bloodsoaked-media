import Link from "next/link";
import type { PostMeta } from "@/types/content";
import { VerdictBadge } from "./VerdictBadge";
import { TagList } from "./TagList";
import { MoodBadge } from "./MoodBadge";

interface PostCardProps {
  post: PostMeta;
  featured?: boolean;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function typeLabel(type: PostMeta["type"]) {
  const labels: Record<PostMeta["type"], string> = {
    review: "Review",
    essay: "Essay",
    retrospective: "Retrospective",
    collection: "Collection",
    editorial: "Editorial",
  };
  return labels[type];
}

export function PostCard({ post, featured = false }: PostCardProps) {
  return (
    <article
      className={
        featured
          ? "group relative vhs-card border border-border bg-background-panel p-6 md:p-8"
          : "group relative vhs-card border-b border-border-subtle py-6 hover:bg-background-elevated/40"
      }
    >
      <div className="flex flex-wrap items-center gap-3 font-mono text-meta uppercase tracking-[0.14em] text-foreground-muted">
        {post.legacy && (
          <>
            <span className="text-accent-bright/80">Legacy</span>
            <span aria-hidden="true">·</span>
          </>
        )}
        <span className="text-accent-bright">{typeLabel(post.type)}</span>
        <span aria-hidden="true">·</span>
        <span>{post.category}</span>
        <span aria-hidden="true">·</span>
        <time dateTime={post.date}>{formatDate(post.date)}</time>
        <span aria-hidden="true">·</span>
        <span>{post.readingTime}</span>
      </div>

      <h2
        className={
          featured
            ? "mt-3 font-serif text-2xl leading-tight text-foreground transition-colors group-hover:text-accent-bright md:text-3xl"
            : "mt-2 font-serif text-xl leading-snug text-foreground transition-colors group-hover:text-accent-bright"
        }
      >
        <Link href={`/articles/${post.slug}`} className="after:absolute after:inset-0">
          {post.title}
        </Link>
      </h2>

      <p className="post-card-excerpt mt-3 text-foreground-muted leading-relaxed">
        {post.excerpt}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
          <MoodBadge mood={post.mood} />
          {post.verdict && <VerdictBadge verdict={post.verdict} />}
          <TagList tags={post.tags} limit={featured ? 5 : 3} />
        </div>
    </article>
  );
}
