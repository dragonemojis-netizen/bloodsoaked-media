import fs from "fs";
import path from "path";

const ARCHIVE_ROOT = path.join(
  process.cwd(),
  "content/archives/metal-lifestyle",
);
const MANIFEST_PATH = path.join(ARCHIVE_ROOT, "manifest.json");
const POSTS_DIR = path.join(ARCHIVE_ROOT, "posts");
const PAGES_DIR = path.join(ARCHIVE_ROOT, "pages");
const AUTHORS_PATH = path.join(ARCHIVE_ROOT, "authors.json");
const CATEGORIES_PATH = path.join(ARCHIVE_ROOT, "categories.json");

export interface MetalLifestyleManifestEntry {
  slug: string;
  title: string;
  publicationDate?: string | null;
  author?: string | null;
  category?: string | null;
  excerpt?: string | null;
  status: string;
  originalUrl: string;
}

export interface MetalLifestyleAuthor {
  name: string;
  slug: string;
  articleSlugs: string[];
  publicationCount: number;
  biography: string | null;
}

export interface MetalLifestyleCategory {
  name: string;
  slug: string;
  description: string | null;
  articleSlugs: string[];
  articleCount: number;
}

export interface MetalLifestyleManifest {
  generatedAt: string;
  polishedAt?: string;
  lastPreservationPass?: string | null;
  sourceSite: string;
  originalSite?: string;
  principle?: string;
  summary: Record<string, number>;
  posts: MetalLifestyleManifestEntry[];
  pages: MetalLifestyleManifestEntry[];
  authors?: MetalLifestyleAuthor[];
  categories?: MetalLifestyleCategory[];
}

export interface MetalLifestylePreservation {
  originalUrl: string;
  recoverySource: string;
  recoveryDate: string | null;
  preservationStatus: string;
  missingAssets: string[];
  waybackSnapshotDate: string | null;
  polishedAt?: string;
}

export interface MetalLifestyleRecord {
  slug: string;
  kind: "post" | "page";
  title: string;
  originalUrl: string;
  publicationDate: string | null;
  dateRaw: string | null;
  author: string | null;
  category?: string | null;
  excerpt?: string | null;
  contentHtml: string;
  text: string;
  pageType?: string;
  images: string[];
  media: Array<{
    originalUrl: string;
    localPath: string | null;
    status: string;
  }>;
  status: string;
  httpStatus?: number;
  restoredAt?: string;
  preservation?: MetalLifestylePreservation;
}

function readJson<T>(filePath: string): T | null {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

function listJsonFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
}

function summarizeRecord(
  record: MetalLifestyleRecord,
): MetalLifestyleManifestEntry {
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

/**
 * Authoritative index entries — always derived from on-disk post/page JSON.
 * Manifest file metadata (dates, principle) may lag; bodies never do.
 */
export function buildMetalLifestyleIndexFromDisk(): {
  posts: MetalLifestyleManifestEntry[];
  pages: MetalLifestyleManifestEntry[];
} {
  const posts = listJsonFiles(POSTS_DIR)
    .map((f) =>
      readJson<MetalLifestyleRecord>(path.join(POSTS_DIR, f)),
    )
    .filter((r): r is MetalLifestyleRecord => Boolean(r))
    .map(summarizeRecord)
    .sort((a, b) =>
      (b.publicationDate || "").localeCompare(a.publicationDate || ""),
    );

  const pages = listJsonFiles(PAGES_DIR)
    .map((f) =>
      readJson<MetalLifestyleRecord>(path.join(PAGES_DIR, f)),
    )
    .filter((r): r is MetalLifestyleRecord => Boolean(r))
    .map(summarizeRecord)
    .sort((a, b) => a.slug.localeCompare(b.slug));

  return { posts, pages };
}

export function hasMetalLifestyleArchive(): boolean {
  return (
    fs.existsSync(POSTS_DIR) &&
    listJsonFiles(POSTS_DIR).length > 0
  );
}

/**
 * Collection index: disk records are authoritative for posts/pages.
 * Sidecar manifest.json supplies stewardship metadata when present.
 */
export function getMetalLifestyleManifest(): MetalLifestyleManifest | null {
  if (!hasMetalLifestyleArchive()) return null;
  const meta = readJson<Partial<MetalLifestyleManifest>>(MANIFEST_PATH) ?? {};
  const { posts, pages } = buildMetalLifestyleIndexFromDisk();
  const restoredPosts = posts.filter((p) => p.status === "restored").length;
  const restoredPages = pages.filter(
    (p) => p.status === "restored" || p.status === "thin",
  ).length;
  const unavailable =
    posts.filter((p) => p.status === "unavailable").length +
    pages.filter((p) => p.status === "unavailable").length;
  const thin = pages.filter((p) => p.status === "thin").length;

  return {
    generatedAt: meta.generatedAt ?? new Date().toISOString(),
    polishedAt: meta.polishedAt,
    sourceSite:
      meta.sourceSite ??
      meta.originalSite ??
      "https://metallifestyle.weebly.com",
    principle:
      meta.principle ??
      "Full publication stewardship — authenticity over modernization",
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
    authors: getMetalLifestyleAuthors(),
    categories: getMetalLifestyleCategories(),
    lastPreservationPass:
      meta.lastPreservationPass ??
      meta.polishedAt?.slice(0, 10) ??
      meta.generatedAt?.slice(0, 10) ??
      null,
  };
}

export function getMetalLifestylePost(
  slug: string,
): MetalLifestyleRecord | null {
  return readJson<MetalLifestyleRecord>(path.join(POSTS_DIR, `${slug}.json`));
}

export function getMetalLifestylePage(
  slug: string,
): MetalLifestyleRecord | null {
  return readJson<MetalLifestyleRecord>(path.join(PAGES_DIR, `${slug}.json`));
}

export function getMetalLifestylePageByHub(
  hub: string,
): MetalLifestyleRecord | null {
  return getMetalLifestylePage(hub);
}

export function listMetalLifestylePostSlugs(): string[] {
  const manifest = getMetalLifestyleManifest();
  if (manifest?.posts?.length) {
    return manifest.posts.map((p) => p.slug);
  }
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(/\.json$/, ""));
}

export function listMetalLifestylePageSlugs(): string[] {
  const manifest = getMetalLifestyleManifest();
  if (manifest?.pages?.length) {
    return manifest.pages.map((p) => p.slug);
  }
  if (!fs.existsSync(PAGES_DIR)) return [];
  return fs
    .readdirSync(PAGES_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(/\.json$/, ""));
}

export function getMetalLifestyleAuthors(): MetalLifestyleAuthor[] {
  return (
    readJson<MetalLifestyleAuthor[]>(AUTHORS_PATH) ??
    getMetalLifestyleManifest()?.authors ??
    []
  );
}

export function getMetalLifestyleAuthor(
  slug: string,
): MetalLifestyleAuthor | null {
  return getMetalLifestyleAuthors().find((a) => a.slug === slug) ?? null;
}

export function getMetalLifestyleCategories(): MetalLifestyleCategory[] {
  return (
    readJson<MetalLifestyleCategory[]>(CATEGORIES_PATH) ??
    getMetalLifestyleManifest()?.categories ??
    []
  );
}

export function getMetalLifestyleCategory(
  slug: string,
): MetalLifestyleCategory | null {
  return getMetalLifestyleCategories().find((c) => c.slug === slug) ?? null;
}

export const ML_POSTS_PER_PAGE = 10;

export function paginateMetalLifestylePosts(page: number): {
  posts: MetalLifestyleManifestEntry[];
  page: number;
  totalPages: number;
  total: number;
} {
  const manifest = getMetalLifestyleManifest();
  const all = (manifest?.posts ?? []).filter((p) => p.status !== "unavailable");
  const totalPages = Math.max(1, Math.ceil(all.length / ML_POSTS_PER_PAGE));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * ML_POSTS_PER_PAGE;
  return {
    posts: all.slice(start, start + ML_POSTS_PER_PAGE),
    page: safePage,
    totalPages,
    total: all.length,
  };
}

export function paginateSlugs(
  slugs: string[],
  page: number,
  perPage = ML_POSTS_PER_PAGE,
): {
  slugs: string[];
  page: number;
  totalPages: number;
  total: number;
} {
  const totalPages = Math.max(1, Math.ceil(slugs.length / perPage));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * perPage;
  return {
    slugs: slugs.slice(start, start + perPage),
    page: safePage,
    totalPages,
    total: slugs.length,
  };
}

export function resolveManifestPosts(
  slugs: string[],
): MetalLifestyleManifestEntry[] {
  const manifest = getMetalLifestyleManifest();
  if (!manifest) return [];
  const bySlug = new Map(manifest.posts.map((p) => [p.slug, p]));
  return slugs
    .map((s) => bySlug.get(s))
    .filter((p): p is MetalLifestyleManifestEntry => Boolean(p));
}

export function slugifyMetalLifestyleAuthor(name: string): string {
  return String(name)
    .trim()
    .toLowerCase()
    .replace(/\./g, "dot")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function slugifyMetalLifestyleCategory(name: string): string {
  return String(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
