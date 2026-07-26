/**
 * Curator Mode — boundary between the Public Archive and the Curator’s Workshop.
 *
 * The Workbench is an internal editorial environment. It must never appear on
 * the public Bloodsoaked website.
 *
 * Available when:
 *   - local development (`npm run dev` → NODE_ENV=development), or
 *   - NEXT_PUBLIC_CURATOR_MODE=true (explicit curator / staging environments)
 *
 * When absent or false in production, /workbench behaves as though it was
 * never shipped.
 */

export function isCuratorMode(): boolean {
  if (process.env.NEXT_PUBLIC_CURATOR_MODE === "true") return true;
  if (process.env.NODE_ENV === "development") return true;
  return false;
}

/** True for /workbench and every nested Workbench path. */
export function isWorkbenchPath(pathname: string): boolean {
  return pathname === "/workbench" || pathname.startsWith("/workbench/");
}
