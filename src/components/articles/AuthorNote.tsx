import { publication } from "@/config/publication";
import { site } from "@/config/site";

interface AuthorNoteProps {
  note: string;
}

export function AuthorNote({ note }: AuthorNoteProps) {
  return (
    <aside className="article-author-note my-10 border-l-2 border-accent/60 pl-6 md:pl-8">
      <p className="font-mono text-[0.6rem] uppercase tracking-[0.28em] text-accent-bright">
        {publication.authorNote}
      </p>
      <p className="mt-4 font-serif text-lg italic leading-[1.75] text-foreground md:text-xl">
        {note}
      </p>
      <p className="mt-4 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-foreground-muted">
        — {site.author}
      </p>
    </aside>
  );
}
