import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MetalLifestyleShell } from "@/components/archives/metal-lifestyle/MetalLifestyleShell";
import { METAL_LIFESTYLE_BASE } from "@/config/metal-lifestyle";
import { hasMetalLifestyleArchive } from "@/lib/metal-lifestyle-archive";
import { getMetalLifestyleCatalogStats } from "@/lib/metal-lifestyle-discovery";

export const metadata: Metadata = {
  title: "Collection Record",
  description:
    "Library catalog record for the preserved Metal Lifestyle collection.",
};

function Field({
  term,
  children,
}: {
  term: string;
  children: ReactNode;
}) {
  return (
    <div>
      <dt>{term}</dt>
      <dd>{children}</dd>
    </div>
  );
}

export default function MetalLifestyleStatisticsPage() {
  if (!hasMetalLifestyleArchive()) notFound();
  const stats = getMetalLifestyleCatalogStats();
  if (!stats) notFound();

  return (
    <MetalLifestyleShell activeHref={`${METAL_LIFESTYLE_BASE}/statistics`}>
      <header className="ml-tax-header">
        <p className="ml-tax-eyebrow">Finding Aid</p>
        <h1 className="ml-tax-title">Collection Record</h1>
        <p className="ml-tax-bio">
          Archival holdings for Metal Lifestyle. Values are generated from the
          authoritative on-disk archive index and update when gap-fill merges
          newly recovered material.
        </p>
        <p>
          <Link href={METAL_LIFESTYLE_BASE}>← Catalog</Link>
        </p>
      </header>

      <dl className="ml-stats-list ml-collection-record">
        <Field term="Title">{stats.collectionTitle}</Field>
        <Field term="Holding institution">
          {stats.holdingInstitution}
        </Field>
        <Field term="Original site">
          <a href={stats.originalSite} rel="noopener noreferrer">
            {stats.originalSite}
          </a>
        </Field>
        <Field term="Form">{stats.form}</Field>
        <Field term="Publication span">{stats.publicationYears}</Field>

        <Field term="Extent — articles">
          {stats.articlesRestored} restored
          <span className="ml-catalog-muted">
            {" "}
            of {stats.articlesTotal} records
          </span>
          {stats.articlesUnavailable > 0 ? (
            <span className="ml-catalog-muted">
              {" "}
              ({stats.articlesUnavailable} unavailable)
            </span>
          ) : null}
        </Field>

        <Field term="Extent — pages">
          {stats.pagesRestored} restored
          <span className="ml-catalog-muted">
            {" "}
            of {stats.pagesTotal} records
          </span>
          {stats.pagesUnavailable > 0 ? (
            <span className="ml-catalog-muted">
              {" "}
              ({stats.pagesUnavailable} unavailable
              {stats.pagesThin > 0
                ? `; ${stats.pagesThin} thin shells`
                : ""}
              )
            </span>
          ) : stats.pagesThin > 0 ? (
            <span className="ml-catalog-muted">
              {" "}
              ({stats.pagesThin} thin shells)
            </span>
          ) : null}
        </Field>

        <Field term="Extent — media">{stats.mediaAssets} preserved assets</Field>

        <Field term="Recorded bylines">{stats.authors}</Field>
        <Field term="Staff biographies">
          {stats.authorsWithBiography}
          <span className="ml-catalog-muted">
            {" "}
            of {stats.authors} author records
          </span>
        </Field>
        <Field term="Categories">{stats.categories}</Field>

        <Field term="Completeness">{stats.restorationPercent}%</Field>
        <Field term="Preservation status">{stats.restorationStatus}</Field>
        {stats.preservationSeal ? (
          <Field term="Seal">{stats.preservationSeal}</Field>
        ) : null}
        {stats.sealedAt ? (
          <Field term="Sealed">{stats.sealedAt}</Field>
        ) : null}
        <Field term="Last preservation pass">
          {stats.lastPreservationPass ?? "—"}
        </Field>
      </dl>
    </MetalLifestyleShell>
  );
}
