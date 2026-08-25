/**
 * Metal Lifestyle recovery archive — local preservation workspace only.
 *
 * The full restored publication is not served on production Vercel until
 * hosting costs are sustainable. Use `npm run dev` locally to browse it.
 */
export function isMetalLifestyleLocal(): boolean {
  if (process.env.NEXT_PUBLIC_METAL_LIFESTYLE_LOCAL === "true") return true;
  if (process.env.NODE_ENV === "development") return true;
  return false;
}
