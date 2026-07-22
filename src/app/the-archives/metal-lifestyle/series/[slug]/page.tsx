import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MetalLifestylePagination } from "@/components/archives/metal-lifestyle/MetalLifestylePagination";
import { MetalLifestyleShell } from "@/components/archives/metal-lifestyle/MetalLifestyleShell";
import { METAL_LIFESTYLE_BASE } from "@/config/metal-lifestyle";
import { paginateSlugs } from "@/lib/metal-lifestyle-archive";
import {
  detectMetalLifestyleSeries,
  getMetalLifestyleSeries,
  seriesEntryHref,
  type SeriesEntry,
} from "@/lib/metal-lifestyle-discovery";
import { formatMetalLifestyleDate } from "@/lib/metal-lifestyle";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export function generateStaticParams() {
  return detectMetalLifestyleSeries().map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const series = getMetalLifestyleSeries(slug);
  return { title: series ? series.title : "Series" };
}

function SeriesEntryRow({ entry }: { entry: SeriesEntry }) {
  const date = entry.publicationDate
    ? formatMetalLifestyleDate(entry.publicationDate)
    : null;
  return (
    <li className="ml-series-entry">
      <Link href={seriesEntryHref(entry)}>{entry.title}</Link>
      <span className="ml-series-entry-meta">
        {entry.kind === "page" ? "Section page" : "Article"}
        {date ? ` · ${date}` : ""}
      </span>
    </li>
  );
}

export default async function MetalLifestyleSeriesPage({
  params,
  searchParams,
}: Props) {
  const { slug } = await params;
  const series = getMetalLifestyleSeries(slug);
  if (!series) notFound();

  const pageNum = Number((await searchParams).page ?? "1") || 1;
  const keys = series.entries.map((e) => `${e.kind}:${e.slug}`);
  const { slugs: pageKeys, page, totalPages, total } = paginateSlugs(
    keys,
    pageNum,
  );
  const keySet = new Set(pageKeys);
  const entries = series.entries.filter((e) =>
    keySet.has(`${e.kind}:${e.slug}`),
  );

  return (
    <MetalLifestyleShell
      activeHref={`${METAL_LIFESTYLE_BASE}/series/${slug}`}
    >
      <header className="ml-tax-header">
        <p className="ml-tax-eyebrow">Editorial Series</p>
        <h1 className="ml-tax-title">{series.title}</h1>
        <p className="ml-tax-bio">{series.description}</p>
        <p className="ml-tax-count">
          {total} piece{total === 1 ? "" : "s"} · recurring editorial feature
        </p>
        <p>
          <Link href={`${METAL_LIFESTYLE_BASE}/series`}>← All series</Link>
        </p>
      </header>
      <ol className="ml-series-entry-list">
        {entries.map((entry) => (
          <SeriesEntryRow key={`${entry.kind}-${entry.slug}`} entry={entry} />
        ))}
      </ol>
      <MetalLifestylePagination
        page={page}
        totalPages={totalPages}
        basePath={`${METAL_LIFESTYLE_BASE}/series/${slug}`}
      />
    </MetalLifestyleShell>
  );
}
