import type { PostMeta } from "@/types/content";

export function searchPosts(posts: PostMeta[], query: string): PostMeta[] {
  const q = query.trim().toLowerCase();
  if (!q) return posts;

  return posts.filter((post) => {
    const haystack = [
      post.title,
      post.excerpt,
      post.category,
      post.type,
      post.medium,
      post.era,
      post.mood,
      post.originalPublication,
      post.originalSite,
      ...post.tags,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}
