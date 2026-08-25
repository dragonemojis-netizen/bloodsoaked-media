"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { WorkbenchSearch } from "@/components/workbench/WorkbenchSearch";
import type { WorkbenchSearchResult } from "@/lib/workbench";

interface WorkbenchSearchClientProps {
  index: WorkbenchSearchResult[];
}

function WorkbenchSearchInner({ index }: WorkbenchSearchClientProps) {
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.trim() ?? "";
  const q = query.toLowerCase();
  const results = q
    ? index.filter((result) =>
        [result.title, result.meta, result.id]
          .join(" ")
          .toLowerCase()
          .includes(q),
      )
    : [];

  return <WorkbenchSearch query={query} results={results} />;
}

export function WorkbenchSearchClient({ index }: WorkbenchSearchClientProps) {
  return (
    <Suspense fallback={<WorkbenchSearch query="" results={[]} />}>
      <WorkbenchSearchInner index={index} />
    </Suspense>
  );
}
