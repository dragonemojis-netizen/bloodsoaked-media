import Link from "next/link";
import { notFound } from "next/navigation";
import { workbenchVoice } from "@/config/workbench-voice";
import { getBatchNeighbors } from "@/lib/editorial-batches";
import { formatDate } from "@/lib/format";
import { getAllLibraryRecords, getLibraryRecord } from "@/lib/library";
import { getEditorialWork } from "@/lib/workbench";
import {
  workbenchStaticParams,
} from "@/lib/workbench-deploy";
import type { Metadata } from "next";

export const dynamicParams = false;

export function generateStaticParams() {
  return workbenchStaticParams(
    getAllLibraryRecords().map((record) => ({ slug: record.slug })),
  );
}

interface AccessionPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: AccessionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const record = getLibraryRecord(decodeURIComponent(slug));
  return {
    title: record ? record.title : "Accession",
    robots: { index: false, follow: false },
  };
}

function laneForRecord(
  record: NonNullable<ReturnType<typeof getLibraryRecord>>,
) {
  if (record.visibility === "published") return "published" as const;
  if (record.status === "in-progress") return "in-progress" as const;
  return "filed" as const;
}

export default async function WorkbenchAccessionPage({
  params,
}: AccessionPageProps) {
  const { slug } = await params;
  const record = getLibraryRecord(decodeURIComponent(slug));
  if (!record) notFound();

  const lane = laneForRecord(record);
  const editorial = getEditorialWork().find((row) => row.slug === record.slug);
  const collectionId = record.accession?.sourceReference;
  const neighbors = getBatchNeighbors(record.slug);
  const batchId = neighbors?.batchId;

  return (
    <article className="workbench-detail">
      <p className="workbench-detail-eyebrow">
        {workbenchVoice.lanes[lane]} · {workbenchVoice.detail.accessionEyebrow}
      </p>
      <h2 className="workbench-detail-title">{record.title}</h2>
      <p className="workbench-detail-id">
        {record.shelfMark ?? record.slug} · {record.slug}
      </p>

      {neighbors ? (
        <p className="workbench-batch-context">
          {workbenchVoice.batches.inBatch}
          {": "}
          <Link href={`/workbench/batches/${neighbors.batchId}`}>
            {neighbors.batchName}
          </Link>
        </p>
      ) : null}

      <dl className="workbench-detail-fields">
        <div>
          <dt>{workbenchVoice.detail.filed}</dt>
          <dd>{formatDate(record.filedAt)}</dd>
        </div>
        <div>
          <dt>{workbenchVoice.detail.visibility}</dt>
          <dd>
            {record.visibility === "published"
              ? "On the public shelf"
              : "Held from publication"}
          </dd>
        </div>
        <div>
          <dt>{workbenchVoice.detail.archivalStatus}</dt>
          <dd>{workbenchVoice.lanes[lane]}</dd>
        </div>
        {record.accession?.source ? (
          <div>
            <dt>{workbenchVoice.detail.accessionSource}</dt>
            <dd>
              {record.accession.source === "digital-library"
                ? "Digital library holding"
                : record.accession.source}
              {record.accession.sourceReference
                ? ` · ${record.accession.sourceReference}`
                : ""}
            </dd>
          </div>
        ) : null}
      </dl>

      {editorial ? (
        <section aria-labelledby="editorial-checklist">
          <h3 id="editorial-checklist" className="workbench-section-title">
            {workbenchVoice.editorial.title}
          </h3>
          <p className="workbench-section-note">{workbenchVoice.editorial.note}</p>
          <ul className="workbench-checklist">
            {editorial.needs.map((need) => (
              <li
                key={need.id}
                className={
                  need.needed
                    ? "workbench-check workbench-check--absent"
                    : "workbench-check workbench-check--present"
                }
              >
                <span className="workbench-check-label">{need.label}</span>
                <span className="workbench-check-state">
                  {need.needed
                    ? workbenchVoice.editorial.absent
                    : workbenchVoice.editorial.present}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {record.steam ? (
        <section className="workbench-steam" aria-labelledby="steam-on-accession">
          <h3 id="steam-on-accession" className="workbench-section-title">
            {workbenchVoice.detail.provenanceEyebrow}
          </h3>
          <p className="workbench-section-note">
            {workbenchVoice.detail.provenanceSteam}
          </p>
          <dl className="workbench-detail-fields">
            <div>
              <dt>Steam App ID</dt>
              <dd>{record.steam.appId}</dd>
            </div>
            <div>
              <dt>{workbenchVoice.detail.store}</dt>
              <dd>
                <a href={record.steam.storeUrl} rel="noreferrer" target="_blank">
                  {record.steam.storeUrl}
                </a>
              </dd>
            </div>
            <div>
              <dt>{workbenchVoice.recentAcquisitions.playtime}</dt>
              <dd>{record.steam.playtimeMinutes} min</dd>
            </div>
          </dl>
        </section>
      ) : null}

      <div className="workbench-list-actions workbench-detail-actions">
        {record.visibility === "published" ? (
          <Link href={`/library/${record.slug}`} className="workbench-action">
            {workbenchVoice.actions.openLibrary}
          </Link>
        ) : (
          <p className="workbench-section-note">
            {workbenchVoice.detail.hiddenNote}
          </p>
        )}
        {collectionId ? (
          <Link
            href={`/workbench/holdings/${encodeURIComponent(collectionId)}`}
            className="workbench-action workbench-action--quiet"
          >
            {workbenchVoice.actions.openCollection}
          </Link>
        ) : null}
      </div>

      {neighbors ? (
        <nav
          className="workbench-batch-accession-nav"
          aria-label="Batch navigation"
        >
          {neighbors.previous ? (
            <Link
              href={`/workbench/accessions/${neighbors.previous}?batch=${neighbors.batchId}`}
              className="workbench-action workbench-action--quiet"
            >
              {workbenchVoice.batches.previousAccession}
            </Link>
          ) : (
            <span />
          )}
          {neighbors.next ? (
            <Link
              href={`/workbench/accessions/${neighbors.next}?batch=${neighbors.batchId}`}
              className="workbench-action workbench-action--quiet"
            >
              {workbenchVoice.batches.nextAccession}
            </Link>
          ) : null}
        </nav>
      ) : null}

      <p className="workbench-back">
        {batchId ? (
          <Link href={`/workbench/batches/${batchId}`}>
            ← {workbenchVoice.batches.returnToBatch}
          </Link>
        ) : (
          <Link href="/workbench">← {workbenchVoice.detail.returnLink}</Link>
        )}
      </p>
    </article>
  );
}
