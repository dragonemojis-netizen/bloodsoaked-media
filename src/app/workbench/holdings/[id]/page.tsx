import Link from "next/link";
import { notFound } from "next/navigation";
import {
  FileHoldingButton,
  StarHoldingButton,
} from "@/components/workbench";
import { workbenchVoice } from "@/config/workbench-voice";
import { getAllCollectionArchiveRecords } from "@/lib/collection-archive";
import { formatDate } from "@/lib/format";
import { formatPlaytime, getWorkbenchHolding } from "@/lib/workbench";
import {
  workbenchStaticParams,
} from "@/lib/workbench-deploy";
import type { Metadata } from "next";

export const dynamicParams = false;

export function generateStaticParams() {
  return workbenchStaticParams(
    getAllCollectionArchiveRecords()
      .filter((record) => record.origin !== "development")
      .map((record) => ({ id: record.id })),
  );
}

interface HoldingPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: HoldingPageProps): Promise<Metadata> {
  const { id } = await params;
  const holding = getWorkbenchHolding(decodeURIComponent(id));
  return {
    title: holding ? holding.title : "Holding",
    robots: { index: false, follow: false },
  };
}

export default async function WorkbenchHoldingPage({ params }: HoldingPageProps) {
  const { id } = await params;
  const holding = getWorkbenchHolding(decodeURIComponent(id));
  if (!holding) notFound();

  const { record } = holding;
  const steam = record.steam;

  return (
    <article className="workbench-detail">
      <p className="workbench-detail-eyebrow">
        {workbenchVoice.lanes[holding.lane]} · {workbenchVoice.detail.holdingEyebrow}
      </p>
      <h2 className="workbench-detail-title">{holding.title}</h2>
      <p className="workbench-detail-id">{holding.id}</p>

      <dl className="workbench-detail-fields">
        <div>
          <dt>{workbenchVoice.detail.standing}</dt>
          <dd>{workbenchVoice.lanes[holding.lane]}</dd>
        </div>
        <div>
          <dt>{workbenchVoice.detail.entered}</dt>
          <dd>{holding.importDate ? formatDate(holding.importDate) : "—"}</dd>
        </div>
        <div>
          <dt>{workbenchVoice.recentAcquisitions.playtime}</dt>
          <dd>{holding.playtimeLabel}</dd>
        </div>
        {holding.lastPlayedAt ? (
          <div>
            <dt>{workbenchVoice.detail.lastPlayed}</dt>
            <dd>{formatDate(holding.lastPlayedAt)}</dd>
          </div>
        ) : null}
        {holding.shelfMark ? (
          <div>
            <dt>{workbenchVoice.detail.shelfMark}</dt>
            <dd>{holding.shelfMark}</dd>
          </div>
        ) : null}
      </dl>

      <div className="workbench-list-actions workbench-detail-actions">
        <StarHoldingButton
          collectionId={holding.id}
          starred={holding.starred}
        />
        {holding.lane === "pipeline" ? (
          <FileHoldingButton collectionId={holding.id} />
        ) : null}
        {holding.librarySlug ? (
          <Link
            href={`/workbench/accessions/${holding.librarySlug}`}
            className="workbench-action"
          >
            {workbenchVoice.actions.continueEditing}
          </Link>
        ) : null}
        {record.visibility === "published" ? (
          <Link
            href={`/collection/${encodeURIComponent(holding.id)}`}
            className="workbench-action workbench-action--quiet"
          >
            {workbenchVoice.actions.openCollection}
          </Link>
        ) : null}
      </div>

      {steam ? (
        <section className="workbench-steam" aria-labelledby="steam-meta">
          <h3 id="steam-meta" className="workbench-section-title">
            {workbenchVoice.detail.provenanceEyebrow}
          </h3>
          <p className="workbench-section-note">
            {workbenchVoice.detail.provenanceSteam}
          </p>
          <dl className="workbench-detail-fields">
            <div>
              <dt>Steam App ID</dt>
              <dd>{steam.appId}</dd>
            </div>
            <div>
              <dt>{workbenchVoice.detail.store}</dt>
              <dd>
                <a href={steam.storeUrl} rel="noreferrer" target="_blank">
                  {steam.storeUrl}
                </a>
              </dd>
            </div>
            <div>
              <dt>{workbenchVoice.recentAcquisitions.playtime}</dt>
              <dd>{formatPlaytime(steam.playtimeMinutes)}</dd>
            </div>
            {steam.developers?.length ? (
              <div>
                <dt>{workbenchVoice.detail.developers}</dt>
                <dd>{steam.developers.join(" · ")}</dd>
              </div>
            ) : null}
            {steam.publishers?.length ? (
              <div>
                <dt>{workbenchVoice.detail.publishers}</dt>
                <dd>{steam.publishers.join(" · ")}</dd>
              </div>
            ) : null}
            {steam.releaseDate ? (
              <div>
                <dt>{workbenchVoice.detail.release}</dt>
                <dd>{steam.releaseDateRaw || steam.releaseDate}</dd>
              </div>
            ) : null}
            {steam.genres?.length ? (
              <div>
                <dt>{workbenchVoice.detail.genres}</dt>
                <dd>{steam.genres.join(" · ")}</dd>
              </div>
            ) : null}
            {steam.artwork ? (
              <div>
                <dt>{workbenchVoice.detail.artwork}</dt>
                <dd>
                  {[
                    steam.artwork.capsule && "Capsule",
                    steam.artwork.headerCapsule && "Header",
                    steam.artwork.hero && "Hero",
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </dd>
              </div>
            ) : null}
            <div>
              <dt>{workbenchVoice.detail.lastReconciled}</dt>
              <dd>{formatDate(steam.lastSynced)}</dd>
            </div>
          </dl>
        </section>
      ) : null}

      <p className="workbench-back">
        <Link href="/workbench">← {workbenchVoice.detail.returnLink}</Link>
      </p>
    </article>
  );
}
