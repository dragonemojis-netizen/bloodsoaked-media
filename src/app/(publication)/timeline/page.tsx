import Link from "next/link";
import { BrandWatermark } from "@/components/brand/BrandWatermark";
import { MediaArtifact } from "@/components/brand/MediaArtifact";
import { SectionBreadcrumb } from "@/components/content/SectionBreadcrumb";
import { SectionHeader } from "@/components/content/SectionHeader";
import { PublicationTimeline } from "@/components/legacy/PublicationTimeline";
import { publication } from "@/config/publication";
import { site } from "@/config/site";
import { isArchivesLocal } from "@/lib/archives-gate";
import { getPublicationTimeline } from "@/lib/timeline";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: publication.publicationTimeline,
  description:
    "Dakota's publication history from Metal Lifestyle (2015) through Bloodsoaked Media — archive eras, quiet years, and the 2026 relaunch.",
};

export default function TimelinePage() {
  const timeline = getPublicationTimeline();

  return (
    <div className="timeline-world relative mx-auto max-w-3xl px-6 py-12">
      <BrandWatermark intensity="whisper" />
      <span className="archive-ghost-mark" aria-hidden="true">
        HISTORY
      </span>

      <SectionBreadcrumb
        className="relative z-10 mb-8"
        items={
          isArchivesLocal()
            ? [
                { label: publication.theArchives, href: "/the-archives" },
                { label: publication.publicationTimeline },
              ]
            : [{ label: publication.publicationTimeline }]
        }
      />

      <SectionHeader
        eyebrow={publication.timelineEyebrow}
        title={publication.publicationTimeline}
        description={`A filed record of ${site.curator}'s writing and publication journey — not a site launch story.`}
      />

      <div className="relative z-10 mb-10 flex flex-wrap gap-2">
        <MediaArtifact label="Publication Record" variant="vhs" />
        <MediaArtifact label="Est. 2015" variant="accent" />
        <MediaArtifact label="Relaunch 2026" variant="default" />
      </div>

      <div className="relative z-10">
        <PublicationTimeline
          introduction={timeline.introduction}
          events={timeline.events}
        />

        {isArchivesLocal() && (
          <p className="mt-12 border-t border-border-subtle pt-8 text-center">
            <Link
              href="/the-archives"
              className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-accent-bright transition-colors hover:text-foreground"
            >
              ← {publication.theArchives}
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
