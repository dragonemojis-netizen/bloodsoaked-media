import type { Metadata } from "next";
import { MetalLifestylePaginatedArchive } from "@/components/archives/metal-lifestyle/MetalLifestylePaginatedArchive";
import { MetalLifestyleShell } from "@/components/archives/metal-lifestyle/MetalLifestyleShell";
import { MetalLifestyleSidebar } from "@/components/archives/metal-lifestyle/MetalLifestyleSidebar";
import { METAL_LIFESTYLE_BASE } from "@/config/metal-lifestyle";
import {
  getMetalLifestyleManifest,
  hasMetalLifestyleArchive,
} from "@/lib/metal-lifestyle-archive";
import { notFound } from "next/navigation";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Metal Lifestyle",
  description:
    "Metal Lifestyle publication blog — preserved as originally presented.",
};

/** Original publication blog index — Weebly browsing experience. */
export default function MetalLifestyleBlogPage() {
  if (!hasMetalLifestyleArchive()) notFound();

  const posts =
    getMetalLifestyleManifest()?.posts.filter(
      (post) => post.status !== "unavailable",
    ) ?? [];

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
      {posts.length === 0 ? (
        <p className="ml-empty">No restored articles filed yet.</p>
      ) : (
        <MetalLifestylePaginatedArchive
          posts={posts}
          basePath={`${METAL_LIFESTYLE_BASE}/blog`}
        />
      )}
    </MetalLifestyleShell>
  );
}
