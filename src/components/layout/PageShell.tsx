import { headers } from "next/headers";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { EditorPresence } from "@/components/editorial/EditorPresence";

interface PageShellProps {
  children: React.ReactNode;
}

function isArticleReadingPath(pathname: string): boolean {
  return (
    pathname.startsWith("/articles/") && pathname !== "/articles"
  );
}

/** Immersive restored publications — no Bloodsoaked chrome. */
function isImmersiveArchivePath(pathname: string): boolean {
  return pathname.startsWith("/the-archives/metal-lifestyle");
}

export async function PageShell({ children }: PageShellProps) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";
  const readingMode = isArticleReadingPath(pathname);
  const immersiveArchive = isImmersiveArchivePath(pathname);

  if (immersiveArchive) {
    return <>{children}</>;
  }

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
