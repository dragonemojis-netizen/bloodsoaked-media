import Link from "next/link";
import { publication } from "@/config/publication";
import type { FromTheEditor as FromTheEditorData } from "@/types/editorial";
import { formatDate } from "@/lib/format";

interface FromTheEditorProps {
  data: FromTheEditorData;
}

export function FromTheEditor({ data }: FromTheEditorProps) {
  return (
    <section
      className="relative mb-16 overflow-hidden border-l-2 border-accent bg-background-panel/40 px-6 py-8 md:px-8"
      aria-labelledby="from-the-editor-heading"
    >
      <h2
        id="from-the-editor-heading"
        className="font-mono text-[0.7rem] uppercase tracking-[0.3em] text-accent-bright"
      >
        {publication.fromTheEditor}
      </h2>

      <p className="mt-4 font-serif text-lg italic leading-relaxed text-foreground">
        {data.introduction}
      </p>

      {data.body.length > 0 && (
        <div className="mt-6 space-y-4 text-foreground-muted leading-relaxed">
          {data.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      )}

      {(data.monthlyUpdate || data.monthlyClosing) && (
        <div className="mt-6 border-t border-border-subtle pt-6">
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-foreground-muted">
            This Month
          </p>
          <div className="mt-2 space-y-4 text-foreground-muted leading-relaxed">
            {data.monthlyUpdate && <p>{data.monthlyUpdate}</p>}
            {data.monthlyClosing && <p>{data.monthlyClosing}</p>}
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-4">
        {data.updated && (
          <p className="font-mono text-[0.55rem] uppercase tracking-[0.12em] text-foreground-muted/70">
            Column updated {formatDate(data.updated)}
          </p>
        )}
        <Link
          href="/about"
          className="font-mono text-[0.65rem] uppercase tracking-[0.15em] text-accent-bright transition-colors hover:text-foreground"
        >
          About the publication →
        </Link>
      </div>
    </section>
  );
}
