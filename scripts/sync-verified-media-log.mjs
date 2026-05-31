/**
 * Rebuilds media log .md files from content/media-log/verified-entries.json only.
 * Run: node scripts/sync-verified-media-log.mjs
 */
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOG_DIR = path.join(__dirname, "..", "content", "media-log");
const MANIFEST = path.join(LOG_DIR, "verified-entries.json");
const REPORT_DIR = path.join(LOG_DIR, "reports");

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[():]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function yamlString(value) {
  if (/[:#\n'"]/.test(value)) return `"${value.replace(/"/g, '\\"')}"`;
  return value;
}

function buildFrontmatter(entry, archiveOrder) {
  const lines = [
    "---",
    `title: ${yamlString(entry.title)}`,
    "mediaType: Game",
    `status: ${entry.status}`,
    `platform: ${yamlString(entry.platform)}`,
  ];

  if (entry.date) lines.push(`date: ${entry.date}`);
  if (entry.logYear != null) lines.push(`logYear: ${entry.logYear}`);
  lines.push(`archiveOrder: ${entry.archiveOrder ?? archiveOrder}`);
  if (entry.isReplay) lines.push("isReplay: true");
  if (entry.platinumNumber != null) {
    lines.push(`platinumNumber: ${entry.platinumNumber}`);
  }
  if (entry.coverArt) lines.push(`coverArt: ${yamlString(entry.coverArt)}`);
  if (entry.coverEmbed) lines.push(`coverEmbed: ${yamlString(entry.coverEmbed)}`);
  if (entry.score != null) lines.push(`score: ${entry.score}`);
  if (entry.notes) lines.push(`notes: ${yamlString(entry.notes)}`);
  if (entry.tags?.length) {
    lines.push("tags:");
    for (const tag of entry.tags) lines.push(`  - ${yamlString(tag)}`);
  }
  if (entry.reviewSlug) lines.push(`reviewSlug: ${entry.reviewSlug}`);

  lines.push("---", "");
  return lines.join("\n");
}

const manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
const platformCorrections = [];

for (const file of fs.readdirSync(LOG_DIR)) {
  if (!file.endsWith(".md") || file.startsWith("_")) continue;
  const slug = file.replace(/\.md$/, "");
  const filePath = path.join(LOG_DIR, file);
  const { data } = matter(fs.readFileSync(filePath, "utf8"));
  const expected = manifest.entries.find((e) => slugify(e.title) === slug);
  if (expected && data.platform && data.platform !== expected.platform) {
    platformCorrections.push({
      slug,
      title: expected.title,
      from: data.platform,
      to: expected.platform,
    });
  }
}

for (const file of fs.readdirSync(LOG_DIR)) {
  if (!file.endsWith(".md") || file.startsWith("_")) continue;
  fs.unlinkSync(path.join(LOG_DIR, file));
}

let order = 0;
for (const entry of manifest.entries) {
  order += 1;
  const slug = slugify(entry.title);
  const body = buildFrontmatter(entry, order);
  fs.writeFileSync(path.join(LOG_DIR, `${slug}.md`), body, "utf8");
}

fs.mkdirSync(REPORT_DIR, { recursive: true });
fs.writeFileSync(
  path.join(REPORT_DIR, "platform-corrections.json"),
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      corrections: platformCorrections,
      count: platformCorrections.length,
    },
    null,
    2,
  ),
  "utf8",
);

console.log(`Synced ${manifest.entries.length} verified media log entries.`);
console.log(`Platform corrections applied: ${platformCorrections.length}`);
