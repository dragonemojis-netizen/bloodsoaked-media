import { isMetalLifestyleLocal } from "@/lib/metal-lifestyle-gate";

/** Production builds omit Metal Lifestyle routes from Vercel's serverless function budget. */
export function metalLifestyleStaticParams<T extends Record<string, string>>(
  params: T[],
): T[] {
  return isMetalLifestyleLocal() ? params : [];
}
