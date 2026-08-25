import { isArchivesLocal } from "@/lib/archives-gate";

/** Production builds omit Archives routes from Vercel's serverless function budget. */
export function archivesStaticParams<T extends Record<string, string>>(
  params: T[],
): T[] {
  return isArchivesLocal() ? params : [];
}
