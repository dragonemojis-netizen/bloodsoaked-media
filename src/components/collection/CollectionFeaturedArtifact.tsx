import type { CollectionArchiveEntry } from "@/lib/collection-archive";
import { CollectionSpecimenExhibit } from "./CollectionSpecimenExhibit";

interface CollectionFeaturedArtifactProps {
  entry: CollectionArchiveEntry;
  solo?: boolean;
}

export function CollectionFeaturedArtifact({
  entry,
  solo = false,
}: CollectionFeaturedArtifactProps) {
  return <CollectionSpecimenExhibit entry={entry} solo={solo} />;
}
