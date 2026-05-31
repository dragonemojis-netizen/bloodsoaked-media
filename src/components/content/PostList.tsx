import { publication } from "@/config/publication";
import type { PostMeta } from "@/types/content";
import { PostCard } from "./PostCard";

interface PostListProps {
  posts: PostMeta[];
  emptyMessage?: string;
}

export function PostList({
  posts,
  emptyMessage = publication.emptyArticles,
}: PostListProps) {
  if (posts.length === 0) {
    return (
      <p className="py-12 text-center text-foreground-muted">{emptyMessage}</p>
    );
  }

  return (
    <div className="divide-y divide-border-subtle">
      {posts.map((post) => (
        <PostCard key={post.slug} post={post} />
      ))}
    </div>
  );
}
