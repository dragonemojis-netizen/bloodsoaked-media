import type { MediaLogYearArchive } from "@/types/media-log";

interface MediaLogYearSummaryProps {
  archive: MediaLogYearArchive;
}

export function MediaLogYearSummary({ archive }: MediaLogYearSummaryProps) {
  const { multiplayer, themes, introduction, title } = archive;

  return (
    <div className="media-log-year-summary mb-10 border border-border-subtle bg-background-panel/60 p-6 md:p-8">
      <p className="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-accent-bright">
        {archive.year} Archive
      </p>
      <h3 className="mt-2 font-serif text-xl text-foreground md:text-2xl">{title}</h3>
      <p className="mt-3 text-body-sm leading-relaxed text-foreground-muted">
        {introduction}
      </p>

      {themes.length > 0 && (
        <div className="mt-6">
          <p className="font-mono text-meta uppercase tracking-[0.14em] text-foreground-muted">
            Year Themes
          </p>
          <ul className="mt-3 flex flex-wrap gap-2" role="list">
            {themes.map((theme) => (
              <li key={theme}>
                <span className="media-log-theme-tag">{theme}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="media-log-multiplayer-record mt-8 border-t border-border-subtle pt-6">
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-foreground-muted">
          {multiplayer.label}
        </p>
        <p className="mt-2 font-serif text-2xl text-foreground">{multiplayer.title}</p>
        <p className="mt-1 font-mono text-lg tracking-[0.08em] text-accent-bright">
          {multiplayer.hours} {multiplayer.unit}
        </p>
        <p className="mt-2 text-xs text-foreground-muted">
          A personal yearly milestone — not a leaderboard.
        </p>
      </div>
    </div>
  );
}
