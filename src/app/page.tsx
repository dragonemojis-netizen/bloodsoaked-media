import { PostCard } from "@/components/content/PostCard";
import { FromTheEditor } from "@/components/editorial/FromTheEditor";
import { HomeSidebar } from "@/components/home/HomeSidebar";
import { HomeHero } from "@/components/home/HomeHero";
import { SectionKnifeDivider } from "@/components/brand/SectionKnifeDivider";
import { publication } from "@/config/publication";
import { PublicationEmptyNotice } from "@/components/content/PublicationEmptyNotice";
import { getFeaturedPosts, getRecentPosts } from "@/lib/content";
import {
  getFromTheEditor,
  getCurrentlyExperiencing,
  getListeningRoom,
} from "@/lib/editorial";
import { getRecentMediaLogEntries } from "@/lib/media-log";
import Link from "next/link";

export default async function HomePage() {
  const [featured, recent, editor, experiencing, listeningRoom, recentLog] =
    await Promise.all([
      getFeaturedPosts(2),
      getRecentPosts(4),
      getFromTheEditor(),
      Promise.resolve(getCurrentlyExperiencing()),
      Promise.resolve(getListeningRoom()),
      Promise.resolve(getRecentMediaLogEntries(3)),
    ]);

  const leadStory = featured[0];
  const featuredRest = featured.slice(1);
  const recentSlugs = new Set(featured.map((p) => p.slug));
  const latest = recent.filter((p) => !recentSlugs.has(p.slug));

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <HomeHero leadStory={leadStory} />

      <div className="lg:grid lg:grid-cols-[1fr_280px] lg:gap-12 xl:grid-cols-[1fr_300px]">
        <div>
          {editor && <FromTheEditor data={editor} />}

          {featuredRest.length > 0 && (
            <section className="mb-16" aria-labelledby="featured-heading">
              <div className="mb-8 flex items-end justify-between gap-4 border-b border-border-subtle pb-4">
                <h2
                  id="featured-heading"
                  className="font-mono text-[0.7rem] uppercase tracking-[0.3em] text-foreground-muted"
                >
                  {publication.featured}
                </h2>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                {featuredRest.map((post) => (
                  <PostCard key={post.slug} post={post} featured />
                ))}
              </div>
            </section>
          )}

          <SectionKnifeDivider />

          <section aria-labelledby="recent-heading">
            <div className="mb-8 flex items-end justify-between gap-4 border-b border-border-subtle pb-4">
              <h2
                id="recent-heading"
                className="font-mono text-[0.7rem] uppercase tracking-[0.3em] text-foreground-muted"
              >
                {publication.recent}
              </h2>
              <Link
                href="/articles"
                className="font-mono text-[0.65rem] uppercase tracking-[0.15em] text-accent-bright transition-colors hover:text-foreground"
              >
                All Articles →
              </Link>
            </div>
            {latest.length === 0 ? (
              <PublicationEmptyNotice message={publication.emptyRecent} />
            ) : (
              <div className="divide-y divide-border-subtle">
                {latest.map((post) => (
                  <PostCard key={post.slug} post={post} />
                ))}
              </div>
            )}
          </section>
        </div>

        <HomeSidebar
          experiencing={experiencing}
          listeningRoom={listeningRoom}
          recentLog={recentLog}
        />
      </div>
    </div>
  );
}
