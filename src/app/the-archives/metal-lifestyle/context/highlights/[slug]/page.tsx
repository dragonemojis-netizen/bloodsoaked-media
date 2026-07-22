import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MetalLifestyleArchiveTeaser } from "@/components/archives/metal-lifestyle/MetalLifestyleArchiveTeaser";
import { MetalLifestyleContextHeader } from "@/components/archives/metal-lifestyle/MetalLifestyleContextHeader";
import { MetalLifestylePagination } from "@/components/archives/metal-lifestyle/MetalLifestylePagination";
import { MetalLifestyleShell } from "@/components/archives/metal-lifestyle/MetalLifestyleShell";
import {
  COLLECTION_HIGHLIGHTS,
  ML_CONTEXT_BASE,
} from "@/config/metal-lifestyle-context";
import { paginateSlugs } from "@/lib/metal-lifestyle-archive";
import {
  getHighlightBySlug,
  getHighlightPosts,
} from "@/lib/metal-lifestyle-context";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export function generateStaticParams() {
  return COLLECTION_HIGHLIGHTS.map((h) => ({ slug: h.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const highlight = getHighlightBySlug(slug);
  return { title: highlight ? highlight.title : "Highlight" };
}

export default async function MetalLifestyleHighlightPage({
  params,
  searchParams,
}: Props) {
  const { slug } = await params;
  const highlight = getHighlightBySlug(slug);
  if (!highlight) notFound();

  const all = getHighlightPosts(highlight);
  const pageNum = Number((await searchParams).page ?? "1") || 1;
  const { slugs, page, totalPages, total } = paginateSlugs(
    all.map((p) => p.slug),
    pageNum,
  );
  const posts = all.filter((p) => slugs.includes(p.slug));

  return (
    <MetalLifestyleShell
      activeHref={`${ML_CONTEXT_BASE}/highlights/${slug}`}
    >
      <MetalLifestyleContextHeader title={highlight.title}>
        <p className="ml-tax-bio">{highlight.description}</p>
        <p className="ml-tax-count">
          {total} article{total === 1 ? "" : "s"} · browsing guide only
        </p>
        <p>
          <Link href={`${ML_CONTEXT_BASE}/highlights`}>← All highlights</Link>
        </p>
      </MetalLifestyleContextHeader>

      {posts.map((post) => (
        <MetalLifestyleArchiveTeaser key={post.slug} post={post} />
      ))}
      <MetalLifestylePagination
        page={page}
        totalPages={totalPages}
        basePath={`${ML_CONTEXT_BASE}/highlights/${slug}`}
      />
    </MetalLifestyleShell>
  );
}
