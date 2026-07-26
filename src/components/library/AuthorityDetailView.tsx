import Link from "next/link";
import { LibraryAccessionPanel } from "@/components/library/LibraryAccessionPanel";
import { LibraryFieldList } from "@/components/library/LibraryFieldList";
import { authorityFields, authorityVoice } from "@/config/authority-voice";
import { formatLibraryFiledDate } from "@/lib/library";
import { getCollectionArchiveRecord } from "@/lib/collection-archive";
import type { AuthorityEntry } from "@/types/authority";

interface AuthorityDetailViewProps {
  entry: AuthorityEntry;
}

/**
 * Authority Record — bibliographic reference card.
 * Quiet identity for the archive. Not a profile page. Not an article.
 */
export function AuthorityDetailView({ entry }: AuthorityDetailViewProps) {
  const altNames = entry.alternativeNames.filter(Boolean).join(" · ");
  const holdingRows = entry.relatedHoldingIds
    .map((id) => {
      const record = getCollectionArchiveRecord(id);
      return {
        id,
        title: record?.title ?? id,
        href: `/collection/${encodeURIComponent(id)}`,
      };
    })
    .filter((item) => item.title);

  return (
    <article className="authority-record library-accession">
      <header className="authority-record-header">
        <p className="authority-record-eyebrow">{authorityVoice.cardEyebrow}</p>
        <p className="authority-record-id">{entry.authorityId}</p>
        <h1 className="authority-record-title">{entry.preferredName}</h1>
        <p className="authority-record-type">{entry.typeLabel}</p>
      </header>

      <div className="library-accession-body-stack mt-14 space-y-12 md:mt-16 md:space-y-14">
        <LibraryAccessionPanel
          id="authority-identity"
          eyebrow={authorityVoice.cardEyebrow}
        >
          <LibraryFieldList
            rows={[
              {
                label: authorityFields.preferredName,
                value: entry.preferredName,
              },
              {
                label: authorityFields.alternativeNames,
                value: altNames,
              },
              {
                label: authorityFields.authorityIdentifier,
                value: entry.authorityId,
              },
              {
                label: authorityFields.type,
                value: entry.typeLabel,
              },
              {
                label: authorityFields.establishedDate,
                value: entry.establishedDate ?? "",
              },
            ]}
          />

          {entry.description?.trim() ? (
            <p className="authority-record-description mt-8">
              {entry.description.trim()}
            </p>
          ) : (
            <p className="authority-record-description-empty mt-8">
              {authorityVoice.emptyDescription}
            </p>
          )}
        </LibraryAccessionPanel>

        <LibraryAccessionPanel
          id="related-library-entries"
          eyebrow={authorityFields.relatedLibraryEntries}
        >
          <p className="authority-record-lead">
            {authorityVoice.relatedEntriesLead}
          </p>
          {entry.relatedLibraryEntries.length > 0 ? (
            <ul className="authority-related-list">
              {entry.relatedLibraryEntries.map((link) => (
                <li key={link.slug}>
                  <span className="authority-related-mark">{link.shelfMark}</span>
                  <Link href={link.href} className="library-connection-link">
                    {link.title}
                    {link.year != null ? ` (${link.year})` : ""}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="authority-record-empty">{authorityVoice.noRelatedEntries}</p>
          )}
        </LibraryAccessionPanel>

        <LibraryAccessionPanel
          id="related-authorities"
          eyebrow={authorityFields.relatedAuthorities}
        >
          {entry.relatedAuthorities.length > 0 ? (
            <ul className="authority-related-list">
              {entry.relatedAuthorities.map((peer) => (
                <li key={peer.slug}>
                  <span className="authority-related-type">{peer.typeLabel}</span>
                  <Link href={peer.href} className="library-connection-link">
                    {peer.preferredName}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="authority-record-empty">
              {authorityVoice.noRelatedAuthorities}
            </p>
          )}
        </LibraryAccessionPanel>

        <LibraryAccessionPanel
          id="related-holdings"
          eyebrow={authorityFields.relatedHoldings}
        >
          {holdingRows.length > 0 ? (
            <ul className="authority-related-list">
              {holdingRows.map((holding) => (
                <li key={holding.id}>
                  <Link href={holding.href} className="library-connection-link">
                    {holding.title}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="authority-record-empty">
              {authorityVoice.noRelatedHoldings}
            </p>
          )}
        </LibraryAccessionPanel>

        {entry.externalReferences.length > 0 ? (
          <LibraryAccessionPanel
            id="external-references"
            eyebrow={authorityFields.externalReferences}
          >
            <ul className="authority-related-list">
              {entry.externalReferences.map((ref) => (
                <li key={ref.url}>
                  <a
                    href={ref.url}
                    className="library-connection-link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {ref.label}
                  </a>
                </li>
              ))}
            </ul>
          </LibraryAccessionPanel>
        ) : null}

        {entry.stewardshipHistory.length > 0 ? (
          <LibraryAccessionPanel
            id="stewardship-history"
            eyebrow={authorityFields.stewardshipHistory}
          >
            <ol className="library-stewardship-chronology">
              {entry.stewardshipHistory.map((event) => (
                <li key={event.id} className="library-stewardship-entry">
                  <time dateTime={event.at} className="library-stewardship-date">
                    {formatLibraryFiledDate(event.at)}
                  </time>
                  <div className="library-stewardship-body">
                    <p className="library-stewardship-summary">{event.summary}</p>
                    {event.note ? (
                      <p className="library-stewardship-note">{event.note}</p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
          </LibraryAccessionPanel>
        ) : null}
      </div>
    </article>
  );
}
