/**
 * Steam acquisition source — API client.
 *
 * Thin transport layer over the Steam Web API and public storefront. Returns
 * raw payloads only; shaping happens in the normalization layer. No knowledge
 * of the archive schema lives here.
 */

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getJson(url, { label }) {
  const res = await fetch(url, {
    headers: { "user-agent": "bloodsoaked-media-archive/1.0 (+steam-sync)" },
  });

  if (!res.ok) {
    const err = new Error(`${label} failed (${res.status})`);
    err.status = res.status;
    throw err;
  }

  return res.json().catch(() => {
    throw new Error(`${label} returned a non-JSON response`);
  });
}

function apiUrl(config, iface, method, version, params = {}) {
  const url = new URL(`${config.apiBase}/${iface}/${method}/${version}/`);
  url.searchParams.set("key", config.apiKey);
  for (const [key, value] of Object.entries(params)) {
    if (value != null) url.searchParams.set(key, String(value));
  }
  return url;
}

/** Resolves a vanity (custom URL) name to a 64-bit SteamID. */
export async function resolveVanityUrl(config, vanity) {
  const url = apiUrl(config, "ISteamUser", "ResolveVanityURL", "v1", {
    vanityurl: vanity,
  });
  const body = await getJson(url, { label: "ResolveVanityURL" });
  const response = body?.response;
  if (response?.success !== 1 || !response?.steamid) {
    throw new Error(
      `Could not resolve STEAM_VANITY "${vanity}" — check the custom URL name.`,
    );
  }
  return String(response.steamid);
}

/** Resolves the effective 64-bit SteamID from config (STEAM_ID or vanity). */
export async function resolveSteamId(config) {
  if (config.steamId) return config.steamId;
  return resolveVanityUrl(config, config.vanity);
}

/** Public profile summary — used for setup diagnostics and identity. */
export async function fetchPlayerSummary(config, steamId) {
  const url = apiUrl(config, "ISteamUser", "GetPlayerSummaries", "v2", {
    steamids: steamId,
  });
  const body = await getJson(url, { label: "GetPlayerSummaries" });
  const player = body?.response?.players?.[0];
  if (!player) return null;
  return {
    steamId: String(player.steamid),
    personaName: player.personaname ?? null,
    profileUrl: player.profileurl ?? null,
    // communityvisibilitystate: 3 = public
    visibility: player.communityvisibilitystate ?? null,
    isPublic: player.communityvisibilitystate === 3,
  };
}

/**
 * Owned games with app info and playtime.
 * Requires the profile's game details to be public.
 */
export async function fetchOwnedGames(config, steamId) {
  const url = apiUrl(config, "IPlayerService", "GetOwnedGames", "v1", {
    steamid: steamId,
    include_appinfo: 1,
    include_played_free_games: config.includeFreeGames ? 1 : 0,
    format: "json",
  });

  const body = await getJson(url, { label: "GetOwnedGames" });
  const response = body?.response;

  if (!response || response.games == null) {
    throw new Error(
      "GetOwnedGames returned no game list. Ensure the Steam profile and game details are public.",
    );
  }

  return Array.isArray(response.games) ? response.games : [];
}

/**
 * Storefront metadata for a single app. Returns null on lookup failure or
 * region restriction so a single missing title never fails a sync run.
 */
export async function fetchAppDetails(config, appId) {
  const url = new URL(`${config.storeBase}/api/appdetails`);
  url.searchParams.set("appids", String(appId));
  url.searchParams.set("cc", config.country);
  url.searchParams.set("l", config.language);

  let body;
  try {
    body = await getJson(url, { label: `appdetails ${appId}` });
  } catch {
    return null;
  }

  const entry = body?.[String(appId)];
  if (!entry?.success || !entry.data) return null;
  return entry.data;
}

export async function throttle(config) {
  if (config.requestDelayMs > 0) await delay(config.requestDelayMs);
}
