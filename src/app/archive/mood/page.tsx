import Link from "next/link";
import { SectionBreadcrumb } from "@/components/content/SectionBreadcrumb";
import { SectionHeader } from "@/components/content/SectionHeader";
import { MoodBadge } from "@/components/content/MoodBadge";
import { publication } from "@/config/publication";
import { getAllPostMeta, getAllMoodsUsed } from "@/lib/content";
import { MOODS } from "@/types/content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: publication.moods,
  description:
    "Browse Bloodsoaked Media by mood — atmosphere, memory, and the feeling media leaves behind.",
};

export default async function MoodsIndexPage() {
  const posts = await getAllPostMeta();
  const moodsUsed = getAllMoodsUsed(posts);

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <SectionBreadcrumb
        className="mb-8"
        items={[
          { label: "Articles", href: "/articles" },
          { label: publication.catalog, href: "/archive" },
          { label: publication.moods },
        ]}
      />

      <SectionHeader
        eyebrow={publication.moodsEyebrow}
        title={publication.moods}
        description="A catalog organized by atmosphere — how media feels after the credits, not just what genre box it checks."
      />

      <ul className="space-y-8">
        {MOODS.filter((m) => moodsUsed.includes(m)).map((mood) => {
          const count = posts.filter((p) => p.mood === mood).length;
          const sample = posts.filter((p) => p.mood === mood).slice(0, 2);
          return (
            <li
              key={mood}
              className="border border-border bg-background-panel/50 p-6 vhs-card"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <MoodBadge mood={mood} />
                <span className="font-mono text-[0.6rem] uppercase tracking-[0.12em] text-foreground-muted">
                  {count} {count === 1 ? "entry" : "entries"}
                </span>
              </div>
              {sample.length > 0 && (
                <ul className="mt-4 space-y-2">
                  {sample.map((p) => (
                    <li key={p.slug}>
                      <Link
                        href={`/articles/${p.slug}`}
                        className="font-serif text-sm text-foreground-muted transition-colors hover:text-accent-bright"
                      >
                        {p.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              <Link
                href={`/archive/mood/${mood.toLowerCase().replace(/\s+/g, "-")}`}
                className="mt-4 inline-block font-mono text-[0.6rem] uppercase tracking-[0.12em] text-accent-bright hover:text-foreground"
              >
                Browse shelf →
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
