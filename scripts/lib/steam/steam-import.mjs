/**
 * Steam acquisition source — import / merge service.
 *
 * The boundary between imported Steam metadata and Bloodsoaked's editorial
 * authority. This layer owns the single rule that protects the archive:
 *
 *   Steam synchronization writes ONLY the `steam` block (and sync provenance).
 *   Editorial content is preserved verbatim and never generated.
 *
 * Newly detected games enter the Collection automatically as owned works, but
 * are filed as Pipeline / hidden — imported, not curated — and remain eligible
 * to be promoted to a full Library Archive Entry later without data migration.
 */

import { steamRecordId } from "./steam-normalize.mjs";

/**
 * Editorial fields Steam must never author or overwrite. Any field not listed
 * here is either sync-owned (`steam`, `source`) or structural (`id`, `origin`).
 */
export const EDITORIAL_FIELDS = Object.freeze([
  "notes",
  "enrichment",
  "connections",
  "mediaLog",
  "preservation",
  "curatorNotes",
  "collectionNotes",
  "coverImage",
  "featured",
  "eventType",
  "status",
  "visibility",
  "filing",
]);

/**
 * Builds the Collection record for a Steam title.
 *
 * On first import: creates a hidden Pipeline owned-work record.
 * On resync: preserves every existing editorial field untouched and replaces
 * only the `steam` block and sync provenance timestamps.
 */
export function mergeSteamRecord({ existing, steam, now }) {
  const id = steamRecordId(steam.appId);
  const isNew = !existing;

  const source = {
    ...(existing?.source ?? {}),
    platform: "steam",
    steamAppId: steam.appId,
    lastSyncedAt: now,
  };

  if (isNew) {
    return {
      record: {
        id,
        origin: "steam",
        // Filing name frozen at first import; editorial may rename later.
        title: steam.title,
        // Owned but not yet curated into an exhibit.
        eventType: "acquisition",
        status: "Pipeline",
        catalogued: now,
        // Imported works stay out of public display until a curator files them.
        visibility: "hidden",
        source,
        steam,
      },
      isNew: true,
    };
  }

  // Resync: clone existing, overwrite ONLY sync-owned regions.
  const record = { ...existing };
  record.id = existing.id;
  record.origin = existing.origin ?? "steam";
  record.source = source;
  record.steam = steam;

  return { record, isNew: false };
}

/**
 * Carries forward previously preserved artwork when a resync skips image
 * downloads, so the steam block never loses local art it already had.
 */
export function withPreservedArtwork(steam, existingSteam) {
  if (!existingSteam?.artwork) return steam;
  return {
    ...steam,
    artwork: { ...existingSteam.artwork, ...(steam.artwork ?? {}) },
  };
}

/** Confirms a merged record left editorial content byte-identical. */
export function assertEditorialUntouched(existing, next) {
  if (!existing) return;
  for (const field of EDITORIAL_FIELDS) {
    const before = JSON.stringify(existing[field] ?? null);
    const after = JSON.stringify(next[field] ?? null);
    if (before !== after) {
      throw new Error(
        `Steam sync attempted to modify editorial field "${field}" on ${existing.id}`,
      );
    }
  }
}
