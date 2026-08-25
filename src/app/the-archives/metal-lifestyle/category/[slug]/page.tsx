import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MetalLifestylePaginatedArchive } from "@/components/archives/metal-lifestyle/MetalLifestylePaginatedArchive";
import { MetalLifestyleShell } from "@/components/archives/metal-lifestyle/MetalLifestyleShell";
import { METAL_LIFESTYLE_BASE } from "@/config/metal-lifestyle";
import {
  getMetalLifestyleCategories,
  getMetalLifestyleCategory,
  resolveManifestPosts,
} from "@/lib/metal-lifestyle-archive";
import { metalLifestyleStaticParams } from "@/lib/metal-lifestyle-deploy";

export const dynamicParams = false;

export function generateStaticParams() {
  return metalLifestyleStaticParams(
    getMetalLifestyleCategories().map((category) => ({ slug: category.slug })),
  );
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = getMetalLifestyleCategory(slug);
  return { title: category ? category.name : "Category" };
}

export default async function MetalLifestyleCategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = getMetalLifestyleCategory(slug);
  if (!category) notFound();

  const posts = resolveManifestPosts(category.articleSlugs);

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
          {posts.length} article{posts.length === 1 ? "" : "s"}
        </p>
        <p>
          <Link href={METAL_LIFESTYLE_BASE}>← Metal Lifestyle</Link>
        </p>
      </header>

      <MetalLifestylePaginatedArchive
        posts={posts}
        basePath={`${METAL_LIFESTYLE_BASE}/category/${slug}`}
      />
    </MetalLifestyleShell>
  );
}
