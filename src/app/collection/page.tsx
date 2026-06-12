import { SectionKnifeDivider } from "@/components/brand/SectionKnifeDivider";
import { CollectionArchiveGrid } from "@/components/collection/CollectionArchiveGrid";
import { CollectionArchivePrinciple } from "@/components/collection/CollectionArchivePrinciple";
import { CollectionArchiveJournal } from "@/components/collection/CollectionArchiveJournal";
import { CollectionCuratorPreface } from "@/components/collection/CollectionCuratorPreface";
import { CollectionEmptyArchive } from "@/components/collection/CollectionEmptyArchive";
import { CollectionFeaturedArtifact } from "@/components/collection/CollectionFeaturedArtifact";
import { CollectionHero } from "@/components/collection/CollectionHero";
import { publication } from "@/config/publication";
import { getCollectionArchive } from "@/lib/collection-archive";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: publication.collection,
  description: publication.collectionDescription,
};

export default function CollectionPage() {
  const archive = getCollectionArchive();

  return (
    <div className="collection-world archive-world relative mx-auto max-w-6xl px-6 py-10">
      {/* Collection architecture: Hero → Archive Principle → Curator Preface → Collection Body.
          Identity copy above is permanent — never archive-driven or conditional. */}
      <CollectionHero />

      <CollectionArchivePrinciple />

      <CollectionCuratorPreface />

      <div className="collection-body mt-10 space-y-14 md:mt-12 md:space-y-16">
        {archive.isEmpty ? (
          <CollectionEmptyArchive />
        ) : (
          <>
            <CollectionFeaturedArtifact
              entry={archive.featured!}
              solo={archive.entries.length === 0}
            />

            {archive.entries.length > 0 && (
              <>
                <SectionKnifeDivider />

                <CollectionArchiveGrid entries={archive.entries} />
              </>
            )}

            <SectionKnifeDivider />

            <CollectionArchiveJournal />
          </>
        )}
      </div>
    </div>
  );
}
