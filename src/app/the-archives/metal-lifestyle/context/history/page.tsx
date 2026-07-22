import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MetalLifestyleContextHeader } from "@/components/archives/metal-lifestyle/MetalLifestyleContextHeader";
import { MetalLifestyleShell } from "@/components/archives/metal-lifestyle/MetalLifestyleShell";
import {
  ML_CONTEXT_BASE,
  PUBLICATION_HISTORY,
} from "@/config/metal-lifestyle-context";
import { hasMetalLifestyleArchive } from "@/lib/metal-lifestyle-archive";

export const metadata: Metadata = {
  title: "Publication History",
  description:
    "Documented milestones of Metal Lifestyle based on recoverable archive evidence.",
};

export default function MetalLifestyleHistoryPage() {
  if (!hasMetalLifestyleArchive()) notFound();

  return (
    <MetalLifestyleShell activeHref={`${ML_CONTEXT_BASE}/history`}>
      <MetalLifestyleContextHeader title="Publication History">
        <p className="ml-tax-bio">
          Milestones supported by recoverable evidence in this archive. Periods
          without documented material are omitted. Speculation is excluded.
        </p>
      </MetalLifestyleContextHeader>

      <ol className="ml-history-list">
        {PUBLICATION_HISTORY.map((item) => (
          <li key={item.title}>
            <p className="ml-history-period">{item.period}</p>
            <h2>{item.title}</h2>
            <p className="ml-history-evidence">
              <strong>Evidence:</strong> {item.evidence}
            </p>
            {item.preservationNote ? (
              <p className="ml-history-evidence ml-history-preservation-note">
                <strong>Preservation note:</strong> {item.preservationNote}
              </p>
            ) : null}
          </li>
        ))}
      </ol>
    </MetalLifestyleShell>
  );
}
