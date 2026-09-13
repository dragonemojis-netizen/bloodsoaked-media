/** Client-safe — do not import Node modules here. */
export function isRemoteCoverUrl(src: string): boolean {
  return /^https?:\/\//i.test(src);
}
