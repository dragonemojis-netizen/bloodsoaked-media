/**
 * Steam acquisition source — filesystem layer.
 *
 * Keeps Steam's own sync bookkeeping in a dedicated directory so the Steam
 * layer stays independent of the editorial Collection. Records themselves are
 * written through the shared Collection FS so a Steam import is a first-class
 * Collection record, not a parallel content store.
 */

import path from "path";
import {
  COLLECTION_DIR,
  ROOT,
  ensureDir,
  readJson,
  writeJsonAtomic,
} from "../collection-archive-fs.mjs";

export const STEAM_DIR = path.join(COLLECTION_DIR, "steam");
export const STEAM_STATE_PATH = path.join(STEAM_DIR, "sync-state.json");
export const STEAM_OWNED_INDEX_PATH = path.join(STEAM_DIR, "owned-index.json");
export const STEAM_REPORT_DIR = path.join(STEAM_DIR, "reports");
export const STEAM_IMAGE_DIR = path.join(
  ROOT,
  "public",
  "images",
  "collection",
  "steam",
);

export function steamImageDir(appId) {
  return path.join(STEAM_IMAGE_DIR, String(appId));
}

export function steamPublicImagePath(appId, name) {
  return `/images/collection/steam/${appId}/${name}`;
}

const OWNED_INDEX_DEFAULT = { version: 1, byAppId: {}, updatedAt: null };

export function loadOwnedIndex() {
  const index = readJson(STEAM_OWNED_INDEX_PATH, { ...OWNED_INDEX_DEFAULT });
  if (!index.byAppId) index.byAppId = {};
  return index;
}

export function saveOwnedIndex(index, { dryRun = false } = {}) {
  writeJsonAtomic(
    STEAM_OWNED_INDEX_PATH,
    { ...index, version: 1, updatedAt: new Date().toISOString() },
    { dryRun },
  );
}

const STATE_DEFAULT = {
  schemaVersion: 1,
  lastSyncedAt: null,
  lastSyncStatus: "idle",
};

export function readSteamState() {
  return readJson(STEAM_STATE_PATH, { ...STATE_DEFAULT });
}

export function writeSteamState(patch, { dryRun = false } = {}) {
  const current = readSteamState();
  writeJsonAtomic(
    STEAM_STATE_PATH,
    { ...STATE_DEFAULT, ...current, ...patch, schemaVersion: 1 },
    { dryRun },
  );
}

export function ensureSteamDirs() {
  ensureDir(STEAM_DIR);
  ensureDir(STEAM_REPORT_DIR);
}
