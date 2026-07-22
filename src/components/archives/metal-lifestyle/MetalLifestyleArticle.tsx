import type { Post } from "@/types/content";
import { formatMetalLifestyleDate, rewriteWeeblyMediaUrls } from "@/lib/metal-lifestyle";

interface MetalLifestyleArticleProps {
  post: Post;
}

export function MetalLifestyleArticle({ post }: MetalLifestyleArticleProps) {
  const date = formatMetalLifestyleDate(
    post.originalPublicationDate ?? post.date,
  );
  const html = rewriteWeeblyMediaUrls(post.html);

  return (
    <article className="ml-blog-post ml-blog-post--full">
      <div className="ml-blog-header">
        <h2 className="ml-blog-title">{post.title}</h2>
        <p className="ml-blog-date">
          <span>{date}</span>
        </p>
        <p className="ml-blog-comments">
          <span>0 Comments</span>
        </p>
      </div>
      <div className="ml-blog-separator" aria-hidden="true" />
      <div
        className="ml-blog-content"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </article>
  );
}
