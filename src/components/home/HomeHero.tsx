import Link from "next/link";
import { BrandWatermark } from "@/components/brand/BrandWatermark";
import { KnifeMotif } from "@/components/brand/KnifeMotif";
import { MediaArtifact } from "@/components/brand/MediaArtifact";
import { IssueMark } from "@/components/brand/IssueMark";
import { CoverStory } from "@/components/home/CoverStory";
import { publication } from "@/config/publication";
import { isLegacyArchivePublic } from "@/lib/legacy-gate";
import { site } from "@/config/site";
import type { PostMeta } from "@/types/content";

interface HomeHeroProps {
  leadStory?: PostMeta;
}

export function HomeHero({ leadStory }: HomeHeroProps) {
  return (
    <section className="home-hero relative mb-16 overflow-hidden">
      <div className="hero-blood-rule" aria-hidden="true" />
      <BrandWatermark intensity="low" className="home-hero-watermark" />
      <KnifeMotif corner="tl" className="!h-8 !w-5 !opacity-[0.14]" />
      <KnifeMotif corner="br" className="!h-12 !w-7 !opacity-[0.2]" />

      <div className="relative z-10 px-6 py-8 md:px-10 md:py-12">
        <div className="flex flex-wrap items-center gap-2">
          <IssueMark />
          <MediaArtifact label="Late Night" variant="vhs" />
          <MediaArtifact label="Not For Resale" variant="default" />
          <MediaArtifact label="Cult · Horror · Games" variant="accent" />
        </div>

        <p className="hero-kicker mt-8 font-mono text-[0.68rem] uppercase tracking-[0.42em] text-accent-bright">
          Independent Horror & Media Publication
        </p>

        <h1 className="hero-headline mt-3 max-w-4xl font-serif text-[2.5rem] leading-[1.05] text-foreground md:text-[3.25rem]">
          The shelf stays open
          <span className="hero-headline-accent"> after midnight</span>
        </h1>

        <p className="hero-curator mt-5 max-w-2xl text-base text-foreground md:text-lg">
          <span className="text-foreground">{site.curatorLine}</span>
          <span className="text-foreground-muted">
            {" "}
            — curated by {site.curator}. Reviews, retrospectives, physical media
            hunts, and the horror, games, and cult film that refuse to leave
            the rack.
          </span>
        </p>

        {leadStory ? (
          <div className="mt-10">
            <CoverStory post={leadStory} />
          </div>
        ) : (
          <p className="mt-8 max-w-xl text-foreground-muted leading-relaxed">
            {site.tagline}
          </p>
        )}

        <div className="mt-10 flex flex-wrap gap-4 font-mono text-[0.7rem] uppercase tracking-[0.15em]">
          <Link
            href="/articles"
            className="border border-accent bg-accent/20 px-5 py-2.5 text-foreground transition-colors hover:bg-accent hover:text-white vhs-button"
          >
            {publication.browseArticles}
          </Link>
          {isLegacyArchivePublic() && (
            <Link
              href="/the-archives"
              className="border border-border px-5 py-2.5 text-foreground-muted transition-colors hover:border-accent/50 hover:text-foreground vhs-button"
            >
              {publication.theArchives}
            </Link>
          )}
          <Link
            href="/vault"
            className="border border-border px-5 py-2.5 text-foreground-muted transition-colors hover:border-accent/50 hover:text-foreground vhs-button"
          >
            {publication.theVault}
          </Link>
        </div>
      </div>
    </section>
  );
}
