import { getLegacyPosts } from "@/lib/content";
import type { PostMeta } from "@/types/content";
import { METAL_LIFESTYLE_ORIGIN } from "@/config/metal-lifestyle";

const PUBLICATION = "Metal Lifestyle";

export async function getMetalLifestylePosts(): Promise<PostMeta[]> {
  const legacy = await getLegacyPosts();
  return legacy.filter(
    (post) =>
      post.originalPublication === PUBLICATION ||
      post.originalSite === PUBLICATION ||
      post.slug.startsWith("metal-lifestyle-"),
  );
}

/** Weebly-style date: M/D/YYYY */
export function formatMetalLifestyleDate(isoDate: string): string {
  const d = new Date(isoDate.includes("T") ? isoDate : `${isoDate}T12:00:00`);
  if (Number.isNaN(d.getTime())) return isoDate;
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
}

/** Point relative Weebly upload paths at the original host so images still resolve. */
export function rewriteWeeblyMediaUrls(html: string): string {
  return html
    .replace(
      /src="(\/uploads\/[^"]+)"/g,
      `src="${METAL_LIFESTYLE_ORIGIN}$1"`,
    )
    .replace(
      /href="(\/uploads\/[^"]+)"/g,
      `href="${METAL_LIFESTYLE_ORIGIN}$1"`,
    );
}
