import { LibraryAccessionPanel } from "@/components/library/LibraryAccessionPanel";
import { LibraryFieldList } from "@/components/library/LibraryFieldList";
import { libraryFields, libraryVoice } from "@/config/library-voice";
import { resolveAuthorityField } from "@/lib/authority";
import type { LibraryEntry } from "@/types/library";

interface LibraryCatalogPanelProps {
  entry: LibraryEntry;
}

export function LibraryCatalogPanel({ entry }: LibraryCatalogPanelProps) {
  const { catalog, authorities } = entry;

  const developer = resolveAuthorityField(
    authorities?.developers,
    catalog.developer,
  );
  const publisher = resolveAuthorityField(
    authorities?.publishers,
    catalog.publisher,
  );
  const platform = resolveAuthorityField(
    authorities?.platforms,
    catalog.platform,
  );

  return (
    <LibraryAccessionPanel
      id="catalog-information"
      eyebrow={libraryVoice.record.catalogInformationEyebrow}
    >
      <LibraryFieldList
        rows={[
          {
            label: libraryFields.originalTitle,
            value: catalog.originalTitle ?? entry.title,
          },
          { label: libraryFields.release, value: catalog.release ?? "" },
          {
            label: libraryFields.developer,
            value: developer.value,
            href: developer.href,
            segments: developer.segments,
          },
          {
            label: libraryFields.publisher,
            value: publisher.value,
            href: publisher.href,
            segments: publisher.segments,
          },
          {
            label: libraryFields.platform,
            value: platform.value,
            href: platform.href,
            segments: platform.segments,
          },
          { label: libraryFields.region, value: catalog.region ?? "" },
          {
            label: libraryFields.medium,
            value: catalog.mediumForm ?? entry.mediaTypeLabel,
          },
          {
            label: libraryFields.director,
            value: catalog.director ?? "",
          },
          { label: libraryFields.artist, value: catalog.artist ?? "" },
          {
            label: libraryFields.subjects,
            value: (catalog.subjects ?? []).join(" · "),
          },
        ]}
      />
    </LibraryAccessionPanel>
  );
}
