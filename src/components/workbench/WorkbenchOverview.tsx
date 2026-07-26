import { workbenchVoice } from "@/config/workbench-voice";
import type { WorkbenchHoldingsOverview } from "@/lib/workbench";

interface WorkbenchOverviewProps {
  overview: WorkbenchHoldingsOverview;
}

export function WorkbenchOverview({ overview }: WorkbenchOverviewProps) {
  const rows = [
    { label: workbenchVoice.overview.total, value: overview.totalHoldings },
    { label: workbenchVoice.overview.pipeline, value: overview.pipeline },
    { label: workbenchVoice.overview.filed, value: overview.filed },
    { label: workbenchVoice.overview.inProgress, value: overview.inProgress },
    { label: workbenchVoice.overview.published, value: overview.published },
  ];

  return (
    <section className="workbench-section" aria-labelledby="workbench-holdings">
      <h2 id="workbench-holdings" className="workbench-section-title">
        {workbenchVoice.overview.title}
      </h2>
      <dl className="workbench-stat-list">
        {rows.map((row) => (
          <div key={row.label} className="workbench-stat-row">
            <dt>{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
