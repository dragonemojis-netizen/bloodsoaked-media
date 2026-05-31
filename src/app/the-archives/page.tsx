import Link from "next/link";
import { BrandWatermark } from "@/components/brand/BrandWatermark";
import { KnifeMotif } from "@/components/brand/KnifeMotif";
import { MediaArtifact } from "@/components/brand/MediaArtifact";
import { SectionExplore } from "@/components/content/SectionExplore";
import { SectionHeader } from "@/components/content/SectionHeader";
import { LegacyArtifactCard } from "@/components/legacy/LegacyArtifactCard";
import { publication } from "@/config/publication";
import { getLegacyPosts } from "@/lib/content";
import { getCollection } from "@/lib/collections";
import { isLegacyArchivePublic } from "@/lib/legacy-gate";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: publication.theArchives,
  description:
    "Recovered writing from Metal Lifestyle, early Bloodsoaked Media, and legacy publication eras — preserved, not rewritten.",
};

export default async function TheArchivesPage() {
  if (!isLegacyArchivePublic()) {
    notFound();
  }

  const [legacyPosts, collection] = await Promise.all([
    getLegacyPosts(),
    Promise.resolve(getCollection("the-archives")),
  ]);

  const bySource = legacyPosts.reduce<Record<string, typeof legacyPosts>>(
    (acc, post) => {
      const key = post.originalPublication ?? "Unknown";
      if (!acc[key]) acc[key] = [];
      acc[key].push(post);
      return acc;
    },
    {},
  );

  const sources = Object.keys(bySource).sort();

  return (
    <div className="the-archives-world relative mx-auto max-w-5xl px-6 py-12">
      <BrandWatermark intensity="whisper" />
      <KnifeMotif corner="br" className="!opacity-[0.1]" />
      <span className="archive-ghost-mark" aria-hidden="true">
        LEGACY
      </span>

      <SectionHeader
        eyebrow={publication.theArchivesEyebrow}
        title={publication.theArchives}
        description={
          collection?.description ??
          "Historical reviews, essays, and editorials recovered from earlier publication eras. Original wording preserved."
        }
      />

      {collection?.personalNote && (
        <blockquote className="relative z-10 mb-10 border-l-2 border-accent pl-6 font-serif italic text-foreground-muted leading-relaxed">
          {collection.personalNote}
        </blockquote>
      )}

      <p className="relative z-10 -mt-4 mb-6 max-w-2xl text-sm leading-relaxed text-foreground-muted">
        Current writing lives under{" "}
        <Link
          href="/articles"
          className="text-accent-bright transition-colors hover:text-foreground"
        >
          Articles
        </Link>
        . This room holds recovered historical material only.
      </p>

      <div className="relative z-10 mb-6 flex flex-wrap gap-2">
        <MediaArtifact label="Preservation Project" variant="accent" />
        <MediaArtifact label="Unaltered Text" variant="vhs" />
      </div>

      <SectionExplore
        className="relative z-10 mb-10"
        links={[
          { href: "/timeline", label: publication.publicationTimeline },
          { href: "/articles", label: "Current Articles" },
        ]}
      />

      {legacyPosts.length === 0 ? (
        <p className="text-foreground-muted">No legacy pieces filed yet.</p>
      ) : (
        <div className="relative z-10 space-y-14">
          {sources.map((source) => (
            <section key={source} aria-labelledby={`source-${source}`}>
              <h2
                id={`source-${source}`}
                className="mb-6 font-mono text-[0.72rem] uppercase tracking-[0.3em] text-accent-bright"
              >
                {source}
              </h2>
              <ul className="grid gap-5 md:grid-cols-2" role="list">
                {bySource[source].map((post) => (
                  <li key={post.slug} className="relative">
                    <LegacyArtifactCard post={post} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
