import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MetalLifestyleContextHeader } from "@/components/archives/metal-lifestyle/MetalLifestyleContextHeader";
import { MetalLifestylePaginatedArchive } from "@/components/archives/metal-lifestyle/MetalLifestylePaginatedArchive";
import { MetalLifestyleShell } from "@/components/archives/metal-lifestyle/MetalLifestyleShell";
import {
  COLLECTION_HIGHLIGHTS,
  ML_CONTEXT_BASE,
} from "@/config/metal-lifestyle-context";
import { metalLifestyleStaticParams } from "@/lib/metal-lifestyle-deploy";
import {
  getHighlightBySlug,
  getHighlightPosts,
} from "@/lib/metal-lifestyle-context";

export const dynamicParams = false;

export function generateStaticParams() {
  return metalLifestyleStaticParams(
    COLLECTION_HIGHLIGHTS.map((highlight) => ({ slug: highlight.slug })),
  );
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const highlight = getHighlightBySlug(slug);
  return { title: highlight ? highlight.title : "Highlight" };
}

export default async function MetalLifestyleHighlightPage({ params }: Props) {
  const { slug } = await params;
  const highlight = getHighlightBySlug(slug);
  if (!highlight) notFound();

  const posts = getHighlightPosts(highlight);

  return (
    <MetalLifestyleShell
      activeHref={`${ML_CONTEXT_BASE}/highlights/${slug}`}
    >
      <MetalLifestyleContextHeader title={highlight.title}>
        <p className="ml-tax-bio">{highlight.description}</p>
        <p className="ml-tax-count">
          {posts.length} article{posts.length === 1 ? "" : "s"} · browsing guide
          only
        </p>
        <p>
          <Link href={`${ML_CONTEXT_BASE}/highlights`}>← All highlights</Link>
        </p>
      </MetalLifestyleContextHeader>

      <MetalLifestylePaginatedArchive
        posts={posts}
        basePath={`${ML_CONTEXT_BASE}/highlights/${slug}`}
      />
    </MetalLifestyleShell>
  );
}
