import type { MetadataRoute } from "next";
import { site } from "@/config/site";

/**
 * Workbench and Archives are never for crawlers. Search is dynamic and
 * must not be advertised. A small sitemap is the other half of this:
 * we do not invite recrawls of every Library/collection URL.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/workbench/",
        "/workbench",
        "/the-archives/",
        "/the-archives",
        "/search",
        "/search/",
      ],
    },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
