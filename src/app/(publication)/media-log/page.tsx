import Link from "next/link";
import { SectionHeader } from "@/components/content/SectionHeader";
import { MediaLogCard } from "@/components/media-log/MediaLogCard";
import { MediaLogYearSummary } from "@/components/media-log/MediaLogYearSummary";
import { publication } from "@/config/publication";
import { getAllMediaLogEntries, getMediaLogYearArchive } from "@/lib/media-log";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Media Log",
  description:
    "A personal archive of media experiences — games finished, films rewatched, shelves revisited. Not a review feed.",
};

export default function MediaLogPage() {
  const entries = getAllMediaLogEntries();

  const byYear = entries.reduce<Record<string, typeof entries>>((acc, entry) => {
    const year = entry.date
      ? new Date(entry.date).getFullYear().toString()
      : entry.logYear?.toString() ?? "Archive";
    if (!acc[year]) acc[year] = [];
    acc[year].push(entry);
    return acc;
  }, {});

  const years = Object.keys(byYear).sort((a, b) => Number(b) - Number(a));

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <SectionHeader
        eyebrow={publication.mediaLogEyebrow}
        title={publication.mediaLog}
        description="A collector's shelf record — what was played, where it happened, and when it was filed. Platform and date matter here; hours and completion times do not."
      />

      {entries.length === 0 ? (
        <p className="text-foreground-muted">The log is empty. First entry coming soon.</p>
      ) : (
        <div className="space-y-12">
          {years.map((year) => {
            const yearArchive = getMediaLogYearArchive(Number(year));
            return (
              <section key={year} aria-labelledby={`log-year-${year}`}>
                <h2
                  id={`log-year-${year}`}
                  className="mb-6 font-mono text-[0.75rem] uppercase tracking-[0.3em] text-accent-bright"
                >
                  {year}
                </h2>
                {yearArchive && <MediaLogYearSummary archive={yearArchive} />}
                <div>
                  {byYear[year].map((entry) => (
                    <MediaLogCard key={entry.slug} entry={entry} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      <p className="mt-12 text-center">
        <Link
          href="/articles"
          className="font-mono text-[0.65rem] uppercase tracking-[0.15em] text-foreground-muted transition-colors hover:text-accent-bright"
        >
          Long-form writing lives in Articles →
        </Link>
      </p>
    </div>
  );
}
