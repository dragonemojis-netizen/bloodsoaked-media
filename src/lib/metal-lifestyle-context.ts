import {
  COLLECTION_HIGHLIGHTS,
  SPECIAL_COLLECTIONS,
  type CollectionHighlight,
  type SpecialCollectionDef,
} from "@/config/metal-lifestyle-context";
import {
  getMetalLifestyleManifest,
  getMetalLifestylePage,
  type MetalLifestyleManifestEntry,
} from "@/lib/metal-lifestyle-archive";
import { detectMetalLifestyleSeries } from "@/lib/metal-lifestyle-discovery";

export function getHighlightPosts(
  highlight: CollectionHighlight,
): MetalLifestyleManifestEntry[] {
  const manifest = getMetalLifestyleManifest();
  if (!manifest) return [];

  const seriesSlugs = highlight.match.seriesSlug
    ? new Set(
        detectMetalLifestyleSeries().find(
          (s) => s.slug === highlight.match.seriesSlug,
        )?.articleSlugs ?? [],
      )
    : null;

  return manifest.posts
    .filter((p) => p.status !== "unavailable")
    .filter((p) => {
      if (seriesSlugs?.has(p.slug)) return true;
      if (
        highlight.match.categories?.some((c) => p.category === c)
      ) {
        return true;
      }
      if (
        highlight.match.titleIncludes?.some((needle) =>
          p.title.toLowerCase().includes(needle.toLowerCase()),
        )
      ) {
        return true;
      }
      return false;
    })
    .sort((a, b) =>
      (b.publicationDate || "").localeCompare(a.publicationDate || ""),
    );
}

export function getHighlightBySlug(slug: string) {
  return COLLECTION_HIGHLIGHTS.find((h) => h.slug === slug) ?? null;
}

export interface SpecialCollectionView {
  def: SpecialCollectionDef;
  hubStatus: string | null;
  pages: MetalLifestyleManifestEntry[];
  blogPosts: MetalLifestyleManifestEntry[];
  pageCount: number;
  blogCount: number;
  contributors: string[];
  span: string | null;
}

export function getSpecialCollection(
  slug: string,
): SpecialCollectionView | null {
  const def = SPECIAL_COLLECTIONS.find((c) => c.slug === slug);
  if (!def) return null;
  const manifest = getMetalLifestyleManifest();
  if (!manifest) return null;

  const pages = (manifest.pages ?? []).filter(
    (p) =>
      p.slug === def.pagePrefix ||
      p.slug.startsWith(`${def.pagePrefix}--`),
  );

  const blogPosts = (manifest.posts ?? []).filter((p) => {
    if (p.status === "unavailable") return false;
    if (!def.blogTitleIncludes?.length) return false;
    return def.blogTitleIncludes.some((needle) =>
      p.title.toLowerCase().includes(needle.toLowerCase()),
    );
  });

  const dates = blogPosts
    .map((p) => p.publicationDate)
    .filter((d): d is string => Boolean(d))
    .sort();
  const span =
    dates.length === 0
      ? null
      : dates[0].slice(0, 4) === dates[dates.length - 1].slice(0, 4)
        ? dates[0].slice(0, 4)
        : `${dates[0].slice(0, 4)}–${dates[dates.length - 1].slice(0, 4)}`;

  const contributors = [
    ...new Set(
      blogPosts.map((p) => p.author).filter((a): a is string => Boolean(a)),
    ),
  ].sort();

  const hub = getMetalLifestylePage(def.hubPageSlug);

  return {
    def,
    hubStatus: hub?.status ?? null,
    pages: pages.sort((a, b) => a.title.localeCompare(b.title)),
    blogPosts: blogPosts.sort((a, b) =>
      (b.publicationDate || "").localeCompare(a.publicationDate || ""),
    ),
    pageCount: pages.filter((p) => p.status !== "unavailable").length,
    blogCount: blogPosts.length,
    contributors,
    span,
  };
}

export function listSpecialCollections(): SpecialCollectionView[] {
  return SPECIAL_COLLECTIONS.map((c) => getSpecialCollection(c.slug)).filter(
    (c): c is SpecialCollectionView => Boolean(c),
  );
}
