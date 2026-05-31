/**
 * Re-classify cached raw HTML with current author rules (no network).
 * Usage: npm run recovery:ml:recount
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { classifyAuthorship } from "./lib/author-filter.mjs";
import { inferArchiveFields } from "./lib/category-map.mjs";
import { slugifyMetalLifestyle } from "./lib/slug.mjs";
import { parseArticlePage } from "./lib/weebly-parser.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "../../..");
const INVENTORY_PATH = path.join(ROOT, "recovery/metal-lifestyle/reports/inventory.json");
const RAW_DIR = path.join(ROOT, "recovery/metal-lifestyle/raw");

function rebuildEntry(url, html) {
  const parsed = parseArticlePage(html, url);
  const auth = classifyAuthorship({
    title: parsed.title,
    text: parsed.text,
    url,
  });
  const mapped = inferArchiveFields({
    title: parsed.title,
    text: parsed.text,
    weeblyCategory: null,
  });
  return {
    title: parsed.title,
    url,
    publicationDate: parsed.publicationDate,
    dateRaw: parsed.dateRaw,
    authorAttribution: auth.authorAttribution,
    detectedSignatures: auth.detectedSignatures,
    category: mapped.category,
    type: mapped.type,
    medium: mapped.medium,
    tags: mapped.tags,
    collections: mapped.collections,
    contentLength: parsed.text.length,
    importEligibility: auth.importEligibility,
    eligibilityReason: auth.eligibilityReason,
    slug: slugifyMetalLifestyle(parsed.title, url),
    pageType: parsed.pageType,
  };
}

function main() {
  const prev = JSON.parse(fs.readFileSync(INVENTORY_PATH, "utf8"));
  const urls = [
    ...(prev.approvedForImport ?? []),
    ...(prev.requiresReview ?? []),
    ...(prev.excluded ?? []),
  ].map((e) => e.url);

  const inventory = {
    generatedAt: new Date().toISOString(),
    sourceSite: prev.sourceSite,
    authorFilter: prev.authorFilter,
    summary: { total: 0, approved: 0, requiresReview: 0, excluded: 0 },
    approvedForImport: [],
    requiresReview: [],
    excluded: [],
  };

  for (const url of urls) {
    const pathname = new URL(url).pathname;
    const safeName = pathname.replace(/[^a-z0-9.-]/gi, "_").slice(0, 120);
    const rawPath = path.join(RAW_DIR, `${safeName || "index"}.html`);
    if (!fs.existsSync(rawPath)) {
      inventory.excluded.push({
        url,
        importEligibility: "excluded",
        eligibilityReason: "Missing cached HTML",
      });
      inventory.summary.excluded++;
      inventory.summary.total++;
      continue;
    }
    const html = fs.readFileSync(rawPath, "utf8");
    const entry = rebuildEntry(url, html);
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
  }

  fs.writeFileSync(INVENTORY_PATH, JSON.stringify(inventory, null, 2));
  console.log("Recount complete:", inventory.summary);
}

main();
