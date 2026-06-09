import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.join(__dirname, "..", "..");
export const COLLECTION_DIR = path.join(ROOT, "content", "collection");
export const ENTRIES_DIR = path.join(COLLECTION_DIR, "entries");
export const ARCHIVE_PATH = path.join(COLLECTION_DIR, "archive.json");
export const SYNC_STATE_PATH = path.join(COLLECTION_DIR, "sync-state.json");
export const MEDIA_INDEX_PATH = path.join(COLLECTION_DIR, "media-index.json");
export const REPORT_DIR = path.join(COLLECTION_DIR, "reports");
export const IMAGE_DIR = path.join(ROOT, "public", "images", "collection");

export function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

export function readJson(filePath, fallback = null) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

export function writeJsonAtomic(filePath, data, { dryRun = false } = {}) {
  if (dryRun) return;
  ensureDir(path.dirname(filePath));
  const tmp = `${filePath}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  fs.renameSync(tmp, filePath);
}

export function listEntryIds() {
  if (!fs.existsSync(ENTRIES_DIR)) return [];
  return fs
    .readdirSync(ENTRIES_DIR)
    .filter((file) => file.endsWith(".json") && !file.startsWith("_"))
    .map((file) => file.replace(/\.json$/, ""));
}

export function readEntry(id) {
  const filePath = path.join(ENTRIES_DIR, `${id}.json`);
  if (!fs.existsSync(filePath)) return null;
  return readJson(filePath);
}

export function writeEntry(record, { dryRun = false } = {}) {
  const filePath = path.join(ENTRIES_DIR, `${record.id}.json`);
  writeJsonAtomic(filePath, record, { dryRun });
}

export function loadMediaIndex() {
  const index = readJson(MEDIA_INDEX_PATH, {
    version: 1,
    byMediaId: {},
    updatedAt: null,
  });
  if (!index.byMediaId) index.byMediaId = {};
  return index;
}

export function saveMediaIndex(index, { dryRun = false } = {}) {
  index.updatedAt = new Date().toISOString();
  writeJsonAtomic(MEDIA_INDEX_PATH, index, { dryRun });
}

export function buildMediaIdIndexFromEntries() {
  const byMediaId = {};
  for (const id of listEntryIds()) {
    const record = readEntry(id);
    if (record?.source?.mediaId) {
      byMediaId[record.source.mediaId] = record.id;
    }
  }
  return byMediaId;
}

export function entryImageDir(entryId) {
  return path.join(IMAGE_DIR, entryId);
}

export function publicImagePaths(entryId) {
  return {
    original: `/images/collection/${entryId}/primary-original.jpg`,
    display: `/images/collection/${entryId}/primary.jpg`,
    manifest: `/images/collection/${entryId}/manifest.json`,
  };
}
