import Link from "next/link";
import type { MetalLifestylePreservation } from "@/lib/metal-lifestyle-archive";

interface Props {
  preservation?: MetalLifestylePreservation | null;
  originalUrl?: string;
}

/** Subtle archival details — stewardship metadata, not part of the original site. */
export function MetalLifestyleArchivalDetails({
  preservation,
  originalUrl,
}: Props) {
  if (!preservation && !originalUrl) return null;

  const url = preservation?.originalUrl ?? originalUrl;
  const missing = preservation?.missingAssets?.length ?? 0;

  return (
    <details className="ml-archival-details">
      <summary>Archival details</summary>
      <dl>
        {url && (
          <>
            <dt>Original URL</dt>
            <dd>
              <a href={url} target="_blank" rel="noopener noreferrer">
                {url}
              </a>
            </dd>
          </>
        )}
        {preservation?.recoverySource && (
          <>
            <dt>Recovery source</dt>
            <dd>{preservation.recoverySource}</dd>
          </>
        )}
        {preservation?.recoveryDate && (
          <>
            <dt>Recovery date</dt>
            <dd>{preservation.recoveryDate}</dd>
          </>
        )}
        {preservation?.polishedAt && (
          <>
            <dt>Stewardship polish</dt>
            <dd>{preservation.polishedAt}</dd>
          </>
        )}
        {preservation?.preservationStatus && (
          <>
            <dt>Preservation status</dt>
            <dd>{preservation.preservationStatus}</dd>
          </>
        )}
        <dt>Missing assets</dt>
        <dd>{missing === 0 ? "None recorded" : `${missing} unrecovered`}</dd>
        {preservation?.waybackSnapshotDate && (
          <>
            <dt>Wayback snapshot</dt>
            <dd>{preservation.waybackSnapshotDate}</dd>
          </>
        )}
      </dl>
      <p className="ml-archival-details-note">
        Preserved by{" "}
        <Link href="/the-archives">Bloodsoaked Media · The Archives</Link>
      </p>
    </details>
  );
}
