import Link from "next/link";
import type { ReactNode } from "react";
import { LibraryAccessionPanel } from "@/components/library/LibraryAccessionPanel";
import { libraryFields, libraryVoice } from "@/config/library-voice";
import { getAuthorityHref, getAuthorityRecord } from "@/lib/authority";
import {
  getLibraryEntryHref,
  getLibrarySeriesLineage,
  getLibraryShelfTitle,
} from "@/lib/library";
import type { LibraryEntry } from "@/types/library";

interface LibraryConnectionsPanelProps {
  entry: LibraryEntry;
  /** Prepare empty relationship fields for editorial drafts. */
  prepareEmpty?: boolean;
}

interface ConnectionRow {
  label: string;
  content: ReactNode;
}

function filingLabel(label: string, index: number, total: number): string {
  return total > 1 ? `${label} ${String(index + 1).padStart(2, "0")}` : label;
}

function titleFromSlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function relatedFilingLabel(slug: string): string {
  return getLibraryShelfTitle(slug) ?? titleFromSlug(slug);
}

function awaiting(text: string): ReactNode {
  return <span className="library-editorial-awaiting-inline">{text}</span>;
}

function seriesAuthorityLink(entry: LibraryEntry): ReactNode | null {
  const seriesSlug = entry.authorities?.series?.[0];
  if (!seriesSlug) return null;
  const authority = getAuthorityRecord(seriesSlug);
  if (!authority) return null;
  return (
    <Link href={getAuthorityHref(seriesSlug)} className="library-connection-link">
      {authority.preferredName}
    </Link>
  );
}

/**
 * Relationships — cross-references into the wider archive and publication.
 *
 * Archival Lineage is derived from the series. `relatedEntrySlugs` covers
 * relationships that fall outside a series. Steam holding IDs belong in the
 * Acquisition Record, not here as Collection Hall links.
 */
export function LibraryConnectionsPanel({
  entry,
  prepareEmpty = false,
}: LibraryConnectionsPanelProps) {
  const { connections } = entry;
  const rows: ConnectionRow[] = [];

  const lineage = getLibrarySeriesLineage(connections.series, entry.slug);
  const lineageSlugs = new Set(lineage.map((member) => member.slug));
  const seriesLink = seriesAuthorityLink(entry);

  if (lineage.length > 0) {
    rows.push({
      label: libraryFields.lineage,
      content: (
        <ul className="library-connection-list">
          {lineage.map((member) => (
            <li key={member.slug}>
              <span className="library-lineage-mark">{member.shelfMark}</span>
              {member.isCurrent ? (
                <span className="library-lineage-current">
                  {member.title}
                  {member.year != null && ` (${member.year})`}
                  <span className="library-lineage-note">
                    {libraryVoice.record.lineageCurrentSuffix}
                  </span>
                </span>
              ) : (
                <Link href={member.href} className="library-connection-link">
                  {member.title}
                  {member.year != null && ` (${member.year})`}
                </Link>
              )}
            </li>
          ))}
        </ul>
      ),
    });
  } else if (prepareEmpty && !seriesLink) {
    rows.push({
      label: libraryFields.series,
      content: awaiting(libraryVoice.record.editorialAwaiting.series),
    });
  }

  if (seriesLink) {
    rows.push({
      label: libraryFields.series,
      content: seriesLink,
    });
  } else if (connections.series && lineage.length === 0) {
    rows.push({
      label: libraryFields.series,
      content: <span>{connections.series}</span>,
    });
  }

  const relatedSlugs = (connections.relatedEntrySlugs ?? []).filter(
    (slug) => slug !== entry.slug && !lineageSlugs.has(slug),
  );

  if (relatedSlugs.length > 0) {
    rows.push({
      label: libraryFields.relatedEntries,
      content: (
        <ul className="library-connection-list">
          {relatedSlugs.map((slug) => (
            <li key={slug}>
              <Link
                href={getLibraryEntryHref(slug)}
                className="library-connection-link"
              >
                {relatedFilingLabel(slug)}
              </Link>
            </li>
          ))}
        </ul>
      ),
    });
  } else if (prepareEmpty) {
    rows.push({
      label: libraryFields.relatedEntries,
      content: awaiting(libraryVoice.record.editorialAwaiting.relatedEntries),
    });
  }

  if (connections.mediaLogSlug) {
    rows.push({
      label: libraryFields.mediaLog,
      content: (
        <Link
          href={`/media-log/${connections.mediaLogSlug}`}
          className="library-connection-link"
        >
          {titleFromSlug(connections.mediaLogSlug)}
        </Link>
      ),
    });
  } else if (prepareEmpty) {
    rows.push({
      label: libraryFields.mediaLog,
      content: awaiting(libraryVoice.record.editorialAwaiting.mediaLog),
    });
  }

  if (connections.articleSlugs?.length) {
    rows.push({
      label: libraryFields.articles,
      content: (
        <ul className="library-connection-list">
          {connections.articleSlugs.map((slug) => (
            <li key={slug}>
              <Link
                href={`/articles/${slug}`}
                className="library-connection-link"
              >
                {titleFromSlug(slug)}
              </Link>
            </li>
          ))}
        </ul>
      ),
    });
  } else if (prepareEmpty) {
    rows.push({
      label: libraryFields.articles,
      content: awaiting(libraryVoice.record.editorialAwaiting.relatedArticles),
    });
  }

  // Collection Hall links — exclude Steam holding IDs (provenance lives on Acquisition Record).
  const hallIds = (connections.collectionIds ?? []).filter(
    (id) => !id.startsWith("steam-"),
  );

  if (hallIds.length > 0) {
    rows.push({
      label: libraryFields.collectionPhotos,
      content: (
        <ul className="library-connection-list">
          {hallIds.map((id, index) => (
            <li key={id}>
              <Link href={`/collection/${id}`} className="library-connection-link">
                {filingLabel("Collection Hall filing", index, hallIds.length)}
              </Link>
            </li>
          ))}
        </ul>
      ),
    });
  } else if (prepareEmpty) {
    rows.push({
      label: libraryFields.relatedHoldings,
      content: awaiting(libraryVoice.record.editorialAwaiting.relatedHoldings),
    });
  }

  if (connections.instagramUrls?.length) {
    rows.push({
      label: libraryFields.instagramPosts,
      content: (
        <ul className="library-connection-list">
          {connections.instagramUrls.map((url, index) => (
            <li key={url}>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="library-connection-link"
              >
                {filingLabel(
                  "Original acquisition post",
                  index,
                  connections.instagramUrls?.length ?? 0,
                )}
              </a>
            </li>
          ))}
        </ul>
      ),
    });
  }

  if (connections.futureReview) {
    rows.push({
      label: libraryFields.futureReviews,
      content: (
        <span className="font-serif italic text-foreground-muted/85">
          {connections.futureReview}
        </span>
      ),
    });
  }

  if (rows.length === 0) {
    if (!prepareEmpty) return null;
    return (
      <LibraryAccessionPanel
        id="relationships"
        eyebrow={libraryVoice.record.relationshipsEyebrow}
      >
        <p className="library-editorial-awaiting">
          {libraryVoice.record.editorialAwaiting.relationships}
        </p>
      </LibraryAccessionPanel>
    );
  }

  return (
    <LibraryAccessionPanel
      id="relationships"
      eyebrow={
        prepareEmpty
          ? libraryVoice.record.relationshipsEyebrow
          : libraryVoice.record.connectionsEyebrow
      }
    >
      <dl className="library-field-list">
        {rows.map((row) => (
          <div key={row.label} className="library-field-row">
            <dt className="library-field-label">{row.label}</dt>
            <dd className="library-field-value">{row.content}</dd>
          </div>
        ))}
      </dl>
    </LibraryAccessionPanel>
  );
}
