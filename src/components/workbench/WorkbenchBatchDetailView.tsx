import Link from "next/link";
import {
  AddToBatchForm,
  BatchIntroductionForm,
  PublishBatchButton,
  RemoveFromBatchButton,
  RenameBatchForm,
} from "@/components/workbench/WorkbenchBatchActions";
import { workbenchVoice } from "@/config/workbench-voice";
import { formatDate } from "@/lib/format";
import type {
  EditorialBatchDetail,
  EditorialBatchObservation,
} from "@/lib/editorial-batches";
import type { EditorialObservationKind } from "@/lib/editorial-batch-review";

interface WorkbenchBatchDetailViewProps {
  batch: EditorialBatchDetail;
}

function observationKindLabel(kind: EditorialObservationKind): string {
  return workbenchVoice.batches.reviewKind[kind];
}

function groupObservations(
  observations: EditorialBatchObservation[],
): Array<{ kind: EditorialObservationKind; items: EditorialBatchObservation[] }> {
  const order: EditorialObservationKind[] = [
    "readiness",
    "documentation",
    "authority",
    "voice",
    "relationship",
  ];
  return order
    .map((kind) => ({
      kind,
      items: observations.filter((obs) => obs.kind === kind),
    }))
    .filter((group) => group.items.length > 0);
}

export function WorkbenchBatchDetailView({
  batch,
}: WorkbenchBatchDetailViewProps) {
  const grouped = groupObservations(batch.review.observations);

  return (
    <article className="workbench-detail workbench-batch-detail">
      <p className="workbench-detail-eyebrow">{workbenchVoice.batches.title}</p>
      <h2 className="workbench-detail-title">{batch.name}</h2>
      {batch.editorialTitle ? (
        <p className="workbench-batch-issue-title">{batch.editorialTitle}</p>
      ) : null}
      {batch.editorialNote ? (
        <p className="workbench-batch-issue-note">{batch.editorialNote}</p>
      ) : null}

      <dl className="workbench-detail-fields">
        <div>
          <dt>{workbenchVoice.batches.count}</dt>
          <dd>{batch.accessionCount}</dd>
        </div>
        <div>
          <dt>{workbenchVoice.batches.created}</dt>
          <dd>{formatDate(batch.createdAt)}</dd>
        </div>
        <div>
          <dt>{workbenchVoice.batches.revised}</dt>
          <dd>{formatDate(batch.revisedAt)}</dd>
        </div>
        <div>
          <dt>{workbenchVoice.batches.readiness}</dt>
          <dd>{batch.readinessLabel}</dd>
        </div>
      </dl>

      {batch.sizeNote ? (
        <p className="workbench-batch-size-note">{batch.sizeNote}</p>
      ) : null}

      <section
        className="workbench-section"
        aria-labelledby="batch-introduction"
      >
        <h3 id="batch-introduction" className="workbench-section-title">
          {workbenchVoice.batches.introductionTitle}
        </h3>
        <p className="workbench-section-note">
          {workbenchVoice.batches.introductionLead}
        </p>
        <BatchIntroductionForm
          batchId={batch.id}
          editorialTitle={batch.editorialTitle}
          editorialNote={batch.editorialNote}
        />
      </section>

      <section className="workbench-section" aria-labelledby="batch-review">
        <h3 id="batch-review" className="workbench-section-title">
          {workbenchVoice.batches.reviewTitle}
        </h3>
        <p className="workbench-section-note">
          {workbenchVoice.batches.reviewLead}
        </p>

        {batch.accessionCount === 0 ? (
          <p className="workbench-empty">{workbenchVoice.batches.reviewEmpty}</p>
        ) : (
          <div className="workbench-batch-review">
            {grouped.map((group) => (
              <div key={group.kind} className="workbench-batch-review-group">
                <p className="workbench-batch-review-kind">
                  {observationKindLabel(group.kind)}
                </p>
                <ul className="workbench-batch-observations">
                  {group.items.map((obs) => (
                    <li key={obs.text}>{obs.text}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="workbench-batch-toolbar">
        <RenameBatchForm batchId={batch.id} currentName={batch.name} />
        <PublishBatchButton
          batchId={batch.id}
          disabled={batch.accessionCount === 0}
        />
      </div>

      <section
        className="workbench-section"
        aria-labelledby="batch-accessions"
      >
        <h3 id="batch-accessions" className="workbench-section-title">
          {workbenchVoice.batches.accessionsTitle}
        </h3>

        {batch.accessions.length === 0 ? (
          <p className="workbench-empty">
            This batch is empty. Add filed Editorial Drafts below.
          </p>
        ) : (
          <ul className="workbench-batch-accessions">
            {batch.accessions.map((row, index) => {
              const previous = batch.accessions[index - 1];
              const next = batch.accessions[index + 1];
              return (
                <li key={row.slug} className="workbench-batch-accession">
                  <div className="workbench-batch-accession-head">
                    <div>
                      <p className="workbench-batch-accession-mark">
                        {row.shelfMark}
                      </p>
                      <Link
                        href={`${row.href}?batch=${encodeURIComponent(batch.id)}`}
                        className="workbench-list-title"
                      >
                        {row.title}
                      </Link>
                      <ul className="workbench-batch-accession-notes">
                        {row.observations.map((note) => (
                          <li key={note}>{note}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="workbench-list-actions">
                      <Link
                        href={`${row.href}?batch=${encodeURIComponent(batch.id)}`}
                        className="workbench-action"
                      >
                        {workbenchVoice.actions.continueEditing}
                      </Link>
                      <RemoveFromBatchButton
                        batchId={batch.id}
                        slug={row.slug}
                      />
                    </div>
                  </div>

                  <ul className="workbench-checklist">
                    {row.fields.map((field) => (
                      <li
                        key={field.id}
                        className={
                          field.present
                            ? "workbench-check workbench-check--present"
                            : "workbench-check workbench-check--absent"
                        }
                      >
                        <span className="workbench-check-label">
                          {field.label}
                        </span>
                        <span className="workbench-check-state">
                          {field.present
                            ? workbenchVoice.batches.fieldPresent
                            : workbenchVoice.batches.fieldAbsent}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <nav
                    className="workbench-batch-accession-nav"
                    aria-label="Batch navigation"
                  >
                    {previous ? (
                      <Link
                        href={`${previous.href}?batch=${encodeURIComponent(batch.id)}`}
                        className="workbench-action workbench-action--quiet"
                      >
                        {workbenchVoice.batches.previousAccession}
                      </Link>
                    ) : (
                      <span />
                    )}
                    {next ? (
                      <Link
                        href={`${next.href}?batch=${encodeURIComponent(batch.id)}`}
                        className="workbench-action workbench-action--quiet"
                      >
                        {workbenchVoice.batches.nextAccession}
                      </Link>
                    ) : null}
                  </nav>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="workbench-section" aria-labelledby="batch-add">
        <h3 id="batch-add" className="workbench-section-title">
          {workbenchVoice.batches.add}
        </h3>
        <AddToBatchForm
          batchId={batch.id}
          eligible={batch.eligibleToAdd}
          currentCount={batch.accessionCount}
        />
      </section>

      <p className="workbench-back">
        <Link href="/workbench">← {workbenchVoice.detail.returnLink}</Link>
      </p>
    </article>
  );
}
