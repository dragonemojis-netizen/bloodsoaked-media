import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { EditorPresence } from "@/components/editorial/EditorPresence";

export type PublicationChromeVariant = "default" | "reading";

interface PublicationChromeProps {
  children: React.ReactNode;
  /** default = full publication chrome; reading = article immersion (no EditorPresence). */
  variant?: PublicationChromeVariant;
}

/**
 * Bloodsoaked publication chrome. Variant is chosen by App Router layouts —
 * never from request headers — so public pages remain statically prerenderable.
 */
export function PublicationChrome({
  children,
  variant = "default",
}: PublicationChromeProps) {
  const readingMode = variant === "reading";

  return (
    <>
      <div className="texture-vhs-drift" aria-hidden="true" />
      <div className="texture-print-halftone" aria-hidden="true" />
      <div
        className={`site-atmosphere ${readingMode ? "site-atmosphere--reading" : ""}`}
        aria-hidden="true"
      />
      <SiteHeader />
      {!readingMode && <EditorPresence />}
      <main
        className={`relative z-10 flex-1 ${readingMode ? "article-reading-main" : ""}`}
      >
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
