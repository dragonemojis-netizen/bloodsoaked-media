import { Suspense } from "react";
import { SectionHeader } from "@/components/content/SectionHeader";
import { PostList } from "@/components/content/PostList";
import { SearchForm } from "@/components/search/SearchForm";
import { publication } from "@/config/publication";
import { getAllPostMeta, getAllTags, searchPosts } from "@/lib/content";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search",
  description: "Search the Bloodsoaked Media catalog.",
};

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

async function SearchResults({ query }: { query: string }) {
  const posts = await getAllPostMeta();
  const results = searchPosts(posts, query);

  return (
    <>
      <p className="mb-8 font-mono text-[0.7rem] uppercase tracking-[0.15em] text-foreground-muted">
        {results.length} result{results.length === 1 ? "" : "s"} for &ldquo;
        {query}&rdquo;
      </p>
      <PostList
        posts={results}
        emptyMessage={publication.emptySearch}
      />
    </>
  );
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const allPosts = await getAllPostMeta();
  const tags = getAllTags(allPosts);

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <SectionHeader
        eyebrow="Archive"
        title="Search"
        description="Search titles, excerpts, categories, types, and tags across the full publication."
      />

      <Suspense fallback={<div className="h-12 animate-pulse bg-background-panel" />}>
        <SearchForm />
      </Suspense>

      <div className="mt-12">
        {query ? (
          <SearchResults query={query} />
        ) : (
          <p className="text-foreground-muted">
            Enter a term above to search the catalog.
          </p>
        )}
      </div>

      {tags.length > 0 && (
        <section className="mt-16 border-t border-border-subtle pt-10">
          <h2 className="font-mono text-[0.7rem] uppercase tracking-[0.3em] text-foreground-muted">
            Browse by tag
          </h2>
          <ul className="mt-4 flex flex-wrap gap-3">
            {tags.map((tag) => (
              <li key={tag}>
                <Link
                  href={`/search?q=${encodeURIComponent(tag)}`}
                  className="border border-border px-3 py-1 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-foreground-muted transition-colors hover:border-accent hover:text-accent-bright"
                >
                  #{tag}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
