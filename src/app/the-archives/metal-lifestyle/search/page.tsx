import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MetalLifestyleArchiveTeaser } from "@/components/archives/metal-lifestyle/MetalLifestyleArchiveTeaser";
import { MetalLifestyleSearchForm } from "@/components/archives/metal-lifestyle/MetalLifestyleSearchForm";
import { MetalLifestyleShell } from "@/components/archives/metal-lifestyle/MetalLifestyleShell";
import { METAL_LIFESTYLE_BASE } from "@/config/metal-lifestyle";
import {
  getMetalLifestyleAuthors,
  getMetalLifestyleCategories,
  hasMetalLifestyleArchive,
} from "@/lib/metal-lifestyle-archive";
import {
  getMetalLifestyleCatalogStats,
  searchMetalLifestyleArchive,
} from "@/lib/metal-lifestyle-discovery";

export const metadata: Metadata = {
  title: "Archive Search",
  description:
    "Search the preserved Metal Lifestyle publication by historical metadata.",
};

interface Props {
  searchParams: Promise<{
    q?: string;
    author?: string;
    category?: string;
    year?: string;
  }>;
}

export default async function MetalLifestyleSearchPage({ searchParams }: Props) {
  if (!hasMetalLifestyleArchive()) notFound();

  const params = await searchParams;
  const results = searchMetalLifestyleArchive({
    q: params.q,
    author: params.author,
    category: params.category,
    year: params.year,
  });

  const authors = getMetalLifestyleAuthors().map((a) => a.name);
  const categories = getMetalLifestyleCategories().map((c) => c.name);
  const stats = getMetalLifestyleCatalogStats();
  const years: string[] = [];
  if (stats?.yearStart && stats?.yearEnd) {
    for (let y = stats.yearEnd; y >= stats.yearStart; y--) {
      years.push(String(y));
    }
  }

  const hasQuery = Boolean(
    params.q || params.author || params.category || params.year,
  );

  return (
    <MetalLifestyleShell activeHref={`${METAL_LIFESTYLE_BASE}/search`}>
      <header className="ml-tax-header">
        <p className="ml-tax-eyebrow">Finding Aid</p>
        <h1 className="ml-tax-title">Archive Search</h1>
        <p className="ml-tax-bio">
          Search titles, authors, categories, and publication years using
          preserved metadata.
        </p>
        <p>
          <Link href={METAL_LIFESTYLE_BASE}>← Catalog</Link>
        </p>
      </header>

      <MetalLifestyleSearchForm
        initialQuery={params.q}
        initialAuthor={params.author}
        initialCategory={params.category}
        initialYear={params.year}
        authors={authors}
        categories={categories}
        years={years}
      />

      {hasQuery && (
        <p className="ml-tax-count">
          {results.length} result{results.length === 1 ? "" : "s"}
        </p>
      )}

      {hasQuery &&
        results.map((post) => (
          <MetalLifestyleArchiveTeaser key={post.slug} post={post} />
        ))}
    </MetalLifestyleShell>
  );
}
