import Image from "next/image";
import Link from "next/link";
import { publication } from "@/config/publication";
import type { FromTheEditor as FromTheEditorData } from "@/types/editorial";
import { formatDate } from "@/lib/format";
import { FromTheEditorExpandableBody } from "./FromTheEditorExpandableBody";

interface FromTheEditorProps {
  data: FromTheEditorData;
}

export function FromTheEditor({ data }: FromTheEditorProps) {
  const images = data.images ?? [];

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
        <FromTheEditorExpandableBody
          paragraphs={data.body}
          previewCount={data.previewParagraphs}
        />
      )}

      {images.length > 0 && (
        <div className="mt-8 border-t border-border-subtle pt-6">
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-foreground-muted">
            From the shelf
          </p>
          <ul className="mt-4 grid gap-4">
            {images.map((image) => (
              <li
                key={image.src}
                className="overflow-hidden border border-border bg-background-panel"
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={1600}
                  height={1200}
                  sizes="(max-width: 1024px) 100vw, 720px"
                  className="h-auto w-full vhs-hover-image"
                />
              </li>
            ))}
          </ul>
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
