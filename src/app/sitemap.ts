import type { MetadataRoute } from "next";
import { getAllPostMeta } from "@/lib/content";
import { getAllMediaLogEntries } from "@/lib/media-log";
import { MOODS, CATEGORIES } from "@/types/content";
import { getAllTags } from "@/lib/content";
import { slugifyTag } from "@/lib/slugs";
import { isLegacyArchivePublic } from "@/lib/legacy-gate";
import { site } from "@/config/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPostMeta();
  const legacyPublic = isLegacyArchivePublic();
  const mediaLog = getAllMediaLogEntries();
  const tags = getAllTags(posts);

  const staticRoutes = [
    "",
    "/articles",
    "/media-log",
    "/reviews",
    "/essays",
    "/collection",
    "/archive",
    "/archive/mood",
    "/timeline",
    ...(legacyPublic ? ["/the-archives"] : []),
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
  ];
}
