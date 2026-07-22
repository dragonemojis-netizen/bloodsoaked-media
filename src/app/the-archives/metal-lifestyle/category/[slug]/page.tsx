import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MetalLifestyleArchiveTeaser } from "@/components/archives/metal-lifestyle/MetalLifestyleArchiveTeaser";
import { MetalLifestylePagination } from "@/components/archives/metal-lifestyle/MetalLifestylePagination";
import { MetalLifestyleShell } from "@/components/archives/metal-lifestyle/MetalLifestyleShell";
import { METAL_LIFESTYLE_BASE } from "@/config/metal-lifestyle";
import {
  getMetalLifestyleCategories,
  getMetalLifestyleCategory,
  paginateSlugs,
  resolveManifestPosts,
} from "@/lib/metal-lifestyle-archive";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export function generateStaticParams() {
  return getMetalLifestyleCategories().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = getMetalLifestyleCategory(slug);
  return { title: category ? category.name : "Category" };
}

export default async function MetalLifestyleCategoryPage({
  params,
  searchParams,
}: Props) {
  const { slug } = await params;
  const category = getMetalLifestyleCategory(slug);
  if (!category) notFound();

  const pageNum = Number((await searchParams).page ?? "1") || 1;
  const { slugs, page, totalPages, total } = paginateSlugs(
    category.articleSlugs,
    pageNum,
  );
  const posts = resolveManifestPosts(slugs);

  return (
    <MetalLifestyleShell
      activeHref={`${METAL_LIFESTYLE_BASE}/category/${slug}`}
    >
      <header className="ml-tax-header">
        <p className="ml-tax-eyebrow">Category</p>
        <h1 className="ml-tax-title">{category.name}</h1>
        {category.description ? (
          <p className="ml-tax-bio">{category.description}</p>
        ) : (
          <p className="ml-tax-bio">
            Historical category archive. Articles listed in reverse
            chronological order as preserved.
          </p>
        )}
        <p className="ml-tax-count">
          {total} article{total === 1 ? "" : "s"}
        </p>
        <p>
          <Link href={METAL_LIFESTYLE_BASE}>← Metal Lifestyle</Link>
        </p>
      </header>

      {posts.map((post) => (
        <MetalLifestyleArchiveTeaser key={post.slug} post={post} />
      ))}
      <MetalLifestylePagination
        page={page}
        totalPages={totalPages}
        basePath={`${METAL_LIFESTYLE_BASE}/category/${slug}`}
      />
    </MetalLifestyleShell>
  );
}
