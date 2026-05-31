import { ArchiveShelf } from "@/components/archive/ArchiveShelf";
import { publication } from "@/config/publication";
import { getPostsByYear } from "@/lib/content";
import type { Metadata } from "next";

interface YearPageProps {
  params: Promise<{ year: string }>;
}

export async function generateStaticParams() {
  const { getAllPostMeta, getArchiveYears } = await import("@/lib/content");
  const posts = await getAllPostMeta();
  return getArchiveYears(posts).map((year) => ({ year }));
}

export async function generateMetadata({
  params,
}: YearPageProps): Promise<Metadata> {
  const { year } = await params;
  return { title: `${year} · ${publication.catalog}` };
}

export default async function ArchiveYearPage({ params }: YearPageProps) {
  const { year } = await params;
  const posts = await getPostsByYear(year);

  return (
    <ArchiveShelf
      title={year}
      description={`Every entry filed in ${year} — pull a story from the shelf.`}
      posts={posts}
      breadcrumbs={[
        { label: "Articles", href: "/articles" },
        { label: publication.catalog, href: "/archive" },
        { label: year },
      ]}
    />
  );
}
