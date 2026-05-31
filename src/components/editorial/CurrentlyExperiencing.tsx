import { publication } from "@/config/publication";
import type { CurrentlyExperiencing as CurrentlyExperiencingData } from "@/types/editorial";
import { formatDate } from "@/lib/format";

interface CurrentlyExperiencingProps {
  data: CurrentlyExperiencingData;
}

const fields = [
  { key: "playing" as const, label: "Currently Playing" },
  { key: "watching" as const, label: "Recently Watched" },
  { key: "listening" as const, label: "Currently on Repeat" },
  { key: "reading" as const, label: "Currently Reading" },
];

export function CurrentlyExperiencing({ data }: CurrentlyExperiencingProps) {
  const active = fields.filter((f) => data[f.key]);

  if (active.length === 0) return null;

  return (
    <aside
      className="border border-border bg-background-panel/80 p-5 vhs-panel"
      aria-labelledby="currently-experiencing-heading"
    >
      <h2
        id="currently-experiencing-heading"
        className="font-mono text-[0.65rem] uppercase tracking-[0.3em] text-accent-bright"
      >
        {publication.currentlyExperiencing}
      </h2>
      <ul className="mt-4 space-y-4">
        {active.map(({ key, label }) => (
          <li key={key}>
            <p className="font-mono text-[0.6rem] uppercase tracking-[0.15em] text-foreground-muted">
              {label}
            </p>
            <p className="mt-1 font-serif text-sm leading-snug text-foreground">
              {data[key]}
            </p>
          </li>
        ))}
      </ul>
      {data.updated && (
        <p className="mt-5 font-mono text-[0.55rem] uppercase tracking-[0.12em] text-foreground-muted/70">
          Updated {formatDate(data.updated)}
        </p>
      )}
    </aside>
  );
}
