"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MetalLifestylePagination } from "@/components/archives/metal-lifestyle/MetalLifestylePagination";

const ENTRIES_PER_PAGE = 10;

export interface MetalLifestyleSeriesListEntry {
  key: string;
  title: string;
  href: string;
  meta: string;
}

interface MetalLifestylePaginatedSeriesProps {
  entries: MetalLifestyleSeriesListEntry[];
  basePath: string;
}

function PaginatedSeriesInner({
  entries,
  basePath,
}: MetalLifestylePaginatedSeriesProps) {
  const pageNum = Number(useSearchParams().get("page") ?? "1") || 1;
  const totalPages = Math.max(1, Math.ceil(entries.length / ENTRIES_PER_PAGE));
  const safePage = Math.min(Math.max(pageNum, 1), totalPages);
  const start = (safePage - 1) * ENTRIES_PER_PAGE;
  const pageEntries = entries.slice(start, start + ENTRIES_PER_PAGE);

  return (
    <>
      <ol className="ml-series-entry-list">
        {pageEntries.map((entry) => (
          <li key={entry.key} className="ml-series-entry">
            <Link href={entry.href}>{entry.title}</Link>
            <span className="ml-series-entry-meta">{entry.meta}</span>
          </li>
        ))}
      </ol>
      <MetalLifestylePagination
        page={safePage}
        totalPages={totalPages}
        basePath={basePath}
      />
    </>
  );
}

export function MetalLifestylePaginatedSeries(
  props: MetalLifestylePaginatedSeriesProps,
) {
  return (
    <Suspense fallback={null}>
      <PaginatedSeriesInner {...props} />
    </Suspense>
  );
}
