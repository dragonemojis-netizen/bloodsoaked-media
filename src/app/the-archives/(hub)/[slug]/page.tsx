import Link from "next/link";
import { BrandWatermark } from "@/components/brand/BrandWatermark";
import { getArchivePublication } from "@/config/archives";
import { publication } from "@/config/publication";
import { archivesStaticParams } from "@/lib/archives-deploy";
import { isArchivesLocal } from "@/lib/archives-gate";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

/** Placeholder rooms for archives that are not yet restored as immersive publications. */
const PLACEHOLDER_SLUGS = ["bloodsoaked-media"] as const;

interface ArchiveRoomPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return archivesStaticParams(
    PLACEHOLDER_SLUGS.map((slug) => ({ slug })),
  );
}

export async function generateMetadata({
  params,
}: ArchiveRoomPageProps): Promise<Metadata> {
  const { slug } = await params;
  const archive = getArchivePublication(slug);
  if (!archive) return { title: publication.theArchives };

  return {
    title: `${archive.title} · ${publication.theArchives}`,
    description: archive.description,
  };
}

export default async function ArchiveRoomPage({ params }: ArchiveRoomPageProps) {
  if (!isArchivesLocal()) {
    notFound();
  }

  const { slug } = await params;
  if (!(PLACEHOLDER_SLUGS as readonly string[]).includes(slug)) {
    notFound();
  }

  const archive = getArchivePublication(slug);
  if (!archive) {
    notFound();
  }

  return (
    <div className="the-archives-world relative mx-auto max-w-2xl px-6 py-16 md:py-24">
      <BrandWatermark intensity="whisper" />

      <div className="relative z-10">
        <p className="font-mono text-meta uppercase tracking-[0.28em] text-accent-bright">
          {publication.theArchives}
        </p>
        <h1 className="mt-3 font-serif text-3xl text-foreground md:text-4xl">
          {archive.title}
        </h1>
        <span className="mt-5 inline-block timeline-status timeline-status--archived">
          Archived
        </span>

        <p className="mt-10 max-w-xl text-base leading-relaxed text-foreground-muted">
          This archive is being prepared for preservation.
        </p>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-foreground-muted/80">
          When ready, this room will hold the original publication as it was —
          not rewritten for the current site.
        </p>

        <Link
          href="/the-archives"
          className="mt-12 inline-block font-mono text-[0.68rem] uppercase tracking-[0.2em] text-accent-bright transition-colors hover:text-foreground"
        >
          ← Back to The Archives
        </Link>
      </div>
    </div>
  );
}
