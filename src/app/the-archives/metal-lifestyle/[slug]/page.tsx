/**
 * DEPRECATED route — legacy Markdown pipeline (`content/legacy`).
 * Canonical restored articles live at `/post/[slug]`.
 * Kept for compatibility with older Dakota-era imports only.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MetalLifestyleArticle } from "@/components/archives/metal-lifestyle/MetalLifestyleArticle";
import { MetalLifestyleShell } from "@/components/archives/metal-lifestyle/MetalLifestyleShell";
import { MetalLifestyleSidebar } from "@/components/archives/metal-lifestyle/MetalLifestyleSidebar";
import { METAL_LIFESTYLE_BASE } from "@/config/metal-lifestyle";
import { getPostBySlug } from "@/lib/content";
import {
  getMetalLifestylePosts,
} from "@/lib/metal-lifestyle";
import { metalLifestyleStaticParams } from "@/lib/metal-lifestyle-deploy";

interface MetalLifestyleArticlePageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export async function generateStaticParams() {
  const posts = await getMetalLifestylePosts();
  return metalLifestyleStaticParams(posts.map((post) => ({ slug: post.slug })));
}

export async function generateMetadata({
  params,
}: MetalLifestyleArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Metal Lifestyle" };
  return {
    title: `${post.title} · Metal Lifestyle`,
    description: post.excerpt,
  };
}

export default async function MetalLifestyleArticlePage({
  params,
}: MetalLifestyleArticlePageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post || !post.legacy) {
    notFound();
  }

  const mlPosts = await getMetalLifestylePosts();
  if (!mlPosts.some((p) => p.slug === slug)) {
    notFound();
  }

  return (
    <MetalLifestyleShell
      activeHref={METAL_LIFESTYLE_BASE}
      withSidebar
      sidebar={<MetalLifestyleSidebar />}
    >
      <MetalLifestyleArticle post={post} />
    </MetalLifestyleShell>
  );
}
