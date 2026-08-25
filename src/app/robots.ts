import type { MetadataRoute } from "next";
import { site } from "@/config/site";

/**
 * Workbench is never for crawlers — even when Curator Mode is enabled on a
 * staging host. Sitemap generation never emits Workbench URLs.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/workbench/", "/workbench", "/the-archives/", "/the-archives"],
    },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
