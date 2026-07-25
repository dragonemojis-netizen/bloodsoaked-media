const SPOTIFY_EMBED_TYPES = new Set([
  "playlist",
  "album",
  "track",
  "artist",
  "show",
  "episode",
]);

/**
 * Convert a Spotify share URL or URI into an official embed URL.
 * Accepts formats like:
 *   https://open.spotify.com/playlist/{id}?si=...
 *   spotify:playlist:{id}
 * Returns null when the input is not a recognized Spotify link.
 */
export function toSpotifyEmbedUrl(input: string | undefined): string | null {
  if (typeof input !== "string" || input.length === 0) return null;

  const value = input.trim();

  // spotify:playlist:{id}
  const uriMatch = value.match(/^spotify:([a-z]+):([A-Za-z0-9]+)$/);
  if (uriMatch) {
    const [, type, id] = uriMatch;
    if (SPOTIFY_EMBED_TYPES.has(type)) {
      return `https://open.spotify.com/embed/${type}/${id}`;
    }
    return null;
  }

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }

  if (url.hostname !== "open.spotify.com") return null;

  const segments = url.pathname.split("/").filter(Boolean);
  // Locale-prefixed links look like /intl-de/playlist/{id}
  const typeIndex = segments.findIndex((s) => SPOTIFY_EMBED_TYPES.has(s));
  if (typeIndex === -1) return null;

  const type = segments[typeIndex];
  const id = segments[typeIndex + 1];
  if (!id || !/^[A-Za-z0-9]+$/.test(id)) return null;

  return `https://open.spotify.com/embed/${type}/${id}`;
}
