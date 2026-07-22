import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MetalLifestyleContextHeader } from "@/components/archives/metal-lifestyle/MetalLifestyleContextHeader";
import { MetalLifestyleShell } from "@/components/archives/metal-lifestyle/MetalLifestyleShell";
import {
  KNOWN_UNRECOVERABLE_SECTIONS,
  ML_CONTEXT_BASE,
} from "@/config/metal-lifestyle-context";
import { hasMetalLifestyleArchive } from "@/lib/metal-lifestyle-archive";
import { listSpecialCollections } from "@/lib/metal-lifestyle-context";
import { METAL_LIFESTYLE_BASE } from "@/config/metal-lifestyle";

export const metadata: Metadata = {
  title: "Special Collections",
  description:
    "Preserved Metal Lifestyle section hubs and documented known sections.",
};

export default function MetalLifestyleSpecialCollectionsIndexPage() {
  if (!hasMetalLifestyleArchive()) notFound();
  const collections = listSpecialCollections();

  return (
    <MetalLifestyleShell activeHref={`${ML_CONTEXT_BASE}/collections`}>
      <MetalLifestyleContextHeader title="Special Collections">
        <p className="ml-tax-bio">
          Historically significant subsets corresponding to original site
          sections. Recovered collections link to preserved hubs. Known sections
          without recoverable bodies are documented separately — not
          reconstructed.
        </p>
      </MetalLifestyleContextHeader>

      <ul className="ml-series-list">
        {collections.map((c) => (
          <li key={c.def.slug}>
            <Link href={`${ML_CONTEXT_BASE}/collections/${c.def.slug}`}>
              {c.def.title}
            </Link>
            <p>{c.def.description}</p>
            <span className="ml-timeline-meta">
              {c.pageCount} preserved page{c.pageCount === 1 ? "" : "s"}
              {c.blogCount
                ? ` · ${c.blogCount} related blog piece${c.blogCount === 1 ? "" : "s"}`
                : ""}
              {c.span ? ` · ${c.span}` : ""}
            </span>
            {c.hubStatus === "restored" || c.hubStatus === "thin" ? (
              <p className="ml-collection-hub-link">
                <Link href={`${METAL_LIFESTYLE_BASE}/page/${c.def.hubPageSlug}`}>
                  Open original section hub →
                </Link>
              </p>
            ) : null}
          </li>
        ))}
      </ul>

      {KNOWN_UNRECOVERABLE_SECTIONS.length > 0 && (
        <>
          <h2 className="ml-bib-heading">Known sections — currently unrecoverable</h2>
          <ul className="ml-series-list">
            {KNOWN_UNRECOVERABLE_SECTIONS.map((section) => (
              <li key={section.slug}>
                <Link href={`${ML_CONTEXT_BASE}/collections/${section.slug}`}>
                  {section.title}
                </Link>
                <p>{section.description}</p>
                <span className="ml-timeline-meta">
                  {section.kind} · {section.status}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </MetalLifestyleShell>
  );
}
