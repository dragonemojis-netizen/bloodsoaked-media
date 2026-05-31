import { notFound } from "next/navigation";
import { ArchiveShelf } from "@/components/archive/ArchiveShelf";
import { publication } from "@/config/publication";
import { getPostsByMood } from "@/lib/content";
import { moodFromSlug } from "@/lib/slugs";
import { MOODS } from "@/types/content";
import type { Metadata } from "next";

interface MoodPageProps {
  params: Promise<{ mood: string }>;
}

export function generateStaticParams() {
  return MOODS.map((mood) => ({
    mood: mood.toLowerCase().replace(/\s+/g, "-"),
  }));
}

export async function generateMetadata({
  params,
}: MoodPageProps): Promise<Metadata> {
  const { mood } = await params;
  const resolved = moodFromSlug(mood);
  return {
    title: resolved ? `${resolved} · ${publication.moods}` : publication.moods,
  };
}

export default async function ArchiveMoodPage({ params }: MoodPageProps) {
  const { mood: moodSlug } = await params;
  const mood = moodFromSlug(moodSlug);
  if (!mood) notFound();

  const posts = await getPostsByMood(mood);

  return (
    <ArchiveShelf
      title={mood}
      description="Entries filed under this atmosphere — browse by feeling, not format."
      posts={posts}
      breadcrumbs={[
        { label: "Articles", href: "/articles" },
        { label: publication.catalog, href: "/archive" },
        { label: publication.moods, href: "/archive/mood" },
        { label: mood },
      ]}
    />
  );
}
