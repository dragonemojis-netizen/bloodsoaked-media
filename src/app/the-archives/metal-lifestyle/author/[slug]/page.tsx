import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MetalLifestylePaginatedArchive } from "@/components/archives/metal-lifestyle/MetalLifestylePaginatedArchive";
import { MetalLifestyleShell } from "@/components/archives/metal-lifestyle/MetalLifestyleShell";
import { METAL_LIFESTYLE_BASE } from "@/config/metal-lifestyle";
import {
  getMetalLifestyleAuthor,
  getMetalLifestyleAuthors,
  resolveManifestPosts,
} from "@/lib/metal-lifestyle-archive";
import { metalLifestyleStaticParams } from "@/lib/metal-lifestyle-deploy";
import { expandMetalLifestyleAuthor } from "@/lib/metal-lifestyle-discovery";
import { formatMetalLifestyleDate } from "@/lib/metal-lifestyle";
import { slugifyMetalLifestyleCategory } from "@/lib/metal-lifestyle-archive";

export const dynamicParams = false;

export function generateStaticParams() {
  return metalLifestyleStaticParams(
    getMetalLifestyleAuthors().map((author) => ({ slug: author.slug })),
  );
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const author = getMetalLifestyleAuthor(slug);
  return { title: author ? author.name : "Author" };
}

export default async function MetalLifestyleAuthorPage({ params }: Props) {
  const { slug } = await params;
  const author = getMetalLifestyleAuthor(slug);
  if (!author) notFound();

  const expanded = expandMetalLifestyleAuthor(author);
  const posts = resolveManifestPosts(author.articleSlugs);

  return (
    <MetalLifestyleShell activeHref={`${METAL_LIFESTYLE_BASE}/author/${slug}`}>
      <header className="ml-tax-header">
        <p className="ml-tax-eyebrow">Author</p>
        <h1 className="ml-tax-title">{author.name}</h1>
        {author.biography ? (
          <p className="ml-tax-bio">{author.biography}</p>
        ) : (
          <p className="ml-tax-bio">
            Byline preserved exactly as published. No biography was recovered
            for this contributor.
          </p>
        )}
        <dl className="ml-author-meta">
          <div>
            <dt>Publications</dt>
            <dd>{posts.length}</dd>
          </div>
          <div>
            <dt>First publication</dt>
            <dd>
              {expanded.firstPublication
                ? formatMetalLifestyleDate(expanded.firstPublication)
                : "—"}
            </dd>
          </div>
          <div>
            <dt>Last publication</dt>
            <dd>
              {expanded.lastPublication
                ? formatMetalLifestyleDate(expanded.lastPublication)
                : "—"}
            </dd>
          </div>
          <div>
            <dt>Categories contributed</dt>
            <dd>
              {expanded.categories.length
                ? expanded.categories.map((category, index) => (
                    <span key={category}>
                      {index > 0 ? ", " : ""}
                      <Link
                        href={`${METAL_LIFESTYLE_BASE}/category/${slugifyMetalLifestyleCategory(category)}`}
                      >
                        {category}
                      </Link>
                    </span>
                  ))
                : "—"}
            </dd>
          </div>
        </dl>
        <p>
          <Link href={METAL_LIFESTYLE_BASE}>← Catalog</Link>
        </p>
      </header>

      <h2 className="ml-bib-heading">Chronological bibliography</h2>
      <MetalLifestylePaginatedArchive
        posts={posts}
        basePath={`${METAL_LIFESTYLE_BASE}/author/${slug}`}
      />
    </MetalLifestyleShell>
  );
}
