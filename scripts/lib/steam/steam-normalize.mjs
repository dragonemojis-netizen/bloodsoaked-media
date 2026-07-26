/**
 * Steam acquisition source — normalization.
 *
 * Pure functions that shape raw Steam payloads into the archive's dedicated
 * `steam` metadata block. No IO, no filesystem, no knowledge of merge policy.
 *
 *   Steam API  →  [ normalize ]  →  steam metadata block  →  import service
 */

import { storeAppUrl } from "./steam-config.mjs";

const STEAM_CDN = "https://cdn.cloudflare.steamstatic.com/steam/apps";

export function steamRecordId(appId) {
  return `steam-${appId}`;
}

/** Deterministic Steam CDN artwork URLs derived from the app id. */
export function steamCdnArtwork(appId) {
  return {
    header: `${STEAM_CDN}/${appId}/header.jpg`,
    capsule: `${STEAM_CDN}/${appId}/library_600x900.jpg`,
    hero: `${STEAM_CDN}/${appId}/library_hero.jpg`,
  };
}

function minutes(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/** Steam reports last-played as a unix timestamp (rtime_last_played). */
function toIsoFromUnix(seconds) {
  const n = Number(seconds);
  if (!Number.isFinite(n) || n <= 0) return null;
  return new Date(n * 1000).toISOString();
}

/**
 * Steam release_date.date is a localized free-text string (e.g. "12 Aug, 2013").
 * Keep the raw string always; resolve to ISO only when unambiguous.
 */
function normalizeReleaseDate(releaseDate) {
  const raw = releaseDate?.date?.trim() || null;
  const comingSoon = Boolean(releaseDate?.coming_soon);
  let iso = null;
  if (raw) {
    const parsed = Date.parse(raw);
    if (!Number.isNaN(parsed)) {
      iso = new Date(parsed).toISOString().slice(0, 10);
    }
  }
  return { iso, raw, comingSoon };
}

function descriptions(list) {
  if (!Array.isArray(list)) return [];
  return list
    .map((item) => item?.description)
    .filter((d) => typeof d === "string" && d.trim().length > 0);
}

/**
 * Builds the ownership + playtime portion of the steam block from a
 * GetOwnedGames entry. Always available; refreshed on every sync.
 */
export function normalizeOwnership(ownedGame, config, now) {
  const appId = Number(ownedGame.appid);
  return {
    appId,
    title: ownedGame.name?.trim() || `Steam App ${appId}`,
    owned: true,
    playtimeMinutes: minutes(ownedGame.playtime_forever),
    playtime2Weeks: ownedGame.playtime_2weeks != null
      ? minutes(ownedGame.playtime_2weeks)
      : null,
    playtimeWindowsMinutes: minutes(ownedGame.playtime_windows_forever),
    playtimeMacMinutes: minutes(ownedGame.playtime_mac_forever),
    playtimeLinuxMinutes: minutes(ownedGame.playtime_linux_forever),
    lastPlayedAt: toIsoFromUnix(ownedGame.rtime_last_played),
    storeUrl: storeAppUrl(config, appId),
    lastSynced: now,
    source: "steam-web-api",
  };
}

/**
 * Builds the descriptive portion of the steam block from appdetails.
 * Returns a partial that is merged over the ownership portion.
 */
export function normalizeAppDetails(appDetails, appId, now) {
  if (!appDetails) return { metadataSyncedAt: now };

  const release = normalizeReleaseDate(appDetails.release_date);
  const platforms = appDetails.platforms ?? {};
  const cdn = steamCdnArtwork(appId);

  return {
    title: appDetails.name?.trim() || undefined,
    developers: Array.isArray(appDetails.developers)
      ? appDetails.developers.filter(Boolean)
      : [],
    publishers: Array.isArray(appDetails.publishers)
      ? appDetails.publishers.filter(Boolean)
      : [],
    releaseDate: release.iso ?? release.raw,
    releaseDateRaw: release.raw,
    comingSoon: release.comingSoon,
    genres: descriptions(appDetails.genres),
    categories: descriptions(appDetails.categories),
    platforms: {
      windows: Boolean(platforms.windows),
      mac: Boolean(platforms.mac),
      linux: Boolean(platforms.linux),
    },
    shortDescription: appDetails.short_description?.trim() || undefined,
    /** Remote source URLs; the import layer resolves local copies. */
    remoteArtwork: {
      headerCapsule: appDetails.header_image?.trim() || cdn.header,
      capsule: cdn.capsule,
      hero: cdn.hero,
    },
    metadataSyncedAt: now,
  };
}

/** True when store metadata is missing or older than the configured window. */
export function isMetadataStale(steam, config, now = Date.now()) {
  if (!steam?.metadataSyncedAt) return true;
  const synced = Date.parse(steam.metadataSyncedAt);
  if (Number.isNaN(synced)) return true;
  const ageDays = (now - synced) / (1000 * 60 * 60 * 24);
  return ageDays >= config.metadataMaxAgeDays;
}
