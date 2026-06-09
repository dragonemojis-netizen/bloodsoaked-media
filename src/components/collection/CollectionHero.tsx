import { BrandWatermark } from "@/components/brand/BrandWatermark";
import { KnifeMotif } from "@/components/brand/KnifeMotif";
import { MediaArtifact } from "@/components/brand/MediaArtifact";
import { publication } from "@/config/publication";
import { site } from "@/config/site";

export function CollectionHero() {
  return (
    <section className="collection-hero relative overflow-hidden">
      <div className="hero-blood-rule" aria-hidden="true" />
      <BrandWatermark intensity="whisper" className="collection-hero-watermark" />
      <KnifeMotif corner="tl" className="!h-8 !w-5 !opacity-[0.12]" />
      <KnifeMotif corner="br" className="!h-10 !w-6 !opacity-[0.16]" />
      <span className="archive-ghost-mark" aria-hidden="true">
        COLL
      </span>

      <div className="relative z-10 px-6 py-10 md:px-10 md:py-14">
        <div className="flex flex-wrap items-center gap-2">
          <MediaArtifact label="Preservation" variant="accent" />
          <MediaArtifact label="Physical Media" variant="vhs" />
          <MediaArtifact label="Permanent Record" variant="default" />
        </div>

        <p className="hero-kicker mt-8 font-mono text-[0.68rem] uppercase tracking-[0.42em] text-accent-bright">
          {publication.collectionEyebrow}
        </p>

        <h1 className="mt-3 max-w-3xl font-serif text-[2.35rem] leading-[1.08] text-foreground md:text-[3rem]">
          {publication.collection}
        </h1>

        <p className="section-lead mt-5 max-w-2xl whitespace-pre-line text-foreground-muted leading-relaxed">
          {publication.collectionDescription}
        </p>

        <p className="collection-hero-attribution mt-7 font-serif text-sm italic text-foreground-muted/90">
          {publication.collectionHeroAttribution}{" "}
          <span className="text-foreground/90">{site.curator}</span>
          <span aria-hidden="true"> · </span>
          {site.curatorLine}
        </p>
      </div>
    </section>
  );
}
