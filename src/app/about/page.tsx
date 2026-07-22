import { SectionHeader } from "@/components/content/SectionHeader";
import { BrandWatermark } from "@/components/brand/BrandWatermark";
import { SiteLogo } from "@/components/layout/SiteLogo";
import { site } from "@/config/site";
import { VERDICTS } from "@/types/content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "Bloodsoaked Media is where Dakota keeps track of the games, films, music, and media worth remembering.",
};

export default function AboutPage() {
  return (
    <div className="relative mx-auto max-w-3xl px-6 py-12">
      <BrandWatermark intensity="whisper" />

      <SectionHeader
        eyebrow="Publication"
        title="About"
        description="Bloodsoaked Media is where I keep track of the things that matter to me."
      />

      <div className="relative z-10 mb-14 flex justify-center px-2">
        <SiteLogo variant="about" />
      </div>

      <div className="prose-article space-y-8 text-foreground-muted">
        <section>
          <p>
            Bloodsoaked Media is where I keep track of the things that matter to
            me.
          </p>
          <p>
            Games, movies, television, music, physical media, old favorites, new
            discoveries, and the occasional thing that completely takes over my
            brain for a week.
          </p>
          <p>
            I&apos;ve been writing about media for years, and this site exists to
            bring that work together in one place — reviews, essays, and the
            ongoing record of what I&apos;ve been playing, watching, reading, and
            listening to.
          </p>
          <p>
            I don&apos;t really separate media from the memories attached to it.
            A game isn&apos;t just a game. It&apos;s where I played it, who
            recommended it, the time in my life I found it, or why I keep coming
            back years later. The same goes for movies, albums, books, and
            everything else that ends up on the shelf.
          </p>
          <p>
            Bloodsoaked Media sits somewhere between a review outlet, a personal
            archive, and a long-running journal. Some articles will be reviews.
            Some will be essays. Some will just be records of what I&apos;ve been
            playing, watching, reading, and listening to.
          </p>
          <p>The goal isn&apos;t to keep up with every new release.</p>
          <p>The goal is to document the things worth remembering.</p>
        </section>

        <section>
          <h2>What You&apos;ll Find Here</h2>

          <h3>Reviews</h3>
          <p>
            Thoughts on games, films, television, music, and whatever else earns
            a place in the archive.
          </p>

          <h3>Retrospectives</h3>
          <p>
            Looking back at the releases, series, and moments that still matter
            years later.
          </p>

          <h3>Essays</h3>
          <p>
            Longer pieces about media, collecting, preservation, horror, and
            whatever happens to be occupying my attention.
          </p>

          <h3>Collections</h3>
          <p>
            Physical media, game collecting, shelf tours, preservation projects,
            and the stories behind them.
          </p>

          <h3>The Media Log</h3>
          <p>
            An ongoing record of what I&apos;ve been playing, watching, reading,
            and listening to.
          </p>
        </section>

        <section>
          <h2>Reviews &amp; Verdicts</h2>
          <p>
            Bloodsoaked Media uses simple verdicts instead of chasing score
            inflation.
          </p>
          <ul>
            {VERDICTS.map((verdict) => (
              <li key={verdict}>{verdict}</li>
            ))}
          </ul>
          <p>
            Some pieces may still include personal scores for archival purposes,
            but the writing will always matter more than the number attached to
            it.
          </p>
        </section>

        <section>
          <h2>Contact</h2>
          <p>
            Bloodsoaked Media is independently run by {site.curator}.
          </p>
          <p>
            For questions, recommendations, corrections, or general
            correspondence:
          </p>
          <p>
            <a href="mailto:bloodsoakedmedia@gmail.com">
              bloodsoakedmedia@gmail.com
            </a>
          </p>
        </section>

        <footer className="border-t border-border-subtle pt-8">
          <p className="font-mono text-meta uppercase tracking-[0.14em] text-foreground-muted">
            Established 2019 • Revived 2026
          </p>
          <p className="mt-3 font-serif text-lg italic text-foreground">
            The shelf stays open after midnight.
          </p>
        </footer>
      </div>
    </div>
  );
}
