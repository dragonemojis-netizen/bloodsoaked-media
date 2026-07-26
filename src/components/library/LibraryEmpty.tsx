import { libraryVoice } from "@/config/library-voice";

/**
 * The empty archival wing — typography does the work.
 * Soft light, held climate, anticipation. No illustration.
 */
export function LibraryEmpty() {
  return (
    <section
      aria-labelledby="library-empty-heading"
      className="library-empty vault-plaque border border-border/80 bg-background-panel/55 px-8 py-10 md:px-14 md:py-16"
    >
      <p className="font-mono text-[0.6rem] uppercase tracking-[0.34em] text-accent-bright">
        {libraryVoice.empty.eyebrow}
      </p>

      <h2
        id="library-empty-heading"
        className="mt-4 max-w-xl font-serif text-[1.75rem] leading-[1.22] text-foreground md:text-[2.35rem]"
      >
        {libraryVoice.empty.title}
      </h2>

      <p className="mt-6 max-w-xl text-[1.0325rem] leading-[1.72] text-foreground-muted">
        {libraryVoice.empty.body}
      </p>

      <p className="mt-8 max-w-lg border-l-2 border-accent/25 pl-5 font-serif text-[0.95rem] italic leading-[1.7] text-foreground-muted/80">
        {libraryVoice.empty.hint}
      </p>

      <p className="library-empty-stamp mt-12 border-t border-border-subtle/60 pt-5 font-mono text-[0.52rem] uppercase tracking-[0.32em] text-foreground-muted/45">
        {libraryVoice.empty.stamp}
      </p>
    </section>
  );
}
