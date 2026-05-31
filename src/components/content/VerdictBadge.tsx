import type { Verdict } from "@/types/content";

const verdictStyles: Record<Verdict, string> = {
  Recommended: "border-emerald-900/60 bg-emerald-950/40 text-emerald-200",
  "Recommended With Caveats":
    "border-amber-900/60 bg-amber-950/40 text-amber-200",
  "For Fans Only": "border-border bg-background-panel text-foreground-muted",
  "Not Recommended": "border-accent/40 bg-accent/10 text-accent-bright",
};

interface VerdictBadgeProps {
  verdict: Verdict;
}

export function VerdictBadge({ verdict }: VerdictBadgeProps) {
  return (
    <span
      className={`inline-block border px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-[0.15em] ${verdictStyles[verdict]}`}
    >
      {verdict}
    </span>
  );
}
