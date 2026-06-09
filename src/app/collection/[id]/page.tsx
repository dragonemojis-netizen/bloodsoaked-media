import Link from "next/link";
import { notFound } from "next/navigation";
import { CollectionSpecimenExhibit } from "@/components/collection/CollectionSpecimenExhibit";
import { publication } from "@/config/publication";
import {
  getCollectionArchiveEntry,
  getPublishedCollectionSpecimenIds,
  getSpecimenTitle,
} from "@/lib/collection-archive";
import type { Metadata } from "next";

interface CollectionSpecimenPageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return getPublishedCollectionSpecimenIds().map((id) => ({ id }));
}

export async function generateMetadata({
  params,
}: CollectionSpecimenPageProps): Promise<Metadata> {
  const { id } = await params;
  const entry = getCollectionArchiveEntry(id);
  if (!entry) return {};

  const title = getSpecimenTitle(entry);
  const description =
    entry.notes?.split(/\n\s*\n/)[0]?.trim() ??
    publication.collectionDescription;

  return {
    title,
    description,
  };
}

export default async function CollectionSpecimenPage({
  params,
}: CollectionSpecimenPageProps) {
  const { id } = await params;
  const entry = getCollectionArchiveEntry(id);
  if (!entry) notFound();

  const title = getSpecimenTitle(entry);

  return (
    <div className="collection-world archive-world relative mx-auto max-w-6xl px-6 py-12">
      <nav aria-label="Collection navigation" className="mb-10">
        <Link
          href="/collection"
          className="collection-specimen-back font-mono text-[0.6rem] uppercase tracking-[0.22em] text-foreground-muted transition-colors hover:text-accent-bright"
        >
          {publication.collectionSpecimenBackLink}
        </Link>
        <p className="mt-4 font-mono text-[0.52rem] uppercase tracking-[0.18em] text-foreground-muted/70">
          {publication.collectionArchiveRef} {entry.id}
        </p>
        <h1 className="sr-only">{title}</h1>
      </nav>

      <CollectionSpecimenExhibit entry={entry} solo />
    </div>
  );
}
