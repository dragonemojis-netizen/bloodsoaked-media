"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { MetalLifestyleArchiveTeaser } from "@/components/archives/metal-lifestyle/MetalLifestyleArchiveTeaser";
import { MetalLifestylePagination } from "@/components/archives/metal-lifestyle/MetalLifestylePagination";
import type { MetalLifestyleManifestEntry } from "@/lib/metal-lifestyle-archive";

const POSTS_PER_PAGE = 10;

interface MetalLifestylePaginatedArchiveProps {
  posts: MetalLifestyleManifestEntry[];
  basePath: string;
  perPage?: number;
}

function paginatePosts(
  posts: MetalLifestyleManifestEntry[],
  page: number,
  perPage: number,
) {
  const totalPages = Math.max(1, Math.ceil(posts.length / perPage));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = (safePage - 1) * perPage;
  return {
    pagePosts: posts.slice(start, start + perPage),
    page: safePage,
    totalPages,
  };
}

function PaginatedArchiveInner({
  posts,
  basePath,
  perPage = POSTS_PER_PAGE,
}: MetalLifestylePaginatedArchiveProps) {
  const pageNum = Number(useSearchParams().get("page") ?? "1") || 1;
  const { pagePosts, page, totalPages } = paginatePosts(posts, pageNum, perPage);

  return (
    <>
      {pagePosts.map((post) => (
        <MetalLifestyleArchiveTeaser key={post.slug} post={post} />
      ))}
      <MetalLifestylePagination
        page={page}
        totalPages={totalPages}
        basePath={basePath}
      />
    </>
  );
}

export function MetalLifestylePaginatedArchive(
  props: MetalLifestylePaginatedArchiveProps,
) {
  return (
    <Suspense fallback={null}>
      <PaginatedArchiveInner {...props} />
    </Suspense>
  );
}
