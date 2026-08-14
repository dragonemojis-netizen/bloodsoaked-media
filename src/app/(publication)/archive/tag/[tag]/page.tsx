import { notFound } from "next/navigation";
import { ArchiveShelf } from "@/components/archive/ArchiveShelf";
import { publication } from "@/config/publication";
import { getPostsByTag, resolveTagFromSlug } from "@/lib/content";
import { getAllPostMeta, getAllTags } from "@/lib/content";
import { slugifyTag } from "@/lib/slugs";
import type { Metadata } from "next";

interface TagPageProps {
  params: Promise<{ tag: string }>;
}

export async function generateStaticParams() {
  const posts = await getAllPostMeta();
  return getAllTags(posts).map((tag) => ({ tag: slugifyTag(tag) }));
}

export async function generateMetadata({
  params,
}: TagPageProps): Promise<Metadata> {
  const { tag } = await params;
  const resolved = await resolveTagFromSlug(tag);
  return {
    title: resolved ? `#${resolved}` : "Tag",
  };
}

export default async function ArchiveTagPage({ params }: TagPageProps) {
  const { tag } = await params;
  const resolved = await resolveTagFromSlug(tag);
  if (!resolved) notFound();

  const posts = await getPostsByTag(tag);

  return (
    <ArchiveShelf
      title={`#${resolved}`}
      description="Entries tagged and filed together in the catalog."
      posts={posts}
      breadcrumbs={[
        { label: "Articles", href: "/articles" },
        { label: publication.catalog, href: "/archive" },
        { label: `#${resolved}` },
      ]}
    />
  );
}
