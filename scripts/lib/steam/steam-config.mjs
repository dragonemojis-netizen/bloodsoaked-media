/**
 * Steam acquisition source — configuration.
 *
 * Steam is treated as a public, read-only metadata source. Credentials and
 * account identity are supplied entirely through the environment so the
 * pipeline stays independent of both the archive layer and the UI.
 */

const DEFAULT_STORE_BASE = "https://store.steampowered.com";
const DEFAULT_API_BASE = "https://api.steampowered.com";

export function loadSteamConfig(env = process.env) {
  const apiKey = env.STEAM_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      "STEAM_API_KEY is required. Run `npm run steam:setup` after configuring .env.local.",
    );
  }

  const steamId = env.STEAM_ID?.trim() || null;
  const vanity = env.STEAM_VANITY?.trim() || null;

  if (!steamId && !vanity) {
    throw new Error(
      "Set STEAM_ID (64-bit SteamID) or STEAM_VANITY (custom URL name) in .env.local.",
    );
  }

  return {
    apiKey,
    steamId,
    vanity,
    apiBase: env.STEAM_API_BASE_URL?.trim() || DEFAULT_API_BASE,
    storeBase: env.STEAM_STORE_BASE_URL?.trim() || DEFAULT_STORE_BASE,
    /** Storefront language + country for appdetails metadata. */
    country: env.STEAM_STORE_COUNTRY?.trim() || "us",
    language: env.STEAM_STORE_LANGUAGE?.trim() || "english",
    /** Delay between requests to respect Steam rate limits. */
    requestDelayMs: Number(env.STEAM_SYNC_REQUEST_DELAY_MS || "350"),
    /**
     * Store metadata (appdetails) is refreshed for a title only when it is
     * new or older than this many days. Ownership/playtime always refresh.
     */
    metadataMaxAgeDays: Number(env.STEAM_METADATA_MAX_AGE_DAYS || "30"),
    /** Cap on store-metadata lookups per run to stay within rate limits. */
    detailsPerRun: Number(env.STEAM_DETAILS_PER_RUN || "80"),
    includeFreeGames: env.STEAM_INCLUDE_FREE_GAMES !== "false",
  };
}

export function storeAppUrl(config, appId) {
  return `${config.storeBase}/app/${appId}/`;
}
