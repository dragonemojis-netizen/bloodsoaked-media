import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { resolveMediaLogCover } from "@/lib/media-log-cover";
import type { MediaLogEntry, MediaLogYearArchive } from "@/types/media-log";

const MEDIA_LOG_DIR = path.join(process.cwd(), "content", "media-log");
const EDITORIAL_DIR = path.join(process.cwd(), "content", "editorial");

function getSlugs(): string[] {
  if (!fs.existsSync(MEDIA_LOG_DIR)) return [];
  return fs
    .readdirSync(MEDIA_LOG_DIR)
    .filter((file) => file.endsWith(".md") && !file.startsWith("_"))
    .map((file) => file.replace(/\.md$/, ""));
}

function normalizeTags(raw: unknown): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.map((t) => String(t).trim()).filter(Boolean);
  }
  if (typeof raw === "string") {
    return raw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }
  return [];
}

function sortEntries(entries: MediaLogEntry[]): MediaLogEntry[] {
  return [...entries].sort((a, b) => {
    const yearA = a.logYear ?? 0;
    const yearB = b.logYear ?? 0;
    if (yearB !== yearA) return yearB - yearA;

    const orderA = a.archiveOrder ?? Number.MAX_SAFE_INTEGER;
    const orderB = b.archiveOrder ?? Number.MAX_SAFE_INTEGER;
    if (orderA !== orderB) return orderA - orderB;

    if (a.date && b.date) {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    if (a.date) return -1;
    if (b.date) return 1;

    return a.title.localeCompare(b.title);
  });
}

export function getMediaLogEntry(slug: string): MediaLogEntry | null {
  const filePath = path.join(MEDIA_LOG_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;

  const { data } = matter(fs.readFileSync(filePath, "utf8"));

  const entry: MediaLogEntry = {
    slug,
    title: data.title,
    date: data.date ? String(data.date) : undefined,
    mediaType: data.mediaType,
    platform: data.platform ? String(data.platform) : undefined,
    status: data.status,
    notes: data.notes ?? "",
    coverArt: data.coverArt ? String(data.coverArt) : undefined,
    coverEmbed: data.coverEmbed ? String(data.coverEmbed) : undefined,
    tags: normalizeTags(data.tags),
    reviewSlug: data.reviewSlug,
    score: data.score != null ? Number(data.score) : undefined,
    platinumNumber:
      data.platinumNumber != null ? Number(data.platinumNumber) : undefined,
    isReplay: data.isReplay === true,
    logYear: data.logYear != null ? Number(data.logYear) : undefined,
    archiveOrder:
      data.archiveOrder != null ? Number(data.archiveOrder) : undefined,
  };

  entry.coverSrc = resolveMediaLogCover(entry, slug);
  return entry;
}

export function getAllMediaLogEntries(): MediaLogEntry[] {
  const entries = getSlugs()
    .map((slug) => getMediaLogEntry(slug))
    .filter((e): e is MediaLogEntry => e !== null);

  return sortEntries(entries);
}

export function getRecentMediaLogEntries(limit = 5): MediaLogEntry[] {
  return getAllMediaLogEntries().slice(0, limit);
}

export function getMediaLogYearArchive(year: number): MediaLogYearArchive | null {
  const filePath = path.join(EDITORIAL_DIR, `media-log-${year}.json`);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as MediaLogYearArchive;
}
