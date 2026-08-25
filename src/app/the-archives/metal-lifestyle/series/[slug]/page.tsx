import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MetalLifestylePaginatedSeries } from "@/components/archives/metal-lifestyle/MetalLifestylePaginatedSeries";
import { MetalLifestyleShell } from "@/components/archives/metal-lifestyle/MetalLifestyleShell";
import { METAL_LIFESTYLE_BASE } from "@/config/metal-lifestyle";
import { metalLifestyleStaticParams } from "@/lib/metal-lifestyle-deploy";
import {
  detectMetalLifestyleSeries,
  getMetalLifestyleSeries,
  seriesEntryHref,
} from "@/lib/metal-lifestyle-discovery";
import { formatMetalLifestyleDate } from "@/lib/metal-lifestyle";

export const dynamicParams = false;

export function generateStaticParams() {
  return metalLifestyleStaticParams(
    detectMetalLifestyleSeries().map((series) => ({ slug: series.slug })),
  );
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const series = getMetalLifestyleSeries(slug);
  return { title: series ? series.title : "Series" };
}

export default async function MetalLifestyleSeriesPage({ params }: Props) {
  const { slug } = await params;
  const series = getMetalLifestyleSeries(slug);
  if (!series) notFound();

  const entries = series.entries.map((entry) => ({
    key: `${entry.kind}-${entry.slug}`,
    title: entry.title,
    href: seriesEntryHref(entry),
    meta: [
      entry.kind === "page" ? "Section page" : "Article",
      entry.publicationDate
        ? formatMetalLifestyleDate(entry.publicationDate)
        : null,
    ]
      .filter(Boolean)
      .join(" · "),
  }));

  return (
    <MetalLifestyleShell
      activeHref={`${METAL_LIFESTYLE_BASE}/series/${slug}`}
    >
      <header className="ml-tax-header">
        <p className="ml-tax-eyebrow">Editorial Series</p>
        <h1 className="ml-tax-title">{series.title}</h1>
        <p className="ml-tax-bio">{series.description}</p>
        <p className="ml-tax-count">
          {series.entries.length} piece
          {series.entries.length === 1 ? "" : "s"} · recurring editorial feature
        </p>
        <p>
          <Link href={`${METAL_LIFESTYLE_BASE}/series`}>← All series</Link>
        </p>
      </header>
      <MetalLifestylePaginatedSeries
        entries={entries}
        basePath={`${METAL_LIFESTYLE_BASE}/series/${slug}`}
      />
    </MetalLifestyleShell>
  );
}
