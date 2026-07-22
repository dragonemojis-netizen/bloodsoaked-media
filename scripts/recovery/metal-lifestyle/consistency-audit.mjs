/**
 * Read-only consistency audit for the sealed Metal Lifestyle archive.
 * Usage: npm run recovery:ml:consistency-audit
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const ARCHIVE = path.join(ROOT, "content/archives/metal-lifestyle");
const OUT = path.join(
  ROOT,
  "recovery/metal-lifestyle/reports/CONSISTENCY-AUDIT.md",
);
const ARCHIVE_BASE = "/the-archives/metal-lifestyle";

function loadDir(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));
}

function main() {
  const posts = loadDir(path.join(ARCHIVE, "posts"));
  const pages = loadDir(path.join(ARCHIVE, "pages"));
  const authors = JSON.parse(
    fs.readFileSync(path.join(ARCHIVE, "authors.json"), "utf8"),
  );
  const lock = JSON.parse(
    fs.readFileSync(path.join(ARCHIVE, "PRESERVATION.lock.json"), "utf8"),
  );

  const issues = [];

  let mangled = 0;
  let unrestoredMarked = 0;
  let nullAuthorRestored = 0;
  let badDates = 0;
  let thinRestored = 0;

  for (const p of [...posts, ...pages]) {
    const html = p.contentHtml || "";
    if (/metallifestyle\.weebly\.com\/the-archives\//i.test(html)) {
      mangled += 1;
      issues.push({ type: "mangled-archive-link", slug: p.slug, kind: p.kind });
    }
    if (/data-ml-external-archive/.test(html)) unrestoredMarked += 1;
    if (p.status === "restored" && !p.author && p.kind === "post") {
      nullAuthorRestored += 1;
    }
    if (
      p.publicationDate &&
      !/^\d{4}-\d{2}-\d{2}$/.test(p.publicationDate)
    ) {
      badDates += 1;
      issues.push({
        type: "inconsistent-date",
        slug: p.slug,
        date: p.publicationDate,
      });
    }
    if (
      p.status === "restored" &&
      String(p.text || "").replace(/\s+/g, " ").trim().length < 40
    ) {
      thinRestored += 1;
      issues.push({ type: "thin-restored", slug: p.slug });
    }
  }

  // Orphan author slugs referenced? (light check)
  const authorSlugs = new Set(authors.map((a) => a.slug));
  for (const a of authors) {
    if (!a.name) issues.push({ type: "author-missing-name", slug: a.slug });
  }

  // Duplicate JSON filenames vs slug field
  for (const dirName of ["posts", "pages"]) {
    const dir = path.join(ARCHIVE, dirName);
    for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".json"))) {
      const rec = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
      if (`${rec.slug}.json` !== f) {
        issues.push({
          type: "filename-slug-mismatch",
          file: f,
          slug: rec.slug,
        });
      }
    }
  }

  const junkPages = pages.filter((p) =>
    /cdn-cgi|--feed$|feed$|--previous--|--category--/i.test(p.slug),
  );

  const summary = {
    sealed: lock.sealed,
    posts: posts.length,
    pages: pages.length,
    authors: authors.length,
    authorsWithBio: authors.filter((a) => a.biography).length,
    mangledArchiveLinks: mangled,
    unrestoredLinkMarkers: unrestoredMarked,
    nullAuthorRestored,
    badDates,
    thinRestored,
    junkPageSlugs: junkPages.length,
    issueRows: issues.length,
  };

  const md = [
    "# Metal Lifestyle Consistency Audit",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Summary",
    "",
    "```json",
    JSON.stringify(summary, null, 2),
    "```",
    "",
    "## Notes",
    "",
    `- Canonical article route: \`${ARCHIVE_BASE}/post/[slug]\``,
    `- Canonical author route: \`${ARCHIVE_BASE}/author/[slug]\``,
    `- Null authors on restored posts are historical extraction gaps — do not invent bylines.`,
    `- Mangled links (if any) should be repaired with fix-mangled-archive-links.mjs`,
    "",
    "## Issue sample",
    "",
    "```json",
    JSON.stringify(issues.slice(0, 80), null, 2),
    issues.length > 80 ? `\n… ${issues.length - 80} more` : "",
    "```",
    "",
  ].join("\n");

  fs.writeFileSync(OUT, md, "utf8");
  console.log(JSON.stringify(summary, null, 2));
  console.log(`Wrote ${OUT}`);
}

main();
