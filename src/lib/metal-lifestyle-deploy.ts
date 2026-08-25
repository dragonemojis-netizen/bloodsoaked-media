import { archivesStaticParams } from "@/lib/archives-deploy";

/** Production builds omit Metal Lifestyle routes from Vercel's serverless function budget. */
export function metalLifestyleStaticParams<T extends Record<string, string>>(
  params: T[],
): T[] {
  return archivesStaticParams(params);
}
