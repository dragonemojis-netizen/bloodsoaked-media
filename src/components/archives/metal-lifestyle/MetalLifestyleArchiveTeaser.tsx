import Link from "next/link";
import type { MetalLifestyleManifestEntry } from "@/lib/metal-lifestyle-archive";
import { METAL_LIFESTYLE_BASE } from "@/config/metal-lifestyle";
import { formatMetalLifestyleDate } from "@/lib/metal-lifestyle-format";

interface Props {
  post: MetalLifestyleManifestEntry;
}

export function MetalLifestyleArchiveTeaser({ post }: Props) {
  const href = `${METAL_LIFESTYLE_BASE}/post/${post.slug}`;
  const date = post.publicationDate
    ? formatMetalLifestyleDate(post.publicationDate)
    : null;

  return (
    <article className="ml-blog-post">
      <div className="ml-blog-header">
        <h2 className="ml-blog-title">
          <Link href={href}>{post.title}</Link>
        </h2>
        {date && (
          <p className="ml-blog-date">
            <span>{date}</span>
          </p>
        )}
        <p className="ml-blog-comments">
          <span>0 Comments</span>
        </p>
        {post.author && (
          <p className="ml-blog-author">
            <span>{post.author}</span>
          </p>
        )}
        {post.category && (
          <p className="ml-blog-category">
            <span>{post.category}</span>
          </p>
        )}
      </div>
      <div className="ml-blog-separator" aria-hidden="true" />
      <div className="ml-blog-content">
        {post.excerpt && <p>{post.excerpt}</p>}
        <p className="ml-blog-read-more">
          <Link href={href}>Continue reading →</Link>
        </p>
      </div>
    </article>
  );
}
