import fs from "fs";
import path from "path";
import { isLegacyOnlyCollection } from "@/lib/legacy-gate";
import { isArchivesLocal } from "@/lib/archives-gate";
import type { Collection } from "@/types/collection";

const COLLECTIONS_DIR = path.join(process.cwd(), "content", "collections");

function getSlugs(): string[] {
  if (!fs.existsSync(COLLECTIONS_DIR)) return [];
  return fs
    .readdirSync(COLLECTIONS_DIR)
    .filter((file) => file.endsWith(".json") && !file.startsWith("_"))
    .map((file) => file.replace(/\.json$/, ""));
}

export function getCollection(slug: string): Collection | null {
  const filePath = path.join(COLLECTIONS_DIR, `${slug}.json`);
  if (!fs.existsSync(filePath)) return null;

  const raw = JSON.parse(fs.readFileSync(filePath, "utf8")) as Omit<
    Collection,
    "slug"
  >;

  return {
    slug,
    title: raw.title,
    description: raw.description,
    personalNote: raw.personalNote,
    coverImage: raw.coverImage,
    catalogued: raw.catalogued,
    articleSlugs: raw.articleSlugs ?? [],
    mediaLogSlugs: raw.mediaLogSlugs ?? [],
    items: raw.items ?? [],
  };
}

export function getAllCollections(): Collection[] {
  return getSlugs()
    .map((slug) => getCollection(slug))
    .filter((c): c is Collection => c !== null)
    .filter((c) => {
      if (isLegacyOnlyCollection(c.slug) && !isArchivesLocal()) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      const dateA = a.catalogued ? new Date(a.catalogued).getTime() : 0;
      const dateB = b.catalogued ? new Date(b.catalogued).getTime() : 0;
      return dateB - dateA;
    });
}

export function getRecentlyCataloguedCollection(): Collection | null {
  const all = getAllCollections();
  return all[0] ?? null;
}

export function getCollectionsForArticle(articleSlug: string): Collection[] {
  return getAllCollections().filter(
    (c) => c.articleSlugs?.includes(articleSlug) ?? false,
  );
}
