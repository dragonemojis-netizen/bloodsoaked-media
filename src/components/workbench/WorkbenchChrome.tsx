import Link from "next/link";
import { workbenchVoice } from "@/config/workbench-voice";

export function WorkbenchChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="workbench-world">
      <header className="workbench-header">
        <p className="workbench-eyebrow">{workbenchVoice.eyebrow}</p>
        <div className="workbench-header-row">
          <Link href="/workbench" className="workbench-title-link">
            <h1 className="workbench-title">{workbenchVoice.name}</h1>
          </Link>
          <nav className="workbench-nav" aria-label="Workbench">
            <Link href="/workbench">{workbenchVoice.nav.workbench}</Link>
            <Link href="/library">{workbenchVoice.nav.library}</Link>
            <Link href="/collection">{workbenchVoice.nav.collection}</Link>
          </nav>
        </div>
        <p className="workbench-intro">{workbenchVoice.introduction}</p>
        <p className="workbench-lifecycle">{workbenchVoice.lifecycle}</p>
      </header>
      <div className="workbench-body">{children}</div>
    </div>
  );
}
