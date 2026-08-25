import Link from "next/link";
import { BrandWatermark } from "@/components/brand/BrandWatermark";
import { MediaArtifact } from "@/components/brand/MediaArtifact";
import { KnifeMotif } from "@/components/brand/KnifeMotif";
import { SectionKnifeDivider } from "@/components/brand/SectionKnifeDivider";
import { SectionBreadcrumb } from "@/components/content/SectionBreadcrumb";
import { SectionHeader } from "@/components/content/SectionHeader";
import { MoodBadge } from "@/components/content/MoodBadge";
import { PublicationEmptyNotice } from "@/components/content/PublicationEmptyNotice";
import { publication, categoryLabels } from "@/config/publication";
import {
  getCurrentPostMeta,
  getArchiveYears,
  getArchiveMonthsForYear,
  getAllMoodsUsed,
  getAllTags,
} from "@/lib/content";
import { isArchivesLocal } from "@/lib/archives-gate";
import { CATEGORIES } from "@/types/content";
import { slugifyMood, slugifyTag } from "@/lib/slugs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: publication.catalog,
  description: publication.catalogDescription,
};

export default async function ArchiveHubPage() {
  const posts = await getCurrentPostMeta();
  const years = getArchiveYears(posts);
  const moodsUsed = getAllMoodsUsed(posts);
  const tags = getAllTags(posts);

  return (
    <div className="archive-world relative mx-auto max-w-6xl px-6 py-12">
      <BrandWatermark intensity="whisper" />
      <KnifeMotif corner="br" className="!opacity-[0.06]" />
      <span className="archive-ghost-mark" aria-hidden="true">
        HORROR
      </span>

      <SectionBreadcrumb
        className="relative z-10 mb-8"
        items={[
          { label: "Articles", href: "/articles" },
          { label: publication.catalog },
        ]}
      />

      <SectionHeader
        eyebrow={publication.catalogEyebrow}
        title={publication.catalog}
        description={publication.catalogDescription}
      />

      {isArchivesLocal() && (
        <p className="relative z-10 -mt-4 mb-10 max-w-2xl text-sm leading-relaxed text-foreground-muted">
          Recovered writing from earlier eras lives in{" "}
          <Link
            href="/the-archives"
            className="text-accent-bright transition-colors hover:text-foreground"
          >
            {publication.theArchives}
          </Link>
          .
        </p>
      )}

      <div className="mb-12 flex flex-wrap gap-4 font-mono text-[0.7rem] uppercase tracking-[0.15em]">
        <Link
          href="/archive/mood"
          className="border border-border px-4 py-2 text-foreground-muted transition-colors hover:text-foreground vhs-button"
        >
          {publication.moods}
        </Link>
        <Link
          href="/vault"
          className="border border-border px-4 py-2 text-foreground-muted transition-colors hover:text-foreground vhs-button"
        >
          {publication.theVault}
        </Link>
      </div>

      {posts.length === 0 ? (
        <PublicationEmptyNotice
          message={publication.emptyCatalog}
          className="relative z-10 mb-12"
        />
      ) : (
        <>
          <div className="mb-8 flex flex-wrap gap-2">
            <MediaArtifact
              label={`${posts.length} Tapes Filed`}
              variant="accent"
            />
            <MediaArtifact label="Late Night Shelf" variant="vhs" />
            <MediaArtifact label="Dakota's Archive" variant="default" />
          </div>

          <SectionKnifeDivider />

          <div className="relative z-10 grid gap-12 lg:grid-cols-2">
        <section aria-labelledby="years-shelf">
          <h2
            id="years-shelf"
            className="mb-6 font-mono text-[0.7rem] uppercase tracking-[0.3em] text-accent-bright"
          >
            By Year
          </h2>
          <ul className="space-y-4">
            {years.map((year) => {
              const months = getArchiveMonthsForYear(posts, year);
              const yearCount = posts.filter(
                (p) => new Date(p.date).getFullYear().toString() === year,
              ).length;
              return (
                <li
                  key={year}
                  className="border border-border bg-background-panel/40 p-5 vhs-card"
                >
                  <Link
                    href={`/archive/year/${year}`}
                    className="font-serif text-2xl text-foreground transition-colors hover:text-accent-bright"
                  >
                    {year}
                  </Link>
                  <p className="mt-1 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-foreground-muted">
                    {yearCount} {yearCount === 1 ? "entry" : "entries"}
                  </p>
                  {months.length > 0 && (
                    <ul className="mt-4 flex flex-wrap gap-2">
                      {months.map(({ month, label, count }) => (
                        <li key={month}>
                          <Link
                            href={`/archive/year/${year}/${month}`}
                            className="border border-border-subtle px-2 py-1 font-mono text-[0.55rem] uppercase tracking-[0.1em] text-foreground-muted transition-colors hover:border-accent hover:text-accent-bright"
                          >
                            {label} ({count})
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        <div className="space-y-12">
          <section aria-labelledby="category-shelf">
            <h2
              id="category-shelf"
              className="mb-6 font-mono text-[0.7rem] uppercase tracking-[0.3em] text-accent-bright"
            >
              By Category
            </h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {CATEGORIES.map((cat) => {
                const count = posts.filter((p) => p.category === cat).length;
                if (count === 0) return null;
                return (
                  <li key={cat}>
                    <Link
                      href={`/archive/category/${cat}`}
                      className="shelf-label vhs-card block border border-border px-4 py-3 font-mono text-[0.65rem] uppercase tracking-[0.15em] text-foreground-muted transition-colors hover:text-accent-bright"
                    >
                      {categoryLabels[cat]} · {count}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>

          <section aria-labelledby="mood-shelf">
            <h2
              id="mood-shelf"
              className="mb-6 font-mono text-[0.7rem] uppercase tracking-[0.3em] text-accent-bright"
            >
              By Mood
            </h2>
            <ul className="flex flex-wrap gap-2">
              {moodsUsed.map((mood) => (
                <li key={mood}>
                  <MoodBadge mood={mood} />
                </li>
              ))}
            </ul>
            <p className="mt-4">
              <Link
                href="/archive/mood"
                className="font-mono text-[0.6rem] uppercase tracking-[0.12em] text-accent-bright hover:text-foreground"
              >
                View all moods →
              </Link>
            </p>
          </section>
        </div>
      </div>

      <section className="mt-16 border-t border-border-subtle pt-16" aria-labelledby="tags-shelf">
        <h2
          id="tags-shelf"
          className="mb-6 font-mono text-[0.7rem] uppercase tracking-[0.3em] text-foreground-muted"
        >
          {publication.catalog} · Tags
        </h2>
        <ul className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <li key={tag}>
              <Link
                href={`/archive/tag/${slugifyTag(tag)}`}
                className="border border-border px-3 py-1 font-mono text-[0.6rem] uppercase tracking-[0.1em] text-foreground-muted transition-colors hover:border-accent hover:text-accent-bright"
              >
                #{tag}
              </Link>
            </li>
          ))}
        </ul>
      </section>

          <section className="mt-12 border border-border bg-background-panel/30 p-6">
            <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-foreground-muted">
              Complete {publication.catalog}
            </p>
            <p className="mt-2 font-serif text-lg text-foreground">
              {posts.length} entries filed across {years.length}{" "}
              {years.length === 1 ? "year" : "years"}
            </p>
            <Link
              href="/articles"
              className="mt-4 inline-block font-mono text-[0.65rem] uppercase tracking-[0.15em] text-accent-bright hover:text-foreground"
            >
              {publication.browseTheShelf} — all articles →
            </Link>
          </section>
        </>
      )}
    </div>
  );
}
