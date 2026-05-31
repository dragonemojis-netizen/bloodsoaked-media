/**
 * Phase 2–3: Import APPROVED inventory entries into content/legacy/
 * Usage: npm run recovery:ml:import
 * Optional: npm run recovery:ml:import -- --dry-run
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";
import { parseArticlePage } from "./lib/weebly-parser.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "../../..");
const INVENTORY_PATH = path.join(
  ROOT,
  "recovery/metal-lifestyle/reports/inventory.json",
);
const LEGACY_DIR = path.join(ROOT, "content/legacy");
const RAW_DIR = path.join(ROOT, "recovery/metal-lifestyle/raw");
const COLLECTION_PATH = path.join(
  ROOT,
  "content/collections/metal-lifestyle-era.json",
);

const ARCHIVE_DATE = new Date().toISOString().slice(0, 10);
const ARCHIVE_ERA = "Metal Lifestyle Era (2015-2019)";
const DRY_RUN = process.argv.includes("--dry-run");

function excerptFromMarkdown(md, max = 220) {
  const plain = md
    .replace(/^#+\s+/gm, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (plain.length <= max) return plain;
  return `${plain.slice(0, max - 1).trim()}…`;
}

function restorationNote(date) {
  const year = date ? date.slice(0, 4) : "an earlier year";
  return `Originally published on Metal Lifestyle in ${year} and preserved as part of the Bloodsoaked Media archive project.`;
}

function loadRawHtml(url) {
  const pathname = new URL(url).pathname;
  const safeName = pathname.replace(/[^a-z0-9.-]/gi, "_").slice(0, 120);
  const rawPath = path.join(RAW_DIR, `${safeName || "index"}.html`);
  if (!fs.existsSync(rawPath)) return null;
  return fs.readFileSync(rawPath, "utf8");
}

function buildFrontmatter(entry, parsed) {
  const pubDate = entry.publicationDate ?? "2015-01-01";
  const excerpt = excerptFromMarkdown(parsed.markdown);

  return {
    title: entry.title,
    date: ARCHIVE_DATE,
    archiveDate: ARCHIVE_DATE,
    excerpt,
    category: entry.category,
    type: entry.type,
    medium: entry.medium,
    era: pubDate.slice(0, 4),
    mood: "Atmospheric",
    tags: entry.tags,
    legacy: true,
    author: "Dakota",
    originalPublication: "Metal Lifestyle",
    originalPublicationDate: pubDate,
    originalSite: "Metal Lifestyle",
    originalUrl: entry.url,
    archiveEra: ARCHIVE_ERA,
    collections: entry.collections,
    restorationNote: restorationNote(pubDate),
  };
}

function updateCollectionSlugs(slugs) {
  if (!fs.existsSync(COLLECTION_PATH)) return;
  const collection = JSON.parse(fs.readFileSync(COLLECTION_PATH, "utf8"));
  const existing = new Set(collection.articleSlugs ?? []);
  slugs.forEach((s) => existing.add(s));
  collection.articleSlugs = [...existing].sort();
  if (!DRY_RUN) {
    fs.writeFileSync(COLLECTION_PATH, JSON.stringify(collection, null, 2) + "\n");
  }
}

async function main() {
  if (!fs.existsSync(INVENTORY_PATH)) {
    console.error("Run npm run recovery:ml:crawl first.");
    process.exit(1);
  }

  const inventory = JSON.parse(fs.readFileSync(INVENTORY_PATH, "utf8"));
  const approved = inventory.approvedForImport ?? [];

  console.log(
    `Metal Lifestyle Import — ${approved.length} approved entries${DRY_RUN ? " (dry run)" : ""}\n`,
  );

  const imported = [];
  const skipped = [];

  for (const entry of approved) {
    const outPath = path.join(LEGACY_DIR, `${entry.slug}.md`);
    if (fs.existsSync(outPath)) {
      skipped.push({ slug: entry.slug, reason: "already exists" });
      continue;
    }

    const html = loadRawHtml(entry.url);
    if (!html) {
      skipped.push({ slug: entry.slug, reason: "raw HTML missing — re-crawl" });
      continue;
    }

    const parsed = parseArticlePage(html, entry.url);
    const frontmatter = buildFrontmatter(entry, parsed);
    const body = parsed.markdown.trim() + "\n";
    const file = matter.stringify(body, frontmatter);

    if (DRY_RUN) {
      console.log(`[dry-run] Would write ${entry.slug}.md`);
    } else {
      fs.writeFileSync(outPath, file, "utf8");
      console.log(`Imported ${entry.slug}.md`);
    }
    imported.push(entry.slug);
  }

  if (!DRY_RUN && imported.length > 0) {
    updateCollectionSlugs(imported);
  }

  console.log(`\nImported: ${imported.length}`);
  console.log(`Skipped: ${skipped.length}`);
  if (skipped.length) console.log(skipped);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
