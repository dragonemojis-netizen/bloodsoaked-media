import Link from "next/link";
import { formatDate } from "@/lib/format";
import { workbenchVoice } from "@/config/workbench-voice";
import type { WorkbenchHoldingRow } from "@/lib/workbench";
import {
  FileHoldingButton,
  StarHoldingButton,
} from "@/components/workbench/WorkbenchActions";

interface WorkbenchHoldingsListProps {
  id: string;
  title: string;
  note?: string;
  empty: string;
  rows: WorkbenchHoldingRow[];
  showFileAction?: boolean;
}

function laneLabel(lane: WorkbenchHoldingRow["lane"]): string {
  return workbenchVoice.lanes[lane];
}

export function WorkbenchHoldingsList({
  id,
  title,
  note,
  empty,
  rows,
  showFileAction = true,
}: WorkbenchHoldingsListProps) {
  return (
    <section className="workbench-section" aria-labelledby={id}>
      <h2 id={id} className="workbench-section-title">
        {title}
      </h2>
      {note ? <p className="workbench-section-note">{note}</p> : null}

      {rows.length === 0 ? (
        <p className="workbench-empty">{empty}</p>
      ) : (
        <ul className="workbench-list">
          {rows.map((row) => (
            <li key={row.id} className="workbench-list-item">
              <div className="workbench-list-main">
                <Link
                  href={`/workbench/holdings/${encodeURIComponent(row.id)}`}
                  className="workbench-list-title"
                >
                  {row.title}
                </Link>
                {row.starred ? (
                  <p className="workbench-list-sub">
                    {workbenchVoice.marks.setAside}
                  </p>
                ) : null}
                <dl className="workbench-list-meta">
                  <div>
                    <dt>{workbenchVoice.recentAcquisitions.importDate}</dt>
                    <dd>
                      {row.importDate ? formatDate(row.importDate) : "—"}
                    </dd>
                  </div>
                  <div>
                    <dt>{workbenchVoice.recentAcquisitions.playtime}</dt>
                    <dd>{row.playtimeLabel}</dd>
                  </div>
                  <div>
                    <dt>{workbenchVoice.recentAcquisitions.status}</dt>
                    <dd>{laneLabel(row.lane)}</dd>
                  </div>
                </dl>
              </div>
              <div className="workbench-list-actions">
                <StarHoldingButton
                  collectionId={row.id}
                  starred={row.starred}
                />
                {showFileAction && row.lane === "pipeline" ? (
                  <FileHoldingButton collectionId={row.id} />
                ) : null}
                {row.librarySlug ? (
                  <Link
                    href={`/workbench/accessions/${row.librarySlug}`}
                    className="workbench-action workbench-action--quiet"
                  >
                    {workbenchVoice.actions.continueEditing}
                  </Link>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
