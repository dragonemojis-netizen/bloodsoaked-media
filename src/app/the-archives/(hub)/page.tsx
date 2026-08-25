import { BrandWatermark } from "@/components/brand/BrandWatermark";
import { ArchiveCaseFile } from "@/components/legacy/ArchiveCaseFile";
import { getVisibleArchivePublications } from "@/config/archives";
import { publication } from "@/config/publication";
import { isArchivesLocal } from "@/lib/archives-gate";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: publication.theArchives,
  description:
    "Preserved publications and projects from earlier chapters — historical reference, not current writing.",
};

export default function TheArchivesPage() {
  if (!isArchivesLocal()) {
    notFound();
  }

  const archivePublications = getVisibleArchivePublications(true);

  return (
    <div className="the-archives-world relative mx-auto max-w-3xl px-6 py-16 md:py-24">
      <BrandWatermark intensity="whisper" />

      <header className="relative z-10 mb-16 md:mb-20">
        <p className="font-mono text-meta uppercase tracking-[0.28em] text-accent-bright">
          {publication.theArchivesEyebrow}
        </p>
        <h1 className="mt-3 font-serif text-4xl text-foreground md:text-5xl lg:text-6xl">
          {publication.theArchives}
        </h1>
        <p className="mt-5 max-w-xl font-serif text-lg leading-relaxed text-foreground-muted md:text-xl">
          Preserved publications and projects from earlier chapters.
        </p>
        <p className="mt-8 max-w-2xl text-base leading-relaxed text-foreground-muted">
          Every publication leaves something behind. Some evolve, some
          disappear, and some deserve to be preserved. These archives are
          snapshots of earlier work, presented for historical reference in the
          spirit they were originally created.
        </p>
      </header>

      <ul className="relative z-10 space-y-10 md:space-y-12" role="list">
        {archivePublications.map((archive) => (
          <li key={archive.slug}>
            <ArchiveCaseFile archive={archive} />
          </li>
        ))}
      </ul>
    </div>
  );
}
