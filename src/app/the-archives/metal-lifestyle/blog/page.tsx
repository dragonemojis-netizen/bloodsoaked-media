import type { Metadata } from "next";
import { MetalLifestyleArchiveTeaser } from "@/components/archives/metal-lifestyle/MetalLifestyleArchiveTeaser";
import { MetalLifestylePagination } from "@/components/archives/metal-lifestyle/MetalLifestylePagination";
import { MetalLifestyleShell } from "@/components/archives/metal-lifestyle/MetalLifestyleShell";
import { MetalLifestyleSidebar } from "@/components/archives/metal-lifestyle/MetalLifestyleSidebar";
import { METAL_LIFESTYLE_BASE } from "@/config/metal-lifestyle";
import {
  hasMetalLifestyleArchive,
  paginateMetalLifestylePosts,
} from "@/lib/metal-lifestyle-archive";
import { notFound } from "next/navigation";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Metal Lifestyle",
  description:
    "Metal Lifestyle publication blog — preserved as originally presented.",
};

interface Props {
  searchParams: Promise<{ page?: string }>;
}

/** Original publication blog index — Weebly browsing experience. */
export default async function MetalLifestyleBlogPage({ searchParams }: Props) {
  if (!hasMetalLifestyleArchive()) notFound();

  const pageNum = Number((await searchParams).page ?? "1") || 1;
  const { posts, page, totalPages, total } =
    paginateMetalLifestylePosts(pageNum);

  return (
    <MetalLifestyleShell
      activeHref={`${METAL_LIFESTYLE_BASE}/blog`}
      withSidebar
      sidebar={<MetalLifestyleSidebar />}
    >
      <p className="ml-pub-note">
        Browsing the publication as preserved.{" "}
        <Link href={METAL_LIFESTYLE_BASE}>Archival catalog</Link>
      </p>
      {total === 0 ? (
        <p className="ml-empty">No restored articles filed yet.</p>
      ) : (
        <>
          {posts.map((post) => (
            <MetalLifestyleArchiveTeaser key={post.slug} post={post} />
          ))}
          <MetalLifestylePagination
            page={page}
            totalPages={totalPages}
            basePath={`${METAL_LIFESTYLE_BASE}/blog`}
          />
        </>
      )}
    </MetalLifestyleShell>
  );
}
