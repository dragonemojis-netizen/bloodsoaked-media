import { notFound } from "next/navigation";
import { ArchiveShelf } from "@/components/archive/ArchiveShelf";
import { publication, categoryLabels } from "@/config/publication";
import { getPostsByCategory } from "@/lib/content";
import { CATEGORIES, type Category } from "@/types/content";
import type { Metadata } from "next";

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export function generateStaticParams() {
  return CATEGORIES.map((category) => ({ category }));
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const label = categoryLabels[category] ?? category;
  return { title: `${label} · ${publication.catalog}` };
}

export default async function ArchiveCategoryPage({
  params,
}: CategoryPageProps) {
  const { category } = await params;
  if (!CATEGORIES.includes(category as Category)) notFound();

  const posts = await getPostsByCategory(category as Category);
  const label = categoryLabels[category] ?? category;

  return (
    <ArchiveShelf
      title={label}
      description={`The ${label.toLowerCase()} shelf — criticism, essays, and features filed under this section of the catalog.`}
      posts={posts}
      breadcrumbs={[
        { label: "Articles", href: "/articles" },
        { label: publication.catalog, href: "/archive" },
        { label },
      ]}
    />
  );
}
