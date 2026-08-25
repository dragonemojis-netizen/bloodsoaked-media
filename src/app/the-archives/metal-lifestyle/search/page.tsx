import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MetalLifestyleSearchForm } from "@/components/archives/metal-lifestyle/MetalLifestyleSearchForm";
import { MetalLifestyleSearchResults } from "@/components/archives/metal-lifestyle/MetalLifestyleSearchResults";
import { MetalLifestyleShell } from "@/components/archives/metal-lifestyle/MetalLifestyleShell";
import { METAL_LIFESTYLE_BASE } from "@/config/metal-lifestyle";
import {
  getMetalLifestyleAuthors,
  getMetalLifestyleCategories,
  getMetalLifestyleManifest,
  hasMetalLifestyleArchive,
} from "@/lib/metal-lifestyle-archive";
import { getMetalLifestyleCatalogStats } from "@/lib/metal-lifestyle-discovery";

export const metadata: Metadata = {
  title: "Archive Search",
  description:
    "Search the preserved Metal Lifestyle publication by historical metadata.",
};

export default function MetalLifestyleSearchPage() {
  if (!hasMetalLifestyleArchive()) notFound();

  const authors = getMetalLifestyleAuthors().map((a) => a.name);
  const categories = getMetalLifestyleCategories().map((c) => c.name);
  const stats = getMetalLifestyleCatalogStats();
  const years: string[] = [];
  if (stats?.yearStart && stats?.yearEnd) {
    for (let y = stats.yearEnd; y >= stats.yearStart; y--) {
      years.push(String(y));
    }
  }

  const posts =
    getMetalLifestyleManifest()?.posts.filter(
      (post) => post.status !== "unavailable",
    ) ?? [];

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
        authors={authors}
        categories={categories}
        years={years}
      />

      <MetalLifestyleSearchResults posts={posts} />
    </MetalLifestyleShell>
  );
}
