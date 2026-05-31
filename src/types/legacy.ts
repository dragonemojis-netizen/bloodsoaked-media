/** Metadata for preserved writing from earlier publication eras */
export interface LegacyArchiveMeta {
  legacy: true;
  originalPublication: string;
  originalPublicationDate: string;
  originalSite?: string;
  originalUrl?: string;
  archiveEra?: string;
  author?: string;
  archiveDate: string;
  restorationNote?: string;
}

export function isLegacyPost(
  post: { legacy?: boolean },
): post is { legacy: true } & LegacyArchiveMeta {
  return post.legacy === true;
}
