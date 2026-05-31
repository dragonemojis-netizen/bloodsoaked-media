import Link from "next/link";
import type { Mood } from "@/types/content";
import { slugifyMood } from "@/lib/slugs";

interface MoodBadgeProps {
  mood: Mood;
  linked?: boolean;
}

export function MoodBadge({ mood, linked = true }: MoodBadgeProps) {
  const className =
    "inline-block border border-border bg-background-elevated px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-foreground-muted transition-colors hover:border-accent/40 hover:text-accent-bright";

  if (!linked) {
    return <span className={className}>{mood}</span>;
  }

  return (
    <Link href={`/archive/mood/${slugifyMood(mood)}`} className={className}>
      {mood}
    </Link>
  );
}
