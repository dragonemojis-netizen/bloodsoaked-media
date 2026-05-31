/**
 * Validates media log against verified-entries.json and cover art on disk.
 * Run: node scripts/audit-media-log.mjs
 */
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const LOG_DIR = path.join(ROOT, "content", "media-log");
const MANIFEST = path.join(LOG_DIR, "verified-entries.json");
const LIBRARY = path.join(LOG_DIR, "cover-library.json");
const COVER_DIR = path.join(ROOT, "public", "images", "media-log");
const REPORT_DIR = path.join(LOG_DIR, "reports");

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[():]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function hasLocalCover(slug) {
  if (!fs.existsSync(COVER_DIR)) return false;
  return IMAGE_EXTENSIONS.some((ext) =>
    fs.existsSync(path.join(COVER_DIR, `${slug}${ext}`)),
  );
}

function readMd(slug) {
  const file = path.join(LOG_DIR, `${slug}.md`);
  if (!fs.existsSync(file)) return null;
  return matter(fs.readFileSync(file, "utf8")).data;
}

const manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
const library = JSON.parse(fs.readFileSync(LIBRARY, "utf8")).entries ?? {};

const fetchLogPath = path.join(REPORT_DIR, "cover-fetch-log.json");
const fetchLog = fs.existsSync(fetchLogPath)
  ? JSON.parse(fs.readFileSync(fetchLogPath, "utf8")).entries ?? []
  : [];

const SUSPICIOUS_COVER_RULES = [
  { slug: "serious-sam-next-encounter", reason: "Art matched Serious Sam Advance — verify PSP Next Encounter box art" },
  { slug: "destiny-2-renegades", reason: "Shared Destiny 2 base art — expansion-specific art may differ" },
  { slug: "destiny-2-the-final-shape", reason: "Shared Destiny 2 base art — expansion-specific art may differ" },
  { slug: "diablo-iv-lord-of-hatred", reason: "Matched base Diablo IV art — Lord of Hatred expansion art may differ" },
  { slug: "fatal-frame-ii-remake", reason: "Matched Fatal Frame II: Crimson Butterfly — confirm remake vs original regional art" },
];

const suspiciousCovers = SUSPICIOUS_COVER_RULES.filter((r) => hasLocalCover(r.slug));

let correctionsPath = path.join(REPORT_DIR, "platform-corrections.json");
const platformCorrections = fs.existsSync(correctionsPath)
  ? JSON.parse(fs.readFileSync(correctionsPath, "utf8")).corrections ?? []
  : [];

const platformMismatches = [];
const missingMd = [];
const missingCover = [];
const hasCover = [];
const manualReview = [];
const staleFiles = [];

for (const entry of manifest.entries) {
  const slug = slugify(entry.title);
  const md = readMd(slug);

  if (!md) {
    missingMd.push({ slug, title: entry.title });
    continue;
  }

  if (md.platform !== entry.platform) {
    platformMismatches.push({
      slug,
      title: entry.title,
      expected: entry.platform,
      actual: md.platform ?? "(missing)",
    });
  }

  const local = hasLocalCover(slug);
  const lib = library[slug];

  if (local) {
    hasCover.push({ slug, title: entry.title });
  } else {
    missingCover.push({
      slug,
      title: entry.title,
      wikipedia: lib?.wikipedia ?? null,
      hasLibrarySource: Boolean(lib?.wikipedia || lib?.local || lib?.embed),
    });
    manualReview.push({
      slug,
      title: entry.title,
      reason: lib?.wikipedia
        ? "Cover fetch failed — verify Wikipedia title or add manual coverArt"
        : "No cover source — add to cover-library.json or place file in public/images/media-log/",
      wikipedia: lib?.wikipedia,
    });
  }
}

const expectedSlugs = new Set(manifest.entries.map((e) => slugify(e.title)));
for (const file of fs.readdirSync(LOG_DIR)) {
  if (!file.endsWith(".md") || file.startsWith("_")) continue;
  const slug = file.replace(/\.md$/, "");
  if (!expectedSlugs.has(slug)) staleFiles.push(slug);
}

const report = {
  generatedAt: new Date().toISOString(),
  totalEntries: manifest.entries.length,
  syncedEntries: manifest.entries.length - missingMd.length,
  platformMismatchCount: platformMismatches.length,
  platformCorrectionsApplied: platformCorrections.length,
  platformCorrections,
  coversPresent: hasCover.length,
  coversMissing: missingCover.length,
  manualReviewRequired: manualReview.length,
  missingMarkdown: missingMd,
  platformMismatches,
  missingCoverArt: missingCover,
  coversPresentList: hasCover,
  manualReview,
  staleMarkdownFiles: staleFiles,
  suspiciousCovers,
  coverFetchLog: fetchLog.filter((e) => e.status === "saved"),
};

fs.mkdirSync(REPORT_DIR, { recursive: true });
fs.writeFileSync(
  path.join(REPORT_DIR, "validation-report.json"),
  JSON.stringify(report, null, 2),
  "utf8",
);

const md = `# Media Log Validation Report

Generated: ${report.generatedAt}

## Summary

| Metric | Count |
|--------|------:|
| Total entries (authoritative) | ${report.totalEntries} |
| Markdown files present | ${report.syncedEntries} |
| Platform mismatches (after sync) | ${report.platformMismatchCount} |
| Platform corrections (last sync) | ${report.platformCorrectionsApplied} |
| Cover art on disk | ${report.coversPresent} |
| Missing cover art | ${report.coversMissing} |
| Manual review required | ${report.manualReviewRequired} |
| Stale markdown files | ${staleFiles.length} |

## Platform corrections (last sync)

${
  platformCorrections.length === 0
    ? "No corrections were needed on the last sync — entries already matched authoritative data, or this is the first sync."
    : platformCorrections
        .map((p) => `- **${p.title}**: \`${p.from}\` → \`${p.to}\``)
        .join("\n")
}

## Platform mismatches

${
  report.platformMismatchCount === 0
    ? "All entries match authoritative platform data."
    : platformMismatches
        .map((p) => `- **${p.title}**: expected \`${p.expected}\`, found \`${p.actual}\``)
        .join("\n")
}

## Missing cover art (${missingCover.length})

${missingCover.map((c) => `- **${c.title}** (\`${c.slug}\`)${c.wikipedia ? ` — Wikipedia: \`${c.wikipedia}\`` : " — no curated source"}`).join("\n") || "None"}

## Covers present (${hasCover.length})

${hasCover.map((c) => `- ${c.title}`).join("\n") || "None"}

## Manual review (${manualReview.length})

${manualReview.map((m) => `- **${m.title}** (\`${m.slug}\`): ${m.reason}${m.wikipedia ? ` — \`${m.wikipedia}\`` : ""}`).join("\n") || "None"}

## Potentially incorrect cover art (${suspiciousCovers.length})

${suspiciousCovers.map((s) => `- **${s.slug}**: ${s.reason}`).join("\n") || "None flagged"}

${staleFiles.length ? `## Stale files\n\n${staleFiles.map((s) => `- ${s}.md`).join("\n")}` : ""}
`;

fs.writeFileSync(path.join(REPORT_DIR, "VALIDATION-REPORT.md"), md, "utf8");
console.log(`Report: content/media-log/reports/VALIDATION-REPORT.md`);
console.log(
  `Entries: ${report.totalEntries} | Platforms OK: ${report.platformMismatchCount === 0} | Covers: ${report.coversPresent}/${report.totalEntries}`,
);
if (report.platformMismatchCount > 0) process.exitCode = 1;
