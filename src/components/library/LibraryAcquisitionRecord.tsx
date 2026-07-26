import { LibraryAccessionPanel } from "@/components/library/LibraryAccessionPanel";
import { LibraryFieldList } from "@/components/library/LibraryFieldList";
import {
  libraryAccessionSourceLabels,
  libraryFields,
  libraryVoice,
} from "@/config/library-voice";
import { formatDate } from "@/lib/format";
import type { LibraryEntry } from "@/types/library";

interface LibraryAcquisitionRecordProps {
  entry: LibraryEntry;
}

function formatPlaytime(minutes: number): string {
  if (!minutes || minutes <= 0) return "Unplayed";
  if (minutes < 60) return `${minutes} minutes`;
  const hours = Math.floor(minutes / 60);
  const rem = minutes % 60;
  if (hours >= 100) return `${hours} hours`;
  return rem > 0 ? `${hours} hours ${rem} minutes` : `${hours} hours`;
}

/**
 * Acquisition Record — provenance for digitally acquired holdings.
 * Present, but never competing with Title · Shelf Mark · Editorial Standing.
 */
export function LibraryAcquisitionRecord({
  entry,
}: LibraryAcquisitionRecordProps) {
  const steam = entry.steam;
  if (!steam) return null;

  const sourceLabel = entry.accession
    ? libraryAccessionSourceLabels[entry.accession.source]
    : "Digital library holding";

  const enteredAt = entry.accession?.reconciledAt ?? entry.filedAt;

  return (
    <LibraryAccessionPanel
      id="acquisition-record"
      eyebrow={libraryVoice.record.acquisitionRecordEyebrow}
      className="library-accession-panel--provenance"
    >
      <p className="library-acquisition-lead">
        {libraryVoice.record.acquisitionRecordLead}
      </p>

      <LibraryFieldList
        rows={[
          { label: libraryFields.acquisitionSource, value: "Steam" },
          {
            label: libraryFields.acquiredThrough,
            value: sourceLabel,
          },
          {
            label: libraryFields.importDate,
            value: formatDate(enteredAt),
          },
          {
            label: libraryFields.steamAppId,
            value: String(steam.appId),
          },
        ]}
      />

      <details className="library-technical-details">
        <summary>{libraryFields.technicalDetails}</summary>
        <dl className="library-technical-details-list">
          {entry.accession?.sourceReference ? (
            <div>
              <dt>{libraryFields.holdingReference}</dt>
              <dd>
                <code>{entry.accession.sourceReference}</code>
              </dd>
            </div>
          ) : null}
          <div>
            <dt>{libraryFields.lastSynchronized}</dt>
            <dd>{formatDate(steam.lastSynced)}</dd>
          </div>
          <div>
            <dt>{libraryFields.playtime}</dt>
            <dd>{formatPlaytime(steam.playtimeMinutes)}</dd>
          </div>
          {steam.playtime2Weeks != null ? (
            <div>
              <dt>{libraryFields.playtimeRecent}</dt>
              <dd>{formatPlaytime(steam.playtime2Weeks)}</dd>
            </div>
          ) : null}
          {steam.storeUrl ? (
            <div>
              <dt>{libraryFields.storeReference}</dt>
              <dd>
                <a
                  href={steam.storeUrl}
                  className="library-field-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {libraryVoice.record.storeListingLabel}
                </a>
              </dd>
            </div>
          ) : null}
        </dl>
      </details>
    </LibraryAccessionPanel>
  );
}
