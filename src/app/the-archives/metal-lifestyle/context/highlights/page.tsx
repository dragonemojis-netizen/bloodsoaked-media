import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MetalLifestyleContextHeader } from "@/components/archives/metal-lifestyle/MetalLifestyleContextHeader";
import { MetalLifestyleShell } from "@/components/archives/metal-lifestyle/MetalLifestyleShell";
import {
  COLLECTION_HIGHLIGHTS,
  ML_CONTEXT_BASE,
} from "@/config/metal-lifestyle-context";
import { hasMetalLifestyleArchive } from "@/lib/metal-lifestyle-archive";
import { getHighlightPosts } from "@/lib/metal-lifestyle-context";

export const metadata: Metadata = {
  title: "Collection Highlights",
  description:
    "Curated browsing guides into the Metal Lifestyle archive — outside historical navigation.",
};

export default function MetalLifestyleHighlightsIndexPage() {
  if (!hasMetalLifestyleArchive()) notFound();

  return (
    <MetalLifestyleShell activeHref={`${ML_CONTEXT_BASE}/highlights`}>
      <MetalLifestyleContextHeader title="Collection Highlights">
        <p className="ml-tax-bio">
          Curated entry points for researchers. These guides do not replace the
          original site navigation; they sit beside it.
        </p>
      </MetalLifestyleContextHeader>

      <ul className="ml-series-list">
        {COLLECTION_HIGHLIGHTS.map((h) => {
          const count = getHighlightPosts(h).length;
          return (
            <li key={h.slug}>
              <Link href={`${ML_CONTEXT_BASE}/highlights/${h.slug}`}>
                {h.title}
              </Link>
              <p>{h.description}</p>
              <span className="ml-timeline-meta">
                {count} matching article{count === 1 ? "" : "s"} in the archive
              </span>
            </li>
          );
        })}
      </ul>
    </MetalLifestyleShell>
  );
}
