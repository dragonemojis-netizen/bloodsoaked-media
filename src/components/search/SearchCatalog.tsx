"use client";

import { useSearchParams } from "next/navigation";
import { PostList } from "@/components/content/PostList";
import { publication } from "@/config/publication";
import { searchPosts } from "@/lib/content-search";
import type { PostMeta } from "@/types/content";

export function SearchCatalog({ posts }: { posts: PostMeta[] }) {
  const query = useSearchParams().get("q")?.trim() ?? "";
  if (!query) {
    return (
      <p className="text-foreground-muted">
        Enter a term above to search the catalog.
      </p>
    );
  }

  const results = searchPosts(posts, query);

  return (
    <>
      <p className="mb-8 font-mono text-[0.7rem] uppercase tracking-[0.15em] text-foreground-muted">
        {results.length} result{results.length === 1 ? "" : "s"} for &ldquo;
        {query}&rdquo;
      </p>
      <PostList posts={results} emptyMessage={publication.emptySearch} />
    </>
  );
}
