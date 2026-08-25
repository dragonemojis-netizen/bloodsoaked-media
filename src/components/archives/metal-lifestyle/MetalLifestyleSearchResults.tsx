"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { MetalLifestyleArchiveTeaser } from "@/components/archives/metal-lifestyle/MetalLifestyleArchiveTeaser";
import type { MetalLifestyleManifestEntry } from "@/lib/metal-lifestyle-archive";

interface SearchablePost extends MetalLifestyleManifestEntry {
  authorName?: string;
  categoryName?: string;
}

interface MetalLifestyleSearchResultsProps {
  posts: SearchablePost[];
}

function SearchResultsInner({ posts }: MetalLifestyleSearchResultsProps) {
  const searchParams = useSearchParams();
  const q = searchParams.get("q")?.trim().toLowerCase() ?? "";
  const author = searchParams.get("author")?.trim().toLowerCase() ?? "";
  const category = searchParams.get("category")?.trim().toLowerCase() ?? "";
  const year = searchParams.get("year")?.trim() ?? "";

  const hasQuery = Boolean(q || author || category || year);
  if (!hasQuery) return null;

  const results = posts.filter((post) => {
    if (
      author &&
      !(post.authorName ?? post.author ?? "").toLowerCase().includes(author)
    ) {
      return false;
    }
    if (
      category &&
      !(post.categoryName ?? post.category ?? "")
        .toLowerCase()
        .includes(category)
    ) {
      return false;
    }
    if (year && !(post.publicationDate ?? "").startsWith(year)) {
      return false;
    }
    if (q) {
      const haystack = [
        post.title,
        post.authorName ?? post.author,
        post.categoryName ?? post.category,
        post.publicationDate,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  return (
    <>
      <p className="ml-tax-count">
        {results.length} result{results.length === 1 ? "" : "s"}
      </p>
      {results.map((post) => (
        <MetalLifestyleArchiveTeaser key={post.slug} post={post} />
      ))}
    </>
  );
}

export function MetalLifestyleSearchResults(
  props: MetalLifestyleSearchResultsProps,
) {
  return (
    <Suspense fallback={null}>
      <SearchResultsInner {...props} />
    </Suspense>
  );
}
