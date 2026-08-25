import { isCuratorMode } from "@/lib/curator-gate";

/** Production builds omit Workbench routes from Vercel's serverless function budget. */
export function workbenchStaticParams<T extends Record<string, string>>(
  params: T[],
): T[] {
  return isCuratorMode() ? params : [];
}
