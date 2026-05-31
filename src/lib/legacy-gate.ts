/**
 * Legacy / recovered archive visibility.
 *
 * Set NEXT_PUBLIC_LEGACY_ARCHIVE_PUBLIC=true when Metal Lifestyle recovery
 * is reviewed and ready for the live site. Until then, production builds
 * omit legacy articles, The Archives, and related collections from public output.
 */
export function isLegacyArchivePublic(): boolean {
  return process.env.NEXT_PUBLIC_LEGACY_ARCHIVE_PUBLIC === "true";
}

/** Museum collections tied to recovered historical writing only. */
export const LEGACY_ONLY_COLLECTION_SLUGS = [
  "the-archives",
  "metal-lifestyle-era",
] as const;

export function isLegacyOnlyCollection(slug: string): boolean {
  return (LEGACY_ONLY_COLLECTION_SLUGS as readonly string[]).includes(slug);
}
