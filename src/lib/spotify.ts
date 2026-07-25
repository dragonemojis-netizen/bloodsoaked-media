const SPOTIFY_EMBED_TYPES = new Set([
  "playlist",
  "album",
  "track",
  "artist",
  "show",
  "episode",
]);

const SPOTIFY_ID_PATTERN = /^[A-Za-z0-9]+$/;

/**
 * Extract a Spotify resource ID from a share URL, URI, or bare ID.
 * Returns null when the input cannot be resolved.
 */
export function extractSpotifyId(
  input: string | undefined,
  expectedType = "playlist",
): string | null {
  if (typeof input !== "string" || input.length === 0) return null;

  const value = input.trim();

  if (SPOTIFY_ID_PATTERN.test(value)) return value;

  const uriMatch = value.match(/^spotify:([a-z]+):([A-Za-z0-9]+)$/);
  if (uriMatch) {
    const [, type, id] = uriMatch;
    return type === expectedType ? id : null;
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
  if (type !== expectedType || !id || !SPOTIFY_ID_PATTERN.test(id)) {
    return null;
  }

  return id;
}

/**
 * Build an official Spotify embed URL from a playlist ID, share URL, or URI.
 */
export function toSpotifyEmbedUrl(input: string | undefined): string | null {
  const id = extractSpotifyId(input, "playlist");
  if (!id) return null;
  return `https://open.spotify.com/embed/playlist/${id}`;
}

export function toSpotifyPlaylistUrl(spotifyId: string): string {
  return `https://open.spotify.com/playlist/${spotifyId}`;
}
