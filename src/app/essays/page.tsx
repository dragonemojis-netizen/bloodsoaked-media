import { SectionBreadcrumb } from "@/components/content/SectionBreadcrumb";
import { SectionHeader } from "@/components/content/SectionHeader";
import { PostList } from "@/components/content/PostList";
import { publication } from "@/config/publication";
import { getPostsByType } from "@/lib/content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Essays",
  description:
    "Long-form opinion, personal reflection, and cultural analysis from Bloodsoaked Media.",
};

export default async function EssaysPage() {
  const posts = await getPostsByType("essay");

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <SectionBreadcrumb
        className="mb-8"
        items={[
          { label: "Articles", href: "/articles" },
          { label: "Essays" },
        ]}
      />
      <SectionHeader
        eyebrow="Long-form"
        title="Essays"
        description="Personal writing and analysis — the kind of pieces you save, revisit, and pass along like a worn tape."
      />
      <PostList
        posts={posts}
        emptyMessage={publication.emptyEssays}
      />
    </div>
  );
}
