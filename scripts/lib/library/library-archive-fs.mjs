/**
 * Library accession filesystem helpers.
 *
 * Library entries live under content/library/entries/{slug}.json.
 * Independent of Collection FS, but filing services use both.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { ensureDir, readJson, writeJsonAtomic } from "../collection-archive-fs.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.join(__dirname, "..", "..", "..");
export const LIBRARY_DIR = path.join(ROOT, "content", "library");
export const LIBRARY_ENTRIES_DIR = path.join(LIBRARY_DIR, "entries");
export const LIBRARY_INDEX_PATH = path.join(LIBRARY_DIR, "index.json");

export function listLibrarySlugs() {
  if (!fs.existsSync(LIBRARY_ENTRIES_DIR)) return [];
  return fs
    .readdirSync(LIBRARY_ENTRIES_DIR)
    .filter((file) => file.endsWith(".json") && !file.startsWith("_"))
    .map((file) => file.replace(/\.json$/, ""));
}

export function readLibraryEntry(slug) {
  const filePath = path.join(LIBRARY_ENTRIES_DIR, `${slug}.json`);
  if (!fs.existsSync(filePath)) return null;
  return readJson(filePath);
}

export function writeLibraryEntry(record, { dryRun = false } = {}) {
  if (!record?.slug) {
    throw new Error("Library entry requires a slug");
  }
  const filePath = path.join(LIBRARY_ENTRIES_DIR, `${record.slug}.json`);
  writeJsonAtomic(filePath, record, { dryRun });
}

export function libraryEntryExists(slug) {
  return fs.existsSync(path.join(LIBRARY_ENTRIES_DIR, `${slug}.json`));
}

/** Find a Library entry already filed from a given Collection id. */
export function findLibraryByCollectionId(collectionId) {
  for (const slug of listLibrarySlugs()) {
    const record = readLibraryEntry(slug);
    if (!record) continue;
    if (record.accession?.sourceReference === collectionId) return record;
    if (record.connections?.collectionIds?.includes(collectionId)) {
      return record;
    }
  }
  return null;
}

/** Find a Library entry already carrying a Steam App ID. */
export function findLibraryBySteamAppId(appId) {
  const target = Number(appId);
  if (!Number.isFinite(target)) return null;
  for (const slug of listLibrarySlugs()) {
    const record = readLibraryEntry(slug);
    if (record?.steam?.appId === target) return record;
  }
  return null;
}

export { ensureDir, readJson, writeJsonAtomic };
