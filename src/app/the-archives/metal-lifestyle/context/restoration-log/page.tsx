import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MetalLifestyleContextHeader } from "@/components/archives/metal-lifestyle/MetalLifestyleContextHeader";
import { MetalLifestyleShell } from "@/components/archives/metal-lifestyle/MetalLifestyleShell";
import {
  ML_CONTEXT_BASE,
  RESTORATION_LOG,
} from "@/config/metal-lifestyle-context";
import { hasMetalLifestyleArchive } from "@/lib/metal-lifestyle-archive";

export const metadata: Metadata = {
  title: "Restoration Log",
  description:
    "Chronological field notes for the Metal Lifestyle preservation project.",
};

export default function MetalLifestyleRestorationLogPage() {
  if (!hasMetalLifestyleArchive()) notFound();

  return (
    <MetalLifestyleShell activeHref={`${ML_CONTEXT_BASE}/restoration-log`}>
      <MetalLifestyleContextHeader title="Restoration Log">
        <p className="ml-tax-bio">
          Archival field notes. Entries record stewardship activity around the
          collection — not software release notes.
        </p>
      </MetalLifestyleContextHeader>

      <ol className="ml-restoration-log">
        {RESTORATION_LOG.map((entry) => (
          <li key={`${entry.date}-${entry.title}`}>
            <p className="ml-log-date">{entry.date}</p>
            <h2>{entry.title}</h2>
            <p>{entry.note}</p>
          </li>
        ))}
      </ol>
    </MetalLifestyleShell>
  );
}
