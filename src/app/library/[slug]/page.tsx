import { notFound } from "next/navigation";
import { LibraryDetailView } from "@/components/library";
import { libraryVoice } from "@/config/library-voice";
import {
  getLibraryAccession,
  getPublishedLibrarySlugs,
} from "@/lib/library";
import type { Metadata } from "next";

interface LibraryEntryPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getPublishedLibrarySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: LibraryEntryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = getLibraryAccession(slug);
  if (!entry) return { title: "Not Found" };

  const published = entry.visibility === "published";

  return {
    title: entry.title,
    description:
      entry.synopsis ?? libraryVoice.description.replace(/\n+/g, " "),
    robots: published
      ? { index: true, follow: true }
      : { index: false, follow: false, nocache: true },
  };
}

export default async function LibraryEntryPage({
  params,
}: LibraryEntryPageProps) {
  const { slug } = await params;
  const entry = getLibraryAccession(slug);
  if (!entry) notFound();

  return (
    <div className="library-world archive-world relative mx-auto max-w-5xl px-6 py-14 md:px-10 md:py-16 lg:py-20">
      <LibraryDetailView entry={entry} />
    </div>
  );
}
