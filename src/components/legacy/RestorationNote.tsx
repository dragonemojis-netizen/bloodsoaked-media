import { publication } from "@/config/publication";
import { site } from "@/config/site";

interface RestorationNoteProps {
  note: string;
}

export function RestorationNote({ note }: RestorationNoteProps) {
  return (
    <aside
      className="restoration-note"
      aria-labelledby="restoration-note-heading"
    >
      <h2
        id="restoration-note-heading"
        className="font-mono text-[0.62rem] uppercase tracking-[0.28em] text-foreground-muted"
      >
        {publication.restorationNote}
      </h2>
      <p className="mt-4 font-serif text-base italic leading-relaxed text-foreground-muted">
        {note}
      </p>
      <p className="mt-4 font-mono text-[0.55rem] uppercase tracking-[0.12em] text-foreground-muted/60">
        — {site.curator}, {new Date().getFullYear()}
      </p>
    </aside>
  );
}
