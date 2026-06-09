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
  const specimenCount = archive.isEmpty
    ? 0
    : archive.stats.catalogued;
  const showCuratorPreface = specimenCount > 0 && specimenCount <= 4;

  return (
    <div className="collection-world archive-world relative mx-auto max-w-6xl px-6 py-12">
      {/* Collection architecture: Hero → Archive Principle → Collection Body.
          The principle is permanent identity copy — never archive-driven or conditional. */}
      <CollectionHero />

      <CollectionArchivePrinciple />

      <div className="collection-body mt-12 space-y-16 md:mt-14 md:space-y-20">
        {archive.isEmpty ? (
          <CollectionEmptyArchive />
        ) : (
          <>
            {showCuratorPreface && (
              <CollectionCuratorPreface specimenCount={specimenCount} />
            )}

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
          </>
        )}

        {!archive.isEmpty && (
          <>
            <SectionKnifeDivider />

            <CollectionArchiveJournal stats={archive.stats} />
          </>
        )}
      </div>
    </div>
  );
}
