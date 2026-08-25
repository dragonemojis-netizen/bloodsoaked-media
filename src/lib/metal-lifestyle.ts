import { getLegacyPosts } from "@/lib/content";
import type { PostMeta } from "@/types/content";
import { METAL_LIFESTYLE_ORIGIN } from "@/config/metal-lifestyle";

export { formatMetalLifestyleDate } from "@/lib/metal-lifestyle-format";

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
