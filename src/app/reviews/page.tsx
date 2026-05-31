import { SectionBreadcrumb } from "@/components/content/SectionBreadcrumb";
import { SectionHeader } from "@/components/content/SectionHeader";
import { PostList } from "@/components/content/PostList";
import { publication } from "@/config/publication";
import { getPostsByType } from "@/lib/content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reviews",
  description:
    "Thoughtful criticism of games, film, television, and music — no scores, just verdicts.",
};

export default async function ReviewsPage() {
  const posts = await getPostsByType("review");

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <SectionBreadcrumb
        className="mb-8"
        items={[
          { label: "Articles", href: "/articles" },
          { label: "Reviews" },
        ]}
      />
      <SectionHeader
        eyebrow="Criticism"
        title="Reviews"
        description="Games, movies, television, and music examined with care. Verdicts use words, not numbers — Recommended, Recommended With Caveats, For Fans Only, or Not Recommended."
      />
      <PostList
        posts={posts}
        emptyMessage={publication.emptyReviews}
      />
    </div>
  );
}
