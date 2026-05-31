/**
 * Phase 1: Crawl Metal Lifestyle and build master inventory (Dakota-only filtering).
 * Usage: npm run recovery:ml:crawl
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  classifyAuthorship,
  isExcludedPagePath,
} from "./lib/author-filter.mjs";
import { inferArchiveFields } from "./lib/category-map.mjs";
import { slugifyMetalLifestyle } from "./lib/slug.mjs";
import {
  extractBlogLinks,
  extractStaticContentLinks,
  normalizeUrl,
  parseArticlePage,
} from "./lib/weebly-parser.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "../../..");
const RAW_DIR = path.join(ROOT, "recovery/metal-lifestyle/raw");
const REPORTS_DIR = path.join(ROOT, "recovery/metal-lifestyle/reports");

const BASE = "https://metallifestyle.weebly.com";
const DELAY_MS = 600;

const STATIC_CANDIDATES = [
  "/gaming-corner.html",
  "/dysphoria.html",
  "/american-metalcore-project.html",
  "/prisms-local-show-recap.html",
  "/fear-short-horror-tales-from-the-team.html",
  "/curtains-movie--tv-reviews.html",
];

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchHtml(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "BloodsoakedMedia-ArchiveRecovery/1.0 (preservation)" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

async function discoverAllBlogUrls() {
  const urls = new Set();
  let pageUrl = `${BASE}/`;

  for (let page = 0; page < 200; page++) {
    console.log(`Discovering blog page: ${pageUrl}`);
    const html = await fetchHtml(pageUrl);
    const rawName = `blog-index-${page}.html`;
    fs.writeFileSync(path.join(RAW_DIR, rawName), html, "utf8");

    const { postUrls, nextPageUrl } = extractBlogLinks(html);
    postUrls.forEach((u) => urls.add(u));

    if (!nextPageUrl || urls.size === 0) break;
    const next = normalizeUrl(nextPageUrl);
    if (!next || next === pageUrl) break;
    pageUrl = next;
    await sleep(DELAY_MS);
  }

  return [...urls];
}

function buildInventoryEntry({ url, parsed, weeblyCategory }) {
  const slug = slugifyMetalLifestyle(parsed.title, url);
  const auth = classifyAuthorship({
    title: parsed.title,
    text: parsed.text,
    url,
  });
  const mapped = inferArchiveFields({
    title: parsed.title,
    text: parsed.text,
    weeblyCategory,
  });

  return {
    title: parsed.title,
    url,
    publicationDate: parsed.publicationDate,
    dateRaw: parsed.dateRaw,
    authorAttribution: auth.authorAttribution,
    detectedSignatures: auth.detectedSignatures,
    weeblyCategory: weeblyCategory ?? null,
    category: mapped.category,
    type: mapped.type,
    medium: mapped.medium,
    tags: mapped.tags,
    collections: mapped.collections,
    contentLength: parsed.text.length,
    importEligibility: auth.importEligibility,
    eligibilityReason: auth.eligibilityReason,
    slug,
    pageType: parsed.pageType,
    imageCount: parsed.images.length,
  };
}

async function processUrl(url) {
  const pathname = new URL(url).pathname;
  if (isExcludedPagePath(pathname)) {
    return {
      title: pathname,
      url,
      importEligibility: "excluded",
      eligibilityReason: "Non-article site page (gallery, staff, etc.).",
      contentLength: 0,
    };
  }

  const safeName = pathname.replace(/[^a-z0-9.-]/gi, "_").slice(0, 120);
  const rawPath = path.join(RAW_DIR, `${safeName || "index"}.html`);

  const html = await fetchHtml(url);
  fs.writeFileSync(rawPath, html, "utf8");

  const parsed = parseArticlePage(html, url);
  if (!parsed.title || parsed.text.length < 200) {
    return {
      title: parsed.title || url,
      url,
      importEligibility: "excluded",
      eligibilityReason: "Insufficient article body for archive import.",
      contentLength: parsed.text.length,
    };
  }

  return buildInventoryEntry({ url, parsed });
}

async function main() {
  fs.mkdirSync(RAW_DIR, { recursive: true });
  fs.mkdirSync(REPORTS_DIR, { recursive: true });

  console.log("Metal Lifestyle Archive Recovery — Phase 1: Crawl & Inventory\n");

  const blogUrls = await discoverAllBlogUrls();
  console.log(`\nFound ${blogUrls.length} blog post URLs.\n`);

  const staticUrls = STATIC_CANDIDATES.map((p) => `${BASE}${p}`);
  const allUrls = [...new Set([...blogUrls, ...staticUrls])];

  const inventory = {
    generatedAt: new Date().toISOString(),
    sourceSite: BASE,
    authorFilter:
      "Dakota Gochee, Dakota, Dakota G., D., DG — exclude when uncertain",
    summary: { total: 0, approved: 0, requiresReview: 0, excluded: 0 },
    approvedForImport: [],
    requiresReview: [],
    excluded: [],
  };

  for (let i = 0; i < allUrls.length; i++) {
    const url = allUrls[i];
    console.log(`[${i + 1}/${allUrls.length}] ${url}`);
    try {
      const entry = await processUrl(url);
      inventory.summary.total++;

      if (entry.importEligibility === "approved") {
        inventory.approvedForImport.push(entry);
        inventory.summary.approved++;
      } else if (entry.importEligibility === "requires_review") {
        inventory.requiresReview.push(entry);
        inventory.summary.requiresReview++;
      } else {
        inventory.excluded.push(entry);
        inventory.summary.excluded++;
      }
    } catch (err) {
      console.error(`  Failed: ${err.message}`);
      inventory.excluded.push({
        url,
        title: url,
        importEligibility: "excluded",
        eligibilityReason: `Crawl error: ${err.message}`,
      });
      inventory.summary.total++;
      inventory.summary.excluded++;
    }
    await sleep(DELAY_MS);
  }

  const outPath = path.join(REPORTS_DIR, "inventory.json");
  fs.writeFileSync(outPath, JSON.stringify(inventory, null, 2), "utf8");

  console.log("\n--- Inventory Summary ---");
  console.log(`Total scanned: ${inventory.summary.total}`);
  console.log(`Approved for import: ${inventory.summary.approved}`);
  console.log(`Requires review: ${inventory.summary.requiresReview}`);
  console.log(`Excluded: ${inventory.summary.excluded}`);
  console.log(`\nWritten to ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
