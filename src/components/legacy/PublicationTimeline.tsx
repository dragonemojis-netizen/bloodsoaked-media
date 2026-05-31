import Link from "next/link";
import {
  timelineStatusLabels,
  type TimelineEvent,
  type TimelineStatus,
} from "@/lib/timeline";

interface PublicationTimelineProps {
  introduction?: string;
  events: TimelineEvent[];
}

function statusModifier(status: TimelineStatus) {
  return `timeline-status--${status.replace("-", "_")}`;
}

export function PublicationTimeline({
  introduction,
  events,
}: PublicationTimelineProps) {
  return (
    <div className="publication-timeline">
      {introduction && (
        <p className="timeline-introduction mb-12 max-w-2xl font-serif text-lg leading-relaxed text-foreground-muted">
          {introduction}
        </p>
      )}

      <ol className="timeline-records space-y-6" role="list">
        {events.map((event, index) => (
          <li key={event.filingRef ?? `${event.period}-${event.title}`}>
            <article className="timeline-record vhs-card border border-border bg-background-panel/50">
              <header className="timeline-record-header flex flex-wrap items-start justify-between gap-3 border-b border-border-subtle px-5 py-3 md:px-6">
                <div className="min-w-0">
                  {event.filingRef && (
                    <p className="font-mono text-[0.52rem] uppercase tracking-[0.22em] text-foreground-muted/80">
                      Filing Ref. {event.filingRef}
                    </p>
                  )}
                  <p className="mt-1 font-mono text-[0.72rem] uppercase tracking-[0.28em] text-accent-bright">
                    {event.period}
                  </p>
                </div>
                <span
                  className={`timeline-status shrink-0 ${statusModifier(event.status)}`}
                >
                  {timelineStatusLabels[event.status]}
                </span>
              </header>

              <div className="timeline-record-body px-5 py-5 md:px-6 md:py-6">
                <h3 className="font-serif text-xl text-foreground md:text-2xl">
                  {event.title}
                </h3>
                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-foreground-muted">
                  {event.description}
                </p>

                {event.link && event.linkLabel && (
                  <Link
                    href={event.link}
                    className="mt-5 inline-block font-mono text-[0.58rem] uppercase tracking-[0.14em] text-accent-bright transition-colors hover:text-foreground"
                  >
                    {event.linkLabel} →
                  </Link>
                )}
              </div>

              <footer
                className="timeline-record-footer border-t border-dashed border-border-subtle px-5 py-2 md:px-6"
                aria-hidden="true"
              >
                <span className="font-mono text-[0.5rem] uppercase tracking-[0.18em] text-foreground-muted/50">
                  Record {String(index + 1).padStart(2, "0")} of{" "}
                  {String(events.length).padStart(2, "0")} · Dakota&apos;s Archive
                </span>
              </footer>
            </article>
          </li>
        ))}
      </ol>
    </div>
  );
}
