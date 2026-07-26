import type { ReactNode } from "react";

interface LibraryAccessionPanelProps {
  id: string;
  eyebrow: string;
  children: ReactNode;
  className?: string;
  /** Wide editorial prose panels vs compact label panels */
  tone?: "prose" | "ledger";
}

/**
 * Accession panel — section of a museum filing.
 * Hairline rule + museum label eyebrow. No card nesting.
 */
export function LibraryAccessionPanel({
  id,
  eyebrow,
  children,
  className = "",
  tone = "ledger",
}: LibraryAccessionPanelProps) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className={`library-accession-panel library-accession-panel--${tone} ${className}`}
    >
      <h2 id={`${id}-heading`} className="library-accession-eyebrow">
        {eyebrow}
      </h2>
      <div className="library-accession-body mt-5 md:mt-6">{children}</div>
    </section>
  );
}
