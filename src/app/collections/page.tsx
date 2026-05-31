import Link from "next/link";
import { SectionHeader } from "@/components/content/SectionHeader";
import { PostList } from "@/components/content/PostList";
import { CollectionCard } from "@/components/collections/CollectionCard";
import { publication } from "@/config/publication";
import { getPostsByType } from "@/lib/content";
import { getAllCollections } from "@/lib/collections";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Collections",
  description:
    "Curated archives — physical shelves, platform libraries, and personal museum exhibits.",
};

export default async function CollectionsPage() {
  const collections = getAllCollections();
  const features = await getPostsByType("collection");

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <SectionHeader
        eyebrow={publication.collectionsEyebrow}
        title={publication.collections}
        description="Curated archives of games, films, and physical media — presented like exhibits, not spreadsheets. Each collection is a shelf with a story."
      />

      {collections.length === 0 ? (
        <p className="text-foreground-muted">No collections catalogued yet.</p>
      ) : (
        <div className="museum-grid grid gap-8 sm:grid-cols-2 lg:grid-cols-2">
          {collections.map((collection) => (
            <CollectionCard key={collection.slug} collection={collection} />
          ))}
        </div>
      )}

      {features.length > 0 && (
        <section className="mt-20 border-t border-border-subtle pt-16">
          <SectionHeader
            eyebrow="Long-form"
            title={publication.collectionFeatures}
            description="Written features about collecting, preservation, and physical media culture."
          />
          <PostList posts={features} />
        </section>
      )}
    </div>
  );
}
