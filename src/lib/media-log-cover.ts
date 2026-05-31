import fs from "fs";
import path from "path";
import type { MediaLogCoverLibraryEntry, MediaLogEntry } from "@/types/media-log";

const PUBLIC_DIR = path.join(process.cwd(), "public");
const COVER_DIR = path.join(PUBLIC_DIR, "images", "media-log");
const LIBRARY_PATH = path.join(
  process.cwd(),
  "content",
  "media-log",
  "cover-library.json",
);

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"] as const;

let coverLibraryCache: Record<string, MediaLogCoverLibraryEntry> | null = null;

function loadCoverLibrary(): Record<string, MediaLogCoverLibraryEntry> {
  if (coverLibraryCache) return coverLibraryCache;
  if (!fs.existsSync(LIBRARY_PATH)) {
    coverLibraryCache = {};
    return coverLibraryCache;
  }
  const raw = JSON.parse(fs.readFileSync(LIBRARY_PATH, "utf8")) as {
    entries?: Record<string, MediaLogCoverLibraryEntry>;
  };
  coverLibraryCache = raw.entries ?? {};
  return coverLibraryCache;
}

function findLocalCoverFile(slug: string): string | undefined {
  if (!fs.existsSync(COVER_DIR)) return undefined;
  for (const ext of IMAGE_EXTENSIONS) {
    const file = path.join(COVER_DIR, `${slug}${ext}`);
    if (fs.existsSync(file)) {
      return `/images/media-log/${slug}${ext}`;
    }
  }
  return undefined;
}

export function isRemoteCoverUrl(src: string): boolean {
  return /^https?:\/\//i.test(src);
}

function normalizePublicPath(src: string): string {
  return src.startsWith("/") ? src : `/${src}`;
}

/**
 * Cover resolution order:
 * 1. Entry coverArt (manual local)
 * 2. File in public/images/media-log/{slug}.{jpg,png,webp}
 * 3. Curated library local path or embed URL
 * 4. Entry coverEmbed (manual remote)
 */
export function resolveMediaLogCover(
  entry: Pick<MediaLogEntry, "coverArt" | "coverEmbed">,
  slug: string,
): string | undefined {
  if (entry.coverArt) {
    const normalized = normalizePublicPath(entry.coverArt);
    const diskPath = path.join(PUBLIC_DIR, normalized.replace(/^\//, ""));
    if (fs.existsSync(diskPath)) return normalized;
  }

  const localBySlug = findLocalCoverFile(slug);
  if (localBySlug) return localBySlug;

  const library = loadCoverLibrary()[slug];
  if (library?.local) {
    const normalized = normalizePublicPath(library.local);
    const diskPath = path.join(PUBLIC_DIR, normalized.replace(/^\//, ""));
    if (fs.existsSync(diskPath)) return normalized;
  }
  if (library?.embed) return library.embed;

  if (entry.coverEmbed) return entry.coverEmbed;

  return undefined;
}

export function getMediaLogCoverSrc(
  entry: Pick<MediaLogEntry, "coverArt" | "coverEmbed" | "coverSrc">,
): string | undefined {
  return entry.coverSrc;
}
