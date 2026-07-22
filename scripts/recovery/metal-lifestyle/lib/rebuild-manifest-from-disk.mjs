/**
 * Shared helper: write manifest.json from on-disk posts/pages.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../..",
);
const ARCHIVE = path.join(ROOT, "content/archives/metal-lifestyle");
const POSTS_DIR = path.join(ARCHIVE, "posts");
const PAGES_DIR = path.join(ARCHIVE, "pages");
const MANIFEST_PATH = path.join(ARCHIVE, "manifest.json");
const AUTHORS_PATH = path.join(ARCHIVE, "authors.json");
const CATEGORIES_PATH = path.join(ARCHIVE, "categories.json");
const LOCK_PATH = path.join(ARCHIVE, "PRESERVATION.lock.json");

function loadDir(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));
}

function summarize(record) {
  return {
    slug: record.slug,
    title: record.title,
    publicationDate: record.publicationDate ?? null,
    author: record.author ?? null,
    category: record.category ?? null,
    excerpt: record.excerpt ?? null,
    status: record.status,
    originalUrl: record.originalUrl,
  };
}

export function rebuildManifestFromDisk(options = {}) {
  const priorPath = options.priorPath || MANIFEST_PATH;
  const prior = fs.existsSync(priorPath)
    ? JSON.parse(fs.readFileSync(priorPath, "utf8"))
    : {};
  const lock = fs.existsSync(LOCK_PATH)
    ? JSON.parse(fs.readFileSync(LOCK_PATH, "utf8"))
    : {};

  const posts = loadDir(POSTS_DIR)
    .map(summarize)
    .sort((a, b) =>
      (b.publicationDate || "").localeCompare(a.publicationDate || ""),
    );
  const pages = loadDir(PAGES_DIR)
    .map(summarize)
    .sort((a, b) => a.slug.localeCompare(b.slug));

  const authors = fs.existsSync(AUTHORS_PATH)
    ? JSON.parse(fs.readFileSync(AUTHORS_PATH, "utf8"))
    : [];
  const categories = fs.existsSync(CATEGORIES_PATH)
    ? JSON.parse(fs.readFileSync(CATEGORIES_PATH, "utf8"))
    : [];

  const restoredPosts = posts.filter((p) => p.status === "restored").length;
  const restoredPages = pages.filter(
    (p) => p.status === "restored" || p.status === "thin",
  ).length;
  const unavailable =
    posts.filter((p) => p.status === "unavailable").length +
    pages.filter((p) => p.status === "unavailable").length;
  const thin = pages.filter((p) => p.status === "thin").length;

  const today = new Date().toISOString();
  const manifest = {
    generatedAt: today,
    lastPreservationPass: today.slice(0, 10),
    polishedAt: prior.polishedAt ?? undefined,
    sourceSite:
      prior.sourceSite ??
      prior.originalSite ??
      "https://metallifestyle.weebly.com",
    originalSite: "https://metallifestyle.weebly.com",
    principle:
      prior.principle ??
      "Full publication stewardship — authenticity over modernization",
    preservationStatus: lock.status ?? null,
    sealedAt: lock.sealedAt ?? null,
    summary: {
      postsAttempted: posts.length,
      pagesAttempted: pages.length,
      postsRestored: restoredPosts,
      pagesRestored: restoredPages,
      unavailable,
      thin,
    },
    posts,
    pages,
    authors,
    categories,
  };

  if (!options.dryRun) {
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n");
  }
  return manifest;
}
