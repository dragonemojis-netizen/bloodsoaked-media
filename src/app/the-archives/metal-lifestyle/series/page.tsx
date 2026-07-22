import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MetalLifestyleShell } from "@/components/archives/metal-lifestyle/MetalLifestyleShell";
import { METAL_LIFESTYLE_BASE } from "@/config/metal-lifestyle";
import { hasMetalLifestyleArchive } from "@/lib/metal-lifestyle-archive";
import { detectMetalLifestyleSeries } from "@/lib/metal-lifestyle-discovery";

export const metadata: Metadata = {
  title: "Editorial Series",
  description:
    "Recurring Metal Lifestyle columns and series detected from historical titles.",
};

export default function MetalLifestyleSeriesIndexPage() {
  if (!hasMetalLifestyleArchive()) notFound();
  const series = detectMetalLifestyleSeries();

  return (
    <MetalLifestyleShell activeHref={`${METAL_LIFESTYLE_BASE}/series`}>
      <header className="ml-tax-header">
        <p className="ml-tax-eyebrow">Finding Aid</p>
        <h1 className="ml-tax-title">Editorial Series</h1>
        <p className="ml-tax-bio">
          Recurring editorial features and section columns identified from
          original titles and site structure. Grouped for discovery without
          altering historical content.
        </p>
        <p>
          <Link href={METAL_LIFESTYLE_BASE}>← Catalog</Link>
        </p>
      </header>

      <ul className="ml-series-list">
        {series.map((s) => (
          <li key={s.slug}>
            <Link href={`${METAL_LIFESTYLE_BASE}/series/${s.slug}`}>
              {s.title}
            </Link>
            <p>{s.description}</p>
            <span className="ml-timeline-meta">
              {s.articleCount} piece{s.articleCount === 1 ? "" : "s"}
            </span>
          </li>
        ))}
      </ul>
    </MetalLifestyleShell>
  );
}
