import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MetalLifestyleContextHeader } from "@/components/archives/metal-lifestyle/MetalLifestyleContextHeader";
import { MetalLifestyleShell } from "@/components/archives/metal-lifestyle/MetalLifestyleShell";
import {
  ML_CONTEXT_BASE,
  PUBLICATION_ESSAY,
} from "@/config/metal-lifestyle-context";
import { hasMetalLifestyleArchive } from "@/lib/metal-lifestyle-archive";

export const metadata: Metadata = {
  title: PUBLICATION_ESSAY.title,
  description:
    "Archival essay documenting Metal Lifestyle as a historical publication.",
};

export default function MetalLifestyleEssayPage() {
  if (!hasMetalLifestyleArchive()) notFound();

  return (
    <MetalLifestyleShell activeHref={`${ML_CONTEXT_BASE}/essay`}>
      <MetalLifestyleContextHeader title={PUBLICATION_ESSAY.title}>
        <p className="ml-tax-bio">
          Permanent documentation of the publication as preserved in this
          archive. Written as catalog prose — not autobiography.
        </p>
      </MetalLifestyleContextHeader>

      <article className="ml-context-prose">
        {PUBLICATION_ESSAY.sections.map((section) => (
          <section key={section.heading}>
            <h2>{section.heading}</h2>
            {section.body.map((para) => (
              <p key={para.slice(0, 48)}>{para}</p>
            ))}
          </section>
        ))}
      </article>
    </MetalLifestyleShell>
  );
}
