import type { MetadataRoute } from "next";
import { getAllPostMeta } from "@/lib/content";
import { getAllMediaLogEntries } from "@/lib/media-log";
import { MOODS, CATEGORIES } from "@/types/content";
import { getAllTags } from "@/lib/content";
import { slugifyTag } from "@/lib/slugs";
import { isLegacyArchivePublic } from "@/lib/legacy-gate";
import { getPublishedCollectionSpecimenIds } from "@/lib/collection-archive";
import { getPublishedAuthoritySlugs } from "@/lib/authority";
import { getPublishedLibrarySlugs } from "@/lib/library";
import { ARCHIVE_SLUGS } from "@/config/archives";
import {
  METAL_LIFESTYLE_BASE,
  metalLifestyleNav,
} from "@/config/metal-lifestyle";
import { site } from "@/config/site";
import {
  hasMetalLifestyleArchive,
  listMetalLifestylePageSlugs,
  listMetalLifestylePostSlugs,
} from "@/lib/metal-lifestyle-archive";
import { getMetalLifestylePosts } from "@/lib/metal-lifestyle";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPostMeta();
  const legacyPublic = isLegacyArchivePublic();
  const mediaLog = getAllMediaLogEntries();
  const tags = getAllTags(posts);
  const collectionSpecimens = getPublishedCollectionSpecimenIds();
  const libraryEntries = getPublishedLibrarySlugs();
  const authoritySlugs = getPublishedAuthoritySlugs();
  const mlArchive = legacyPublic && hasMetalLifestyleArchive();
  const metalLifestylePosts = mlArchive
    ? listMetalLifestylePostSlugs()
    : legacyPublic
      ? (await getMetalLifestylePosts()).map((p) => p.slug)
      : [];
  const metalLifestylePages = mlArchive ? listMetalLifestylePageSlugs() : [];

  const staticRoutes = [
    "",
    "/articles",
    "/media-log",
    "/reviews",
    "/essays",
    "/collection",
    "/library",
    "/library/authorities",
    "/archive",
    "/archive/mood",
    "/timeline",
    ...(legacyPublic
      ? [
          "/the-archives",
          ...ARCHIVE_SLUGS.map((slug) => `/the-archives/${slug}`),
          ...metalLifestyleNav
            .filter((item) => item.hub)
            .map((item) => item.href),
        ]
      : []),
    "/vault",
    "/about",
    "/search",
  ];

  const archiveYears = new Set(
    posts.map((p) => new Date(p.date).getFullYear().toString()),
  );

  return [
    ...staticRoutes.map((route) => ({
      url: `${site.url}${route}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: route === "" ? 1 : 0.8,
    })),
    ...posts.map((post) => ({
      url: `${site.url}/articles/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...mediaLog.map((entry) => ({
      url: `${site.url}/media-log/${entry.slug}`,
      lastModified: entry.date
        ? new Date(entry.date)
        : entry.logYear
          ? new Date(`${entry.logYear}-12-31`)
          : new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
    ...collectionSpecimens.map((id) => ({
      url: `${site.url}/collection/${id}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...libraryEntries.map((slug) => ({
      url: `${site.url}/library/${slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.65,
    })),
    ...authoritySlugs.map((slug) => ({
      url: `${site.url}/library/authorities/${slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.55,
    })),
    ...[...archiveYears].map((year) => ({
      url: `${site.url}/archive/year/${year}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...CATEGORIES.map((cat) => ({
      url: `${site.url}/archive/category/${cat}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...MOODS.map((mood) => ({
      url: `${site.url}/archive/mood/${mood.toLowerCase().replace(/\s+/g, "-")}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.65,
    })),
    ...tags.map((tag) => ({
      url: `${site.url}/archive/tag/${slugifyTag(tag)}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.55,
    })),
    ...metalLifestylePosts.map((slug) => ({
      url: `${site.url}${METAL_LIFESTYLE_BASE}/post/${slug}`,
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.4,
    })),
    ...metalLifestylePages.map((slug) => ({
      url: `${site.url}${METAL_LIFESTYLE_BASE}/page/${slug}`,
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.35,
    })),
  ];
}
