import type { MetadataRoute } from "next";
import { getAllPostMeta } from "@/lib/content";
import { getAllMediaLogEntries } from "@/lib/media-log";
import { isArchivesLocal } from "@/lib/archives-gate";
import { site } from "@/config/site";

/**
 * Keep the public sitemap small. Listing every Library, authority, and
 * collection URL invited crawlers to generate Edge Requests across hundreds
 * of pages (and their images). Those records stay linked from their hub pages.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPostMeta();
  const mediaLog = getAllMediaLogEntries();

  const latestPost = posts.reduce<Date | null>((latest, post) => {
    const date = new Date(post.date);
    if (!latest || date > latest) return date;
    return latest;
  }, null);

  let archiveStaticRoutes: string[] = [];

  if (isArchivesLocal()) {
    const { ARCHIVE_SLUGS } = await import("@/config/archives");
    const { metalLifestyleNav } = await import("@/config/metal-lifestyle");

    archiveStaticRoutes = [
      ...metalLifestyleNav.filter((item) => item.hub).map((item) => item.href),
      "/the-archives",
      ...ARCHIVE_SLUGS.map((slug) => `/the-archives/${slug}`),
    ];
  }

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
    ...archiveStaticRoutes,
    "/vault",
    "/about",
  ];

  return [
    ...staticRoutes.map((route) => ({
      url: `${site.url}${route}`,
      lastModified: latestPost ?? undefined,
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
          : undefined,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];
}
