/**
 * List articles in audit.json missing from prior inventory.json (by canonical slug).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { articleCanonicalKey } from "./lib/discovery.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "../../..");

const audit = JSON.parse(
  fs.readFileSync(
    path.join(ROOT, "recovery/metal-lifestyle/reports/audit.json"),
    "utf8",
  ),
);
const prior = JSON.parse(
  fs.readFileSync(
    path.join(ROOT, "recovery/metal-lifestyle/reports/inventory.json"),
    "utf8",
  ),
);

const priorKeys = new Set();
for (const group of [
  prior.approvedForImport,
  prior.requiresReview,
  prior.excluded,
]) {
  for (const e of group ?? []) {
    if (e.url) priorKeys.add(articleCanonicalKey(e.url));
  }
}

const missing = audit.articles.filter(
  (a) => !priorKeys.has(a.canonicalKey),
);

const out = {
  generatedAt: new Date().toISOString(),
  priorArticleCount: priorKeys.size,
  auditArticleCount: audit.articles.length,
  missingFromPriorCrawl: missing.length,
  articles: missing.map((a) => ({
    title: a.title,
    year: a.year,
    publicationDate: a.publicationDate,
    urls: a.urls,
    canonicalKey: a.canonicalKey,
  })),
};

const outPath = path.join(
  ROOT,
  "recovery/metal-lifestyle/reports/gap-vs-prior-inventory.json",
);
fs.writeFileSync(outPath, JSON.stringify(out, null, 2), "utf8");
console.log(`Prior: ${priorKeys.size} · Audit: ${audit.articles.length}`);
console.log(`Missing from prior crawl: ${missing.length}`);
console.log(`Wrote ${outPath}`);
