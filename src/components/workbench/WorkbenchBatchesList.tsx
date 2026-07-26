import Link from "next/link";
import { CreateBatchForm } from "@/components/workbench/WorkbenchBatchActions";
import { workbenchVoice } from "@/config/workbench-voice";
import { formatDate } from "@/lib/format";
import type { EditorialBatchSummary } from "@/lib/editorial-batches";

interface WorkbenchBatchesListProps {
  batches: EditorialBatchSummary[];
}

export function WorkbenchBatchesList({ batches }: WorkbenchBatchesListProps) {
  return (
    <section className="workbench-section" aria-labelledby="workbench-batches">
      <h2 id="workbench-batches" className="workbench-section-title">
        {workbenchVoice.batches.title}
      </h2>
      <p className="workbench-section-note">{workbenchVoice.batches.note}</p>

      <CreateBatchForm />

      {batches.length === 0 ? (
        <p className="workbench-empty">{workbenchVoice.batches.empty}</p>
      ) : (
        <ul className="workbench-list">
          {batches.map((batch) => (
            <li key={batch.id} className="workbench-list-item">
              <div className="workbench-list-main">
                <Link href={batch.href} className="workbench-list-title">
                  {batch.name}
                </Link>
                {batch.editorialTitle ? (
                  <p className="workbench-list-sub">{batch.editorialTitle}</p>
                ) : null}
                <p className="workbench-list-meta">
                  {batch.accessionCount}{" "}
                  {batch.accessionCount === 1 ? "accession" : "accessions"}
                  {" · "}
                  {workbenchVoice.batches.created} {formatDate(batch.createdAt)}
                  {" · "}
                  {workbenchVoice.batches.revised} {formatDate(batch.revisedAt)}
                </p>
                <p className="workbench-list-sub">{batch.readinessLabel}</p>
                {batch.sizeNote ? (
                  <p className="workbench-batch-size-note">{batch.sizeNote}</p>
                ) : null}
              </div>
              <div className="workbench-list-actions">
                <Link href={batch.href} className="workbench-action">
                  {workbenchVoice.batches.open}
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
