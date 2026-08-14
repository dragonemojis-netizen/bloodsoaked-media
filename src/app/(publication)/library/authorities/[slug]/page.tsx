import { AuthorityDetailView } from "@/components/library/AuthorityDetailView";
import { authorityVoice } from "@/config/authority-voice";
import {
  getAuthorityEntry,
  getPublishedAuthoritySlugs,
} from "@/lib/authority";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

interface AuthorityPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getPublishedAuthoritySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: AuthorityPageProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = getAuthorityEntry(slug);
  if (!entry) return { title: "Not Found" };

  const published = entry.visibility === "published";

  return {
    title: `${entry.preferredName} · ${authorityVoice.name}`,
    description:
      entry.description?.trim() ||
      `${entry.typeLabel} — Authority Record in the Bloodsoaked Archive.`,
    robots: published
      ? { index: true, follow: true }
      : { index: false, follow: false, nocache: true },
  };
}

export default async function AuthorityRecordPage({
  params,
}: AuthorityPageProps) {
  const { slug } = await params;
  const entry = getAuthorityEntry(slug);
  if (!entry) notFound();

  return (
    <div className="library-world archive-world relative mx-auto max-w-3xl px-6 py-14 md:px-10 md:py-16 lg:py-20">
      <Link href="/library/authorities" className="library-detail-back library-field-link">
        ← Authority File
      </Link>
      <div className="mt-10">
        <AuthorityDetailView entry={entry} />
      </div>
    </div>
  );
}
