import { formatDate } from "@/lib/format";
import { workbenchVoice } from "@/config/workbench-voice";
import type { WorkbenchActivityEvent } from "@/lib/workbench";

interface WorkbenchActivityLogProps {
  events: WorkbenchActivityEvent[];
}

export function WorkbenchActivityLog({ events }: WorkbenchActivityLogProps) {
  return (
    <section className="workbench-section" aria-labelledby="workbench-activity">
      <h2 id="workbench-activity" className="workbench-section-title">
        {workbenchVoice.activity.title}
      </h2>

      {events.length === 0 ? (
        <p className="workbench-empty">{workbenchVoice.activity.empty}</p>
      ) : (
        <ol className="workbench-log">
          {events.map((event) => (
            <li key={event.id} className="workbench-log-entry">
              <time dateTime={event.at} className="workbench-log-date">
                {formatDate(event.at)}
              </time>
              <div className="workbench-log-body">
                <span className="workbench-log-headline">{event.headline}</span>
                {event.detail ? (
                  <span className="workbench-log-detail">{event.detail}</span>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
