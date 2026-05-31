import { ArchiveShelf } from "@/components/archive/ArchiveShelf";
import { publication } from "@/config/publication";
import { getPostsByYearMonth } from "@/lib/content";
import type { Metadata } from "next";

interface MonthPageProps {
  params: Promise<{ year: string; month: string }>;
}

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export async function generateStaticParams() {
  const { getAllPostMeta } = await import("@/lib/content");
  const posts = await getAllPostMeta();
  const pairs = new Set<string>();

  for (const post of posts) {
    const d = new Date(post.date);
    const year = d.getFullYear().toString();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    pairs.add(`${year}/${month}`);
  }

  return [...pairs].map((pair) => {
    const [year, month] = pair.split("/");
    return { year, month };
  });
}

export async function generateMetadata({
  params,
}: MonthPageProps): Promise<Metadata> {
  const { year, month } = await params;
  const label = monthNames[Number(month) - 1];
  return { title: `${label} ${year} · ${publication.catalog}` };
}

export default async function ArchiveMonthPage({ params }: MonthPageProps) {
  const { year, month } = await params;
  const posts = await getPostsByYearMonth(year, month);
  const label = monthNames[Number(month) - 1];

  return (
    <ArchiveShelf
      title={`${label} ${year}`}
      posts={posts}
      breadcrumbs={[
        { label: "Articles", href: "/articles" },
        { label: publication.catalog, href: "/archive" },
        { label: year, href: `/archive/year/${year}` },
        { label },
      ]}
    />
  );
}
