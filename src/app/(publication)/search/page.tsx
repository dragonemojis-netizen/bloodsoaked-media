import { Suspense } from "react";
import { SectionHeader } from "@/components/content/SectionHeader";
import { SearchForm } from "@/components/search/SearchForm";
import { SearchCatalog } from "@/components/search/SearchCatalog";
import { getAllPostMeta, getAllTags } from "@/lib/content";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search",
  description: "Search the Bloodsoaked Media catalog.",
  robots: {
    index: false,
    follow: true,
  },
};

export default async function SearchPage() {
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
        <Suspense fallback={null}>
          <SearchCatalog posts={allPosts} />
        </Suspense>
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
