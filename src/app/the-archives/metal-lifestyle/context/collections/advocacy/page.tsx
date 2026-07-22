import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MetalLifestyleContextHeader } from "@/components/archives/metal-lifestyle/MetalLifestyleContextHeader";
import { MetalLifestyleShell } from "@/components/archives/metal-lifestyle/MetalLifestyleShell";
import {
  KNOWN_UNRECOVERABLE_SECTIONS,
  ML_CONTEXT_BASE,
} from "@/config/metal-lifestyle-context";
import { hasMetalLifestyleArchive } from "@/lib/metal-lifestyle-archive";

const SECTION = KNOWN_UNRECOVERABLE_SECTIONS.find((s) => s.slug === "advocacy");

export const metadata: Metadata = {
  title: "Advocacy — Known Section",
  description:
    "Archival documentation for Advocacy, a Metal Lifestyle section known to have existed and currently unrecoverable.",
};

/**
 * Documentation placeholder only — not reconstructed publication content.
 */
export default function AdvocacyKnownSectionPage() {
  if (!hasMetalLifestyleArchive() || !SECTION) notFound();

  return (
    <MetalLifestyleShell
      activeHref={`${ML_CONTEXT_BASE}/collections/advocacy`}
    >
      <MetalLifestyleContextHeader title={SECTION.title}>
        <p className="ml-tax-bio">{SECTION.description}</p>
        <dl className="ml-author-meta">
          <div>
            <dt>Classification</dt>
            <dd>{SECTION.kind}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>{SECTION.status}</dd>
          </div>
          <div>
            <dt>Preserved pages</dt>
            <dd>0</dd>
          </div>
          <div>
            <dt>Preserved media</dt>
            <dd>0</dd>
          </div>
        </dl>
        <p>
          <Link href={`${ML_CONTEXT_BASE}/history`}>Publication History</Link>
          {" · "}
          <Link href={`${ML_CONTEXT_BASE}/collections`}>
            ← All special collections
          </Link>
        </p>
      </MetalLifestyleContextHeader>

      <article className="ml-context-prose">
        <section>
          <h2>Archival placeholder</h2>
          <p>{SECTION.placeholder}</p>
        </section>
        <section>
          <h2>Preservation categories</h2>
          <p>
            This archive distinguishes material that is{" "}
            <em>recovered</em>, material <em>known to have existed</em>, and
            material that is <em>currently unrecoverable</em>. Advocacy belongs
            in the third category. Its absence is part of the historical record
            and is documented rather than silently omitted. Current
            unavailability is not treated as permanent loss.
          </p>
        </section>
      </article>
    </MetalLifestyleShell>
  );
}
