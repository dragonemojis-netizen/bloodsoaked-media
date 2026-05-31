import { SectionExplore } from "@/components/content/SectionExplore";
import { SectionHeader } from "@/components/content/SectionHeader";
import { PostList } from "@/components/content/PostList";
import { publication } from "@/config/publication";
import { getCurrentPostMeta } from "@/lib/content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Articles",
  description:
    "All written content from Bloodsoaked Media — reviews, essays, retrospectives, and more.",
};

export default async function ArticlesPage() {
  const posts = await getCurrentPostMeta();

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <SectionHeader
        eyebrow="The Desk"
        title="Articles"
        description="Reviews, essays, retrospectives, and editorials from the current publication — filed as they are written, not sorted like a database."
      />

      <SectionExplore
        className="mb-10"
        links={[
          { href: "/archive", label: publication.catalog },
          { href: "/reviews", label: "Reviews" },
          { href: "/essays", label: "Essays" },
          { href: "/search", label: "Search" },
        ]}
      />

      <PostList posts={posts} />
    </div>
  );
}
