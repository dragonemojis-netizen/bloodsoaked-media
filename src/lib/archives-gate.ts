/**
 * The Archives — local preservation workspace only.
 *
 * Hub routes, Metal Lifestyle, and every nested archive feature are available
 * in local development. Production behaves as though the section was never
 * shipped unless NEXT_PUBLIC_ARCHIVES_LOCAL=true on an explicit staging host.
 */
export function isArchivesLocal(): boolean {
  if (process.env.NEXT_PUBLIC_ARCHIVES_LOCAL === "true") return true;
  if (process.env.NODE_ENV === "development") return true;
  return false;
}

/** True for /the-archives and every nested Archives path. */
export function isArchivesPath(pathname: string): boolean {
  return pathname === "/the-archives" || pathname.startsWith("/the-archives/");
}
