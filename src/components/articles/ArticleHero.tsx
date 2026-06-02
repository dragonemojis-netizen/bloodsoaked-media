import Image from "next/image";
import Link from "next/link";
import { MoodBadge } from "@/components/content/MoodBadge";
import { VerdictBadge } from "@/components/content/VerdictBadge";
import { VaultMarker } from "./VaultMarker";
import { ArticleCollectionBanner } from "./ArticleCollectionBanner";
import {
  publication,
  categoryLabels,
  mediumLabels,
} from "@/config/publication";
import { site } from "@/config/site";
import { formatDate, formatPublishedAt } from "@/lib/format";
import type { Post } from "@/types/content";
import type { Collection } from "@/types/collection";

interface ArticleHeroProps {
  post: Post;
  inVault: boolean;
  collections: Collection[];
}

function typeLabel(type: Post["type"]) {
  const labels: Record<Post["type"], string> = {
    review: "Review",
    essay: "Essay",
    retrospective: "Retrospective",
    collection: "Collection Feature",
    editorial: "Editorial",
  };
  return labels[type];
}

function vaultVariant(slug: string): "entry" | "permanent" | "preservation" {
  const variants = ["entry", "permanent", "preservation"] as const;
  const index = slug.length % variants.length;
  return variants[index]!;
}

export function ArticleHero({ post, inVault, collections }: ArticleHeroProps) {
  return (
    <header className="article-hero">
      <div className="article-hero-image">
        {post.coverImage ? (
          <Image
            src={post.coverImage}
            alt={`Cover art — ${post.title}`}
            fill
            priority
            className="object-contain object-center"
            sizes="100vw"
          />
        ) : (
          <div className="article-hero-fallback" aria-hidden="true">
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.35em] text-accent-bright/40">
              {post.mood}
            </span>
          </div>
        )}
        <div className="article-hero-scrim" aria-hidden="true" />
      </div>

      <div className="article-hero-content">
        <Link
          href={post.legacy ? "/the-archives" : "/articles"}
          className="article-back-link font-mono text-[0.6rem] uppercase tracking-[0.22em] text-foreground-muted transition-colors hover:text-accent-bright"
        >
          {post.legacy ? `← ${publication.theArchives}` : "← The Desk"}
        </Link>

        <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-foreground-muted">
          <Link
            href={`/archive/category/${post.category}`}
            className="text-accent-bright transition-colors hover:text-foreground"
          >
            {categoryLabels[post.category] ?? post.category}
          </Link>
          <span aria-hidden="true" className="text-border">
            /
          </span>
          <span>{typeLabel(post.type)}</span>
          <span aria-hidden="true" className="text-border">
            /
          </span>
          <span>{mediumLabels[post.medium] ?? post.medium}</span>
          {post.era && (
            <>
              <span aria-hidden="true" className="text-border">
                /
              </span>
              <span>{post.era}</span>
            </>
          )}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-foreground-muted">
          {post.legacy && post.originalPublicationDate ? (
            <>
              <time dateTime={post.originalPublicationDate}>
                {publication.originallyPublished}:{" "}
                {formatDate(post.originalPublicationDate)}
              </time>
              {post.archiveDate && (
                <>
                  <span aria-hidden="true">·</span>
                  <time dateTime={post.archiveDate}>
                    {publication.archivedOn}: {formatDate(post.archiveDate)}
                  </time>
                </>
              )}
            </>
          ) : (
            <time dateTime={post.date}>{formatPublishedAt(post.date)}</time>
          )}
          <span aria-hidden="true">·</span>
          <span>{post.readingTime}</span>
        </div>

        <div className="mt-4">
          <MoodBadge mood={post.mood} />
        </div>

        {inVault && (
          <div className="mt-6">
            <VaultMarker variant={vaultVariant(post.slug)} />
          </div>
        )}

        <h1 className="article-title mt-6 font-serif text-foreground">
          {post.title}
        </h1>

        {post.subtitle && (
          <p className="article-subtitle mt-3 font-serif text-xl italic text-foreground-muted md:text-2xl">
            {post.subtitle}
          </p>
        )}

        <p className="article-deck mt-6 text-foreground-muted">{post.excerpt}</p>

        <p className="article-byline mt-8 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-foreground-muted">
          {publication.byline}{" "}
          <span className="text-foreground">{site.author}</span>
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          {post.verdict && <VerdictBadge verdict={post.verdict} />}
          {post.editorPick && (
            <span className="border border-accent/40 bg-accent/5 px-2 py-0.5 font-mono text-[0.58rem] uppercase tracking-[0.14em] text-accent-bright">
              {publication.editorsPick}
            </span>
          )}
        </div>

        <ArticleCollectionBanner collections={collections} />
      </div>
    </header>
  );
}
