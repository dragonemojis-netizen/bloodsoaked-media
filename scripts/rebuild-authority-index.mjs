/**
 * Rebuild content/library/authorities/index.json from Authority Record files.
 *
 * Usage: node scripts/rebuild-authority-index.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const AUTHORITIES_DIR = path.join(ROOT, "content", "library", "authorities");
const INDEX_PATH = path.join(AUTHORITIES_DIR, "index.json");
const SCHEMA_VERSION = 1;

function readRecords() {
  if (!fs.existsSync(AUTHORITIES_DIR)) return [];
  return fs
    .readdirSync(AUTHORITIES_DIR)
    .filter((file) => file.endsWith(".json") && file !== "index.json")
    .map((file) => {
      const raw = fs.readFileSync(path.join(AUTHORITIES_DIR, file), "utf8");
      return JSON.parse(raw);
    })
    .sort((a, b) => a.slug.localeCompare(b.slug));
}

function toShelfSummary(record) {
  return {
    slug: record.slug,
    authorityId: record.authorityId,
    type: record.type,
    preferredName: record.preferredName,
    visibility: record.visibility,
    alternativeNames: record.alternativeNames,
  };
}

function main() {
  const records = readRecords();
  const shelf = {};
  for (const record of records) {
    shelf[record.slug] = toShelfSummary(record);
  }

  const index = {
    schemaVersion: SCHEMA_VERSION,
    authoritySlugs: records.map((record) => record.slug),
    publishedSlugs: records
      .filter((record) => record.visibility === "published")
      .map((record) => record.slug),
    shelf,
    updatedAt: new Date().toISOString(),
  };

  fs.mkdirSync(AUTHORITIES_DIR, { recursive: true });
  fs.writeFileSync(INDEX_PATH, `${JSON.stringify(index, null, 2)}\n`, "utf8");
  console.log(
    `Rebuilt authority index: ${records.length} record(s), ${index.publishedSlugs.length} published → ${INDEX_PATH}`,
  );
}

main();
