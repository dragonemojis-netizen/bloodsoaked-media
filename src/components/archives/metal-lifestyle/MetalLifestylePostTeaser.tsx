import Link from "next/link";
import type { PostMeta } from "@/types/content";
import { METAL_LIFESTYLE_BASE } from "@/config/metal-lifestyle";
import { formatMetalLifestyleDate } from "@/lib/metal-lifestyle";

interface MetalLifestylePostTeaserProps {
  post: PostMeta;
}

export function MetalLifestylePostTeaser({ post }: MetalLifestylePostTeaserProps) {
  const href = `${METAL_LIFESTYLE_BASE}/${post.slug}`;
  const date = formatMetalLifestyleDate(
    post.originalPublicationDate ?? post.date,
  );

  return (
    <article className="ml-blog-post">
      <div className="ml-blog-header">
        <h2 className="ml-blog-title">
          <Link href={href}>{post.title}</Link>
        </h2>
        <p className="ml-blog-date">
          <span>{date}</span>
        </p>
        <p className="ml-blog-comments">
          <span>0 Comments</span>
        </p>
      </div>
      <div className="ml-blog-separator" aria-hidden="true" />
      <div className="ml-blog-content">
        <p>{post.excerpt}</p>
        <p className="ml-blog-read-more">
          <Link href={href}>Continue reading →</Link>
        </p>
      </div>
    </article>
  );
}
