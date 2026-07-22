import Link from "next/link";
import type { ArchivePublication } from "@/config/archives";

interface ArchiveCaseFileProps {
  archive: ArchivePublication;
}

export function ArchiveCaseFile({ archive }: ArchiveCaseFileProps) {
  return (
    <Link
      href={archive.href}
      className="archive-case-file group block cursor-pointer no-underline"
    >
      <article className="relative">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <h2 className="font-serif text-2xl text-foreground md:text-3xl">
            {archive.title}
          </h2>
          <span className="timeline-status timeline-status--archived shrink-0">
            Archived
          </span>
        </div>

        <p className="max-w-2xl font-serif text-base leading-relaxed text-foreground-muted md:text-lg">
          {archive.description}
        </p>

        <dl className="mt-8 grid gap-4 border-t border-border-subtle pt-6 font-mono text-[0.65rem] uppercase tracking-[0.14em] sm:grid-cols-3">
          <div>
            <dt className="text-foreground-muted/70">Publication</dt>
            <dd className="mt-1.5 normal-case tracking-normal text-foreground">
              {archive.publication}
            </dd>
          </div>
          <div>
            <dt className="text-foreground-muted/70">Years</dt>
            <dd className="mt-1.5 normal-case tracking-normal text-foreground">
              {archive.years}
            </dd>
          </div>
          <div>
            <dt className="text-foreground-muted/70">Medium</dt>
            <dd className="mt-1.5 normal-case tracking-normal text-foreground">
              {archive.medium}
            </dd>
          </div>
        </dl>

        <p className="mt-8 font-mono text-[0.68rem] uppercase tracking-[0.2em] text-accent-bright transition-colors group-hover:text-foreground">
          Explore Archive →
        </p>
      </article>
    </Link>
  );
}
