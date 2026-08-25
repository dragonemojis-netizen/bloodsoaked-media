import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MetalLifestyleArchiveTeaser } from "@/components/archives/metal-lifestyle/MetalLifestyleArchiveTeaser";
import { MetalLifestyleContextHeader } from "@/components/archives/metal-lifestyle/MetalLifestyleContextHeader";
import { MetalLifestyleShell } from "@/components/archives/metal-lifestyle/MetalLifestyleShell";
import {
  ML_CONTEXT_BASE,
  SPECIAL_COLLECTIONS,
} from "@/config/metal-lifestyle-context";
import { METAL_LIFESTYLE_BASE } from "@/config/metal-lifestyle";
import { getSpecialCollection } from "@/lib/metal-lifestyle-context";
import { metalLifestyleStaticParams } from "@/lib/metal-lifestyle-deploy";

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return metalLifestyleStaticParams(
    SPECIAL_COLLECTIONS.map((collection) => ({ slug: collection.slug })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const collection = getSpecialCollection(slug);
  return { title: collection ? collection.def.title : "Special Collection" };
}

export default async function MetalLifestyleSpecialCollectionPage({
  params,
}: Props) {
  const { slug } = await params;
  const collection = getSpecialCollection(slug);
  if (!collection) notFound();

  const { def, pages, blogPosts, pageCount, blogCount, contributors, span } =
    collection;

  return (
    <MetalLifestyleShell
      activeHref={`${ML_CONTEXT_BASE}/collections/${slug}`}
    >
      <MetalLifestyleContextHeader title={def.title}>
        <p className="ml-tax-bio">{def.description}</p>
        <dl className="ml-author-meta">
          <div>
            <dt>Preserved pages</dt>
            <dd>{pageCount}</dd>
          </div>
          <div>
            <dt>Related blog pieces</dt>
            <dd>{blogCount}</dd>
          </div>
          <div>
            <dt>Publication span</dt>
            <dd>{span ?? "Undated section pages / see individual records"}</dd>
          </div>
          <div>
            <dt>Contributors (blog bylines)</dt>
            <dd>
              {contributors.length ? contributors.join(", ") : "—"}
            </dd>
          </div>
        </dl>
        <p>
          <Link href={`${METAL_LIFESTYLE_BASE}/page/${def.hubPageSlug}`}>
            Open original section hub →
          </Link>
          {" · "}
          <Link href={`${ML_CONTEXT_BASE}/collections`}>
            ← All special collections
          </Link>
        </p>
      </MetalLifestyleContextHeader>

      <h2 className="ml-bib-heading">Preserved pages in this collection</h2>
      <ul className="ml-collection-pages">
        {pages.map((page) => (
          <li key={page.slug}>
            {page.status === "unavailable" ? (
              <span>
                {page.title}{" "}
                <em className="ml-catalog-muted">(unavailable)</em>
              </span>
            ) : (
              <Link href={`${METAL_LIFESTYLE_BASE}/page/${page.slug}`}>
                {page.title}
              </Link>
            )}
          </li>
        ))}
      </ul>

      {blogPosts.length > 0 && (
        <>
          <h2 className="ml-bib-heading">Related blog pieces</h2>
          {blogPosts.map((post) => (
            <MetalLifestyleArchiveTeaser key={post.slug} post={post} />
          ))}
        </>
      )}
    </MetalLifestyleShell>
  );
}
