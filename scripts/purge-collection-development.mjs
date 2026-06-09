/**
 * Removes development-only archive records (synthetic seeds) and rebuilds the index.
 * Authentic instagram and curated records are preserved.
 *
 * Run:
 *   node scripts/purge-collection-development.mjs -- --dry-run
 *   node scripts/purge-collection-development.mjs
 */
import fs from "fs";
import path from "path";
import { rebuildArchiveIndex } from "./lib/collection-archive-index.mjs";
import {
  ENTRIES_DIR,
  IMAGE_DIR,
  MEDIA_INDEX_PATH,
  REPORT_DIR,
  ensureDir,
  listEntryIds,
  loadMediaIndex,
  readEntry,
  readJson,
  saveMediaIndex,
  writeJsonAtomic,
} from "./lib/collection-archive-fs.mjs";
import { isDevelopmentRecord } from "./lib/collection-archive-origin.mjs";

const dryRun = process.argv.includes("--dry-run");

function removeEntryFiles(id) {
  const entryPath = path.join(ENTRIES_DIR, `${id}.json`);
  if (fs.existsSync(entryPath)) {
    if (!dryRun) fs.unlinkSync(entryPath);
    return true;
  }
  return false;
}

function removeImageDir(id) {
  const imageDir = path.join(IMAGE_DIR, id);
  if (!fs.existsSync(imageDir)) return false;
  if (!dryRun) fs.rmSync(imageDir, { recursive: true, force: true });
  return true;
}

function main() {
  ensureDir(REPORT_DIR);

  const removed = [];
  const kept = [];

  for (const id of listEntryIds()) {
    const record = readEntry(id);
    if (!record) continue;

    if (isDevelopmentRecord(record)) {
      removeEntryFiles(id);
      removeImageDir(id);
      removed.push(id);
    } else {
      kept.push(id);
    }
  }

  const mediaIndex = loadMediaIndex();
  for (const [mediaId, entryId] of Object.entries(mediaIndex.byMediaId)) {
    if (removed.includes(entryId)) {
      delete mediaIndex.byMediaId[mediaId];
    }
  }
  saveMediaIndex(mediaIndex, { dryRun });

  const indexResult = rebuildArchiveIndex({ dryRun });

  const report = {
    generatedAt: new Date().toISOString(),
    dryRun,
    removed,
    kept,
    archiveDisplayCount: indexResult.total,
    featuredId: indexResult.featuredId,
  };

  const reportPath = path.join(
    REPORT_DIR,
    `purge-development-${new Date().toISOString().slice(0, 10)}.json`,
  );
  writeJsonAtomic(reportPath, report, { dryRun });

  console.log("Collection Development Purge");
  console.log("============================");
  if (dryRun) console.log("Mode: dry-run");
  console.log(`Removed:  ${removed.length}`);
  console.log(`Kept:     ${kept.length}`);
  console.log(`Display:  ${indexResult.total} authentic record(s) on Collection page`);
  if (removed.length > 0) {
    console.log("\nRemoved development records:");
    for (const id of removed) console.log(`  - ${id}`);
  }
  if (!dryRun) console.log(`\nReport: ${reportPath}`);
}

main();
