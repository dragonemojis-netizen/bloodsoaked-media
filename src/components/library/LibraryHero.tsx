import { BrandWatermark } from "@/components/brand/BrandWatermark";
import { libraryVoice } from "@/config/library-voice";

/**
 * Archival wing entrance — restrained, institutional, timeless.
 * No badges, no motif clutter: rule, imprint, title, charter.
 */
export function LibraryHero() {
  return (
    <section className="library-hero relative overflow-hidden">
      <div className="hero-blood-rule" aria-hidden="true" />
      <BrandWatermark intensity="whisper" className="library-hero-watermark" />

      <div className="relative z-10 px-6 py-8 md:px-10 md:py-11">
        <p className="library-hero-imprint font-mono text-[0.54rem] uppercase tracking-[0.34em] text-foreground-muted/65">
          {libraryVoice.institutionLine}
        </p>

        <p className="hero-kicker mt-7 font-mono text-[0.66rem] uppercase tracking-[0.46em] text-accent-bright">
          {libraryVoice.eyebrow}
        </p>

        <h1 className="mt-3 max-w-3xl font-serif text-[2.35rem] leading-[1.06] tracking-[0.01em] text-foreground md:text-[3rem]">
          {libraryVoice.name}
        </h1>

        <p className="library-hero-description mt-5 max-w-xl whitespace-pre-line text-foreground-muted">
          {libraryVoice.description}
        </p>

        <p className="library-hero-charter mt-8 max-w-md font-serif text-sm italic leading-relaxed text-foreground-muted/85">
          {libraryVoice.heroClosing}
        </p>
      </div>
    </section>
  );
}
