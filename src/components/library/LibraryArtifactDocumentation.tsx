"use client";

import Image from "next/image";
import { useState } from "react";
import { LibraryAccessionPanel } from "@/components/library/LibraryAccessionPanel";
import { LibraryArtifactLightbox } from "@/components/library/LibraryArtifactLightbox";
import { libraryFields, libraryVoice } from "@/config/library-voice";
import type { LibraryArtifactImage, LibraryEntry } from "@/types/library";

interface LibraryArtifactDocumentationProps {
  entry: LibraryEntry;
}

/**
 * Artifact Documentation — archival gallery of the preserved physical copy.
 * Scales to dozens of photographs; layout does not change with count.
 * Digital holdings without physical objects use a quieter, finished empty state.
 */
export function LibraryArtifactDocumentation({
  entry,
}: LibraryArtifactDocumentationProps) {
  const images = entry.artifacts;
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const isDigitalHolding =
    Boolean(entry.steam) || entry.accession?.source === "digital-library";
  const emptyLead = isDigitalHolding
    ? libraryVoice.record.artifactDocumentationDigitalLead
    : libraryVoice.record.artifactDocumentationLead;
  const emptyPrepared = isDigitalHolding
    ? libraryVoice.record.artifactDocumentationDigitalPrepared
    : libraryVoice.record.artifactDocumentationPrepared;

  function openAt(i: number) {
    setIndex(i);
    setOpen(true);
  }

  return (
    <>
      <LibraryAccessionPanel
        id="artifact-documentation"
        eyebrow={libraryVoice.record.artifactDocumentationEyebrow}
        tone="prose"
      >
        <p className="library-artifact-lead max-w-xl text-sm leading-relaxed text-foreground-muted/85">
          {images.length > 0
            ? libraryVoice.record.artifactDocumentationLead
            : emptyLead}
        </p>

        {images.length === 0 ? (
          <p className="mt-8 max-w-xl border-t border-border-subtle/70 pt-6 font-serif text-sm italic leading-relaxed text-foreground-muted/75">
            {emptyPrepared}
          </p>
        ) : (
          <ul className="library-artifact-gallery mt-8" role="list">
            {images.map((image, i) => (
              <li key={image.id} className="library-artifact-tile">
                <button
                  type="button"
                  className="library-artifact-tile-button group"
                  onClick={() => openAt(i)}
                  aria-label={libraryVoice.record.openArtifactAria(image.view)}
                >
                  <span className="library-artifact-tile-frame">
                    <Image
                      src={image.src}
                      alt={`${entry.title} — ${image.view}`}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 220px"
                      quality={92}
                      className="object-cover"
                    />
                  </span>
                  <span className="library-artifact-tile-meta">
                    <span className="library-artifact-tile-view">{image.view}</span>
                    {image.kind && (
                      <span className="library-artifact-tile-kind">{image.kind}</span>
                    )}
                  </span>
                </button>
                {image.note && (
                  <p className="library-artifact-caption">{image.note}</p>
                )}
                <ArtifactPlacard image={image} />
              </li>
            ))}
          </ul>
        )}
      </LibraryAccessionPanel>

      {open && images.length > 0 && (
        <LibraryArtifactLightbox
          images={images}
          index={index}
          open
          onClose={() => setOpen(false)}
          onIndexChange={setIndex}
          workTitle={entry.title}
        />
      )}
    </>
  );
}

function ArtifactPlacard({ image }: { image: LibraryArtifactImage }) {
  const rows: { label: string; value: string }[] = [
    { label: libraryFields.captured, value: image.captured ?? "" },
    { label: libraryFields.resolution, value: image.resolution ?? "" },
    { label: libraryFields.edition, value: image.edition ?? "" },
    { label: libraryFields.region, value: image.region ?? "" },
  ].filter((row) => row.value.trim().length > 0);

  if (rows.length === 0) return null;

  return (
    <dl className="library-artifact-placard">
      {rows.map((row) => (
        <div key={row.label} className="library-artifact-placard-row">
          <dt>{row.label}</dt>
          <dd>{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
