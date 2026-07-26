import Link from "next/link";
import { workbenchVoice } from "@/config/workbench-voice";
import type { WorkbenchEditorialRow } from "@/lib/workbench";

interface WorkbenchEditorialListProps {
  rows: WorkbenchEditorialRow[];
}

export function WorkbenchEditorialList({ rows }: WorkbenchEditorialListProps) {
  return (
    <section
      className="workbench-section"
      aria-labelledby="workbench-editorial"
    >
      <h2 id="workbench-editorial" className="workbench-section-title">
        {workbenchVoice.editorial.title}
      </h2>
      <p className="workbench-section-note">{workbenchVoice.editorial.note}</p>

      {rows.length === 0 ? (
        <p className="workbench-empty">{workbenchVoice.editorial.empty}</p>
      ) : (
        <ul className="workbench-list">
          {rows.map((row) => (
            <li key={row.slug} className="workbench-list-item">
              <div className="workbench-list-main">
                <Link href={row.href} className="workbench-list-title">
                  {row.title}
                </Link>
                <p className="workbench-list-sub">{row.shelfMark}</p>
                <ul className="workbench-checklist">
                  {row.needs.map((need) => (
                    <li
                      key={need.id}
                      className={
                        need.needed
                          ? "workbench-check workbench-check--absent"
                          : "workbench-check workbench-check--present"
                      }
                    >
                      <span className="workbench-check-label">{need.label}</span>
                      <span className="workbench-check-state">
                        {need.needed
                          ? workbenchVoice.editorial.absent
                          : workbenchVoice.editorial.present}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="workbench-list-actions">
                <Link href={row.href} className="workbench-action">
                  {workbenchVoice.actions.continueEditing}
                </Link>
                {row.publicHref ? (
                  <Link
                    href={row.publicHref}
                    className="workbench-action workbench-action--quiet"
                  >
                    {workbenchVoice.actions.viewPublic}
                  </Link>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
