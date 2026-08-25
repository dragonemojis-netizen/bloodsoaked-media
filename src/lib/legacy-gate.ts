/**
 * Legacy / recovered writing visibility on the main publication site.
 *
 * Set NEXT_PUBLIC_LEGACY_ARCHIVE_PUBLIC=true when recovered historical articles
 * at /articles/* are reviewed and ready for the live site. This does not control
 * /the-archives routes — those follow isArchivesLocal() (local dev only).
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
