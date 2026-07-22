/**
 * Quality audit for Metal Lifestyle archive stewardship.
 * Usage: npm run recovery:ml:quality-audit
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "../../..");
const ARCHIVE = path.join(ROOT, "content/archives/metal-lifestyle");
const POSTS_DIR = path.join(ARCHIVE, "posts");
const PAGES_DIR = path.join(ARCHIVE, "pages");
const OUT = path.join(
  ROOT,
  "recovery/metal-lifestyle/reports/QUALITY-AUDIT.md",
);

function loadAll(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) =>
      JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")),
    );
}

function main() {
  const posts = loadAll(POSTS_DIR);
  const pages = loadAll(PAGES_DIR);
  const issues = [];

  const titles = new Map();
  for (const p of posts) {
    const key = (p.title || "").toLowerCase().trim();
    if (!key) issues.push({ type: "empty-title", slug: p.slug });
    if (!titles.has(key)) titles.set(key, []);
    titles.get(key).push(p.slug);
    if (!p.contentHtml || p.contentHtml.length < 40)
      issues.push({ type: "empty-or-thin-html", slug: p.slug, status: p.status });
    if (/wsite-adsense|serveAds\.php/.test(p.contentHtml || ""))
      issues.push({ type: "adsense-remnant", slug: p.slug });
    if (/<script/i.test(p.contentHtml || ""))
      issues.push({ type: "script-tag", slug: p.slug });
    const missing = (p.media || []).filter((m) => m.status === "missing");
    if (missing.length)
      issues.push({
        type: "missing-media",
        slug: p.slug,
        count: missing.length,
      });
    if (p.status === "unavailable")
      issues.push({ type: "unavailable", slug: p.slug });
  }

  for (const [title, slugs] of titles) {
    if (slugs.length > 1) {
      issues.push({ type: "duplicate-title", title, slugs });
    }
  }

  // Orphan junk pages
  for (const p of pages) {
    if (/cdn-cgi|--feed$|feed$|--previous--|--category--/i.test(p.slug)) {
      issues.push({ type: "junk-page", slug: p.slug });
    }
  }

  const byType = {};
  for (const i of issues) {
    byType[i.type] = (byType[i.type] || 0) + 1;
  }

  const md = [
    "# Metal Lifestyle Quality Audit",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Summary",
    "",
    `| Metric | Count |`,
    `|---|---:|`,
    `| Posts | ${posts.length} |`,
    `| Pages | ${pages.length} |`,
    `| Issue rows | ${issues.length} |`,
    "",
    "## Issues by type",
    "",
    ...Object.entries(byType).map(([k, v]) => `- **${k}**: ${v}`),
    "",
    "## Details",
    "",
    "```json",
    JSON.stringify(issues.slice(0, 200), null, 2),
    issues.length > 200 ? `\n… ${issues.length - 200} more` : "",
    "```",
    "",
  ].join("\n");

  fs.writeFileSync(OUT, md);
  console.log(`Wrote ${OUT}`);
  console.log(byType);
}

main();
