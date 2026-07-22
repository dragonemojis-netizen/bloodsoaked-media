/**
 * One-shot consistency repair: fix internal links mangled by polish
 * (archive paths incorrectly abs'd against the Weebly host).
 *
 * Does not rewrite editorial text. Does not fetch. Safe for sealed archives.
 *
 * Usage: node scripts/recovery/metal-lifestyle/fix-mangled-archive-links.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const ARCHIVE = path.join(ROOT, "content/archives/metal-lifestyle");
const ARCHIVE_BASE = "/the-archives/metal-lifestyle";
const MANGLED = /https?:\/\/metallifestyle\.weebly\.com(\/the-archives\/metal-lifestyle\/[^"'>\s]*)/gi;

function fixHtml(html) {
  if (!html) return { html, count: 0 };
  let count = 0;
  const next = html.replace(MANGLED, (_, pathPart) => {
    count += 1;
    return pathPart;
  });
  return { html: next, count };
}

function walk(dir) {
  let files = 0;
  let links = 0;
  for (const name of fs.readdirSync(dir)) {
    if (!name.endsWith(".json")) continue;
    const file = path.join(dir, name);
    const record = JSON.parse(fs.readFileSync(file, "utf8"));
    const { html, count } = fixHtml(record.contentHtml || "");
    if (!count) continue;
    record.contentHtml = html;
    record.preservationNotes = [
      ...(record.preservationNotes || []),
      `Consistency fix: demangled ${count} archive link(s) incorrectly prefixed with Weebly host`,
    ];
    fs.writeFileSync(file, JSON.stringify(record, null, 2) + "\n");
    files += 1;
    links += count;
  }
  return { files, links };
}

const posts = walk(path.join(ARCHIVE, "posts"));
const pages = walk(path.join(ARCHIVE, "pages"));
console.log(
  JSON.stringify(
    {
      postsFixed: posts.files,
      postLinks: posts.links,
      pagesFixed: pages.files,
      pageLinks: pages.links,
    },
    null,
    2,
  ),
);
