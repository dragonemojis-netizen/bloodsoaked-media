import Link from "next/link";
import { notFound } from "next/navigation";
import { CollectionExhibit } from "@/components/collections/CollectionExhibit";
import { CollectionLinked } from "@/components/collections/CollectionLinked";
import { publication } from "@/config/publication";
import {
  isLegacyArchivePublic,
  isLegacyOnlyCollection,
} from "@/lib/legacy-gate";
import { getAllCollections, getCollection } from "@/lib/collections";
import type { Metadata } from "next";

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllCollections().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const collection = getCollection(slug);
  if (!collection) return { title: "Not Found" };

  return {
    title: collection.title,
    description: collection.description,
  };
}

export default async function CollectionDetailPage({
  params,
}: CollectionPageProps) {
  const { slug } = await params;
  if (!isLegacyArchivePublic() && isLegacyOnlyCollection(slug)) notFound();
  const collection = getCollection(slug);
  if (!collection) notFound();

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <Link
        href="/collections"
        className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-foreground-muted transition-colors hover:text-accent-bright"
      >
        ← {publication.collections}
      </Link>

      <div className="mt-8">
        <CollectionExhibit collection={collection} />
        <CollectionLinked
          articleSlugs={collection.articleSlugs ?? []}
          mediaLogSlugs={collection.mediaLogSlugs ?? []}
        />
      </div>
    </div>
  );
}
