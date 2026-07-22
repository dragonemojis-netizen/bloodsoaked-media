import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MetalLifestyleArchiveBody } from "@/components/archives/metal-lifestyle/MetalLifestyleArchiveBody";
import { MetalLifestyleRelatedReading } from "@/components/archives/metal-lifestyle/MetalLifestyleRelatedReading";
import { MetalLifestyleShell } from "@/components/archives/metal-lifestyle/MetalLifestyleShell";
import { MetalLifestyleSidebar } from "@/components/archives/metal-lifestyle/MetalLifestyleSidebar";
import { METAL_LIFESTYLE_BASE } from "@/config/metal-lifestyle";
import {
  getMetalLifestylePost,
  listMetalLifestylePostSlugs,
} from "@/lib/metal-lifestyle-archive";
import { getRelatedReading } from "@/lib/metal-lifestyle-discovery";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return listMetalLifestylePostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getMetalLifestylePost(slug);
  if (!post) return { title: "Metal Lifestyle" };
  return {
    title: post.title,
    description: post.text.slice(0, 160),
  };
}

export default async function MetalLifestyleRestoredPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getMetalLifestylePost(slug);
  if (!post) notFound();

  const related = getRelatedReading(slug);

  return (
    <MetalLifestyleShell
      activeHref={`${METAL_LIFESTYLE_BASE}/blog`}
      withSidebar
      sidebar={<MetalLifestyleSidebar />}
    >
      <MetalLifestyleArchiveBody record={post} />
      <MetalLifestyleRelatedReading items={related} />
    </MetalLifestyleShell>
  );
}
