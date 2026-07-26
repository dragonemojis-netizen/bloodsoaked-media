/**
 * Rebuild content/library/index.json shelf summaries from accession files.
 *
 * Browse (/library) reads shelf projections from this index so thousands of
 * filings never require opening every accession JSON. Run after filing or
 * revising Archive Entries.
 *
 * Usage: node scripts/rebuild-library-index.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const LIBRARY_DIR = path.join(ROOT, "content", "library");
const ENTRIES_DIR = path.join(LIBRARY_DIR, "entries");
const INDEX_PATH = path.join(LIBRARY_DIR, "index.json");
const SCHEMA_VERSION = 2;

function readRecords() {
  if (!fs.existsSync(ENTRIES_DIR)) return [];
  return fs
    .readdirSync(ENTRIES_DIR)
    .filter((file) => file.endsWith(".json") && !file.startsWith("_"))
    .map((file) => {
      const raw = fs.readFileSync(path.join(ENTRIES_DIR, file), "utf8");
      return JSON.parse(raw);
    })
    .sort((a, b) => a.slug.localeCompare(b.slug));
}

function toShelfSummary(record) {
  return {
    slug: record.slug,
    title: record.title,
    mediaType: record.mediaType,
    status: record.status,
    visibility: record.visibility,
    year: record.year,
    synopsis: record.synopsis,
    coverImage: record.coverImage,
    filedAt: record.filedAt,
    shelfMark: record.shelfMark,
    platform: record.catalog?.platform,
    subjects: record.catalog?.subjects ?? [],
    originalTitle: record.catalog?.originalTitle,
    developer: record.catalog?.developer,
    publisher: record.catalog?.publisher,
    director: record.catalog?.director,
    artist: record.catalog?.artist,
    series: record.connections?.series,
    accessionSource: record.accession?.source,
    steamAppId: record.steam?.appId,
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
    entrySlugs: records.map((record) => record.slug),
    publishedSlugs: records
      .filter((record) => record.visibility === "published")
      .map((record) => record.slug),
    shelf,
    updatedAt: new Date().toISOString(),
  };

  fs.writeFileSync(INDEX_PATH, `${JSON.stringify(index, null, 2)}\n`, "utf8");
  console.log(
    `Rebuilt library index: ${records.length} filing(s), ${index.publishedSlugs.length} published → ${INDEX_PATH}`,
  );
}

main();
