import fs from "fs";
import path from "path";

const PUBLIC_DIR = path.join(process.cwd(), "public");
const COVER_DIR = path.join(PUBLIC_DIR, "images", "vault");
const LIBRARY_PATH = path.join(process.cwd(), "content", "vault-cover-library.json");

/** Prefer Wikipedia-fetched JPG over legacy manual PNG */
const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".webp", ".png"] as const;

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[():]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function loadLibrary(): Record<string, { local?: string; wikipedia?: string }> {
  if (!fs.existsSync(LIBRARY_PATH)) return {};
  const raw = JSON.parse(fs.readFileSync(LIBRARY_PATH, "utf8")) as {
    entries?: Record<string, { local?: string; wikipedia?: string }>;
  };
  return raw.entries ?? {};
}

function findLocalCover(slug: string): string | undefined {
  if (!fs.existsSync(COVER_DIR)) return undefined;
  for (const ext of IMAGE_EXTENSIONS) {
    const file = path.join(COVER_DIR, `${slug}${ext}`);
    if (fs.existsSync(file)) return `/images/vault/${slug}${ext}`;
  }
  return undefined;
}

export function resolveVaultCover(
  title: string,
  coverArt?: string,
  coverSlug?: string,
): string | undefined {
  if (coverArt) {
    const normalized = coverArt.startsWith("/") ? coverArt : `/${coverArt}`;
    const disk = path.join(PUBLIC_DIR, normalized.replace(/^\//, ""));
    if (fs.existsSync(disk)) return normalized;
  }

  const slug = coverSlug ?? slugify(title);
  const local = findLocalCover(slug);
  if (local) return local;

  const lib = loadLibrary()[slug];
  if (lib?.local) {
    const normalized = lib.local.startsWith("/") ? lib.local : `/${lib.local}`;
    const disk = path.join(PUBLIC_DIR, normalized.replace(/^\//, ""));
    if (fs.existsSync(disk)) return normalized;
  }

  return undefined;
}
