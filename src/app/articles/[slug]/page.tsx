import { notFound } from "next/navigation";
import { ArticleHero } from "@/components/articles/ArticleHero";
import { AuthorNote } from "@/components/articles/AuthorNote";
import { LegacyArchiveBanner } from "@/components/legacy/LegacyArchiveBanner";
import { RestorationNote } from "@/components/legacy/RestorationNote";
import { ArticleFiledUnder } from "@/components/articles/ArticleFiledUnder";
import { ArticlePrevNext } from "@/components/articles/ArticlePrevNext";
import { RelatedArticles } from "@/components/articles/RelatedArticles";
import {
  getAllPosts,
  getPostBySlug,
  getRelatedPosts,
  getAdjacentPosts,
} from "@/lib/content";
import { getCollection, getCollectionsForArticle } from "@/lib/collections";
import { getVault } from "@/lib/vault";
import type { Collection } from "@/types/collection";
import type { Metadata } from "next";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

function resolveCollections(
  slug: string,
  explicitSlugs: string[] = [],
): Collection[] {
  const fromJson = getCollectionsForArticle(slug);
  const slugSet = new Set([
    ...fromJson.map((c) => c.slug),
    ...explicitSlugs,
  ]);

  return [...slugSet]
    .map((s) => getCollection(s))
    .filter((c): c is Collection => c !== null);
}

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Not Found" };

  const description = post.subtitle
    ? `${post.subtitle} — ${post.excerpt}`
    : post.excerpt;

  return {
    title: post.title,
    description,
    openGraph: {
      title: post.title,
      description,
      type: "article",
      publishedTime: post.date,
      tags: [...post.tags, post.mood],
      ...(post.coverImage ? { images: [{ url: post.coverImage }] } : {}),
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const [post, vault] = await Promise.all([
    getPostBySlug(slug),
    Promise.resolve(getVault()),
  ]);
  if (!post) notFound();

  const [related, adjacent] = await Promise.all([
    getRelatedPosts(post, 4),
    getAdjacentPosts(slug),
  ]);

  const inVault =
    post.inVault || vault.entries.some((e) => e.articleSlug === post.slug);
  const collections = resolveCollections(slug, post.collections);

  return (
    <article className="article-reading">
      <ArticleHero post={post} inVault={inVault} collections={collections} />

      <div className="article-reading-column">
        {post.legacy && <LegacyArchiveBanner post={post} />}

        {post.authorNote && !post.legacy && <AuthorNote note={post.authorNote} />}

        <div
          className={`article-prose prose-article ${post.legacy ? "legacy-prose" : ""}`}
          dangerouslySetInnerHTML={{ __html: post.html }}
        />

        {post.legacy && post.restorationNote && (
          <RestorationNote note={post.restorationNote} />
        )}

        <ArticleFiledUnder post={post} collections={collections} />
        <RelatedArticles posts={related} />
        <ArticlePrevNext prev={adjacent.prev} next={adjacent.next} />
      </div>
    </article>
  );
}
