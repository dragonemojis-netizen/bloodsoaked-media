/**
 * Authority Records — loaders, reverse index, and catalog lookup.
 */

import fs from "fs";
import path from "path";
import { authorityTypeLabels } from "@/config/authority-voice";
import { sortStewardshipHistory } from "@/lib/library-stewardship-history";
import {
  getAllLibraryRecords,
  getLibraryEntryHref,
} from "@/lib/library";
import type {
  AuthorityCatalogIndex,
  AuthorityEntry,
  AuthorityLibraryLink,
  AuthorityLookupResult,
  AuthorityPeerLink,
  AuthorityRecord,
  AuthorityShelfSummary,
  AuthorityType,
  LibraryAuthorityReferences,
} from "@/types/authority";
import { AUTHORITY_TYPES } from "@/types/authority";
import type { LibraryRecord } from "@/types/library";

const AUTHORITIES_DIR = path.join(
  process.cwd(),
  "content",
  "library",
  "authorities",
);
const INDEX_PATH = path.join(AUTHORITIES_DIR, "index.json");
const AUTHORITY_INDEX_SCHEMA_VERSION = 1;

export function getAuthorityHref(slug: string): string {
  return `/library/authorities/${encodeURIComponent(slug)}`;
}

export function getAuthorityTypeLabel(type: AuthorityType): string {
  return authorityTypeLabels[type] ?? type;
}

function listAuthoritySlugsFromDisk(): string[] {
  if (!fs.existsSync(AUTHORITIES_DIR)) return [];
  return fs
    .readdirSync(AUTHORITIES_DIR)
    .filter((file) => file.endsWith(".json") && file !== "index.json")
    .map((file) => file.replace(/\.json$/, ""))
    .sort();
}

export function getAuthorityRecord(slug: string): AuthorityRecord | null {
  const filePath = path.join(AUTHORITIES_DIR, `${slug}.json`);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as AuthorityRecord;
}

export function getAllAuthorityRecords(): AuthorityRecord[] {
  return listAuthoritySlugsFromDisk()
    .map((slug) => getAuthorityRecord(slug))
    .filter((record): record is AuthorityRecord => record !== null);
}

function isPublishedAuthority(record: AuthorityRecord): boolean {
  return record.visibility === "published";
}

function toShelfSummary(record: AuthorityRecord): AuthorityShelfSummary {
  return {
    slug: record.slug,
    authorityId: record.authorityId,
    type: record.type,
    preferredName: record.preferredName,
    visibility: record.visibility,
    alternativeNames: record.alternativeNames,
  };
}

/** Collect every authority slug explicitly referenced by a Library accession. */
export function listAuthoritySlugsFromReferences(
  refs?: LibraryAuthorityReferences,
): string[] {
  if (!refs) return [];
  const slugs = new Set<string>();
  for (const key of Object.keys(refs) as (keyof LibraryAuthorityReferences)[]) {
    for (const slug of refs[key] ?? []) {
      if (slug.trim()) slugs.add(slug.trim());
    }
  }
  return [...slugs];
}

/**
 * Reverse index: authority slug → Library accessions that reference it.
 * Derived only from explicit `authorities` fields — never from free-text catalog.
 */
export function buildAuthorityLibraryIndex(
  libraryRecords: LibraryRecord[] = getAllLibraryRecords(),
  options: { includeUnpublished?: boolean } = {},
): Map<string, AuthorityLibraryLink[]> {
  const index = new Map<string, AuthorityLibraryLink[]>();
  const includeUnpublished = options.includeUnpublished === true;

  for (const record of libraryRecords) {
    if (!includeUnpublished && record.visibility !== "published") continue;

    const slugs = listAuthoritySlugsFromReferences(record.authorities);
    if (slugs.length === 0) continue;

    const link: AuthorityLibraryLink = {
      slug: record.slug,
      title: record.title,
      shelfMark: record.shelfMark ?? record.slug,
      href: getLibraryEntryHref(record.slug),
      year: record.year,
    };

    for (const authoritySlug of slugs) {
      const list = index.get(authoritySlug) ?? [];
      if (!list.some((item) => item.slug === link.slug)) {
        list.push(link);
        index.set(authoritySlug, list);
      }
    }
  }

  for (const [key, list] of index) {
    list.sort((a, b) => {
      const yearA = a.year ?? Number.POSITIVE_INFINITY;
      const yearB = b.year ?? Number.POSITIVE_INFINITY;
      if (yearA !== yearB) return yearA - yearB;
      return a.shelfMark.localeCompare(b.shelfMark);
    });
    index.set(key, list);
  }

  return index;
}

function resolvePeerLinks(
  slugs: string[],
  all: Map<string, AuthorityRecord>,
): AuthorityPeerLink[] {
  return slugs
    .map((slug) => all.get(slug))
    .filter((record): record is AuthorityRecord => record != null)
    .map((record) => ({
      slug: record.slug,
      preferredName: record.preferredName,
      typeLabel: getAuthorityTypeLabel(record.type),
      href: getAuthorityHref(record.slug),
    }));
}

export function toAuthorityEntry(
  record: AuthorityRecord,
  libraryIndex?: Map<string, AuthorityLibraryLink[]>,
  allRecords?: Map<string, AuthorityRecord>,
): AuthorityEntry {
  const bySlug =
    allRecords ??
    new Map(getAllAuthorityRecords().map((item) => [item.slug, item]));
  const reverse = libraryIndex ?? buildAuthorityLibraryIndex();

  return {
    slug: record.slug,
    authorityId: record.authorityId,
    type: record.type,
    typeLabel: getAuthorityTypeLabel(record.type),
    preferredName: record.preferredName,
    alternativeNames: record.alternativeNames ?? [],
    description: record.description,
    establishedDate: record.establishedDate,
    relatedAuthoritySlugs: record.relatedAuthoritySlugs ?? [],
    relatedHoldingIds: record.relatedHoldingIds ?? [],
    externalReferences: record.externalReferences ?? [],
    stewardshipHistory: sortStewardshipHistory(record.stewardshipHistory ?? []),
    visibility: record.visibility,
    filedAt: record.filedAt,
    curatorialRevisionAt: record.curatorialRevisionAt,
    href: getAuthorityHref(record.slug),
    relatedLibraryEntries: reverse.get(record.slug) ?? [],
    relatedAuthorities: resolvePeerLinks(
      record.relatedAuthoritySlugs ?? [],
      bySlug,
    ),
  };
}

export function getAuthorityEntry(slug: string): AuthorityEntry | null {
  const record = getAuthorityRecord(slug);
  if (!record) return null;
  return toAuthorityEntry(record);
}

export function getPublishedAuthorityEntries(): AuthorityEntry[] {
  const records = getAllAuthorityRecords().filter(isPublishedAuthority);
  const allBySlug = new Map(
    getAllAuthorityRecords().map((r) => [r.slug, r]),
  );
  const libraryIndex = buildAuthorityLibraryIndex();
  return records
    .map((record) => toAuthorityEntry(record, libraryIndex, allBySlug))
    .sort((a, b) => a.preferredName.localeCompare(b.preferredName));
}

export function getPublishedAuthoritySlugs(): string[] {
  return getAllAuthorityRecords()
    .filter(isPublishedAuthority)
    .map((r) => r.slug)
    .sort();
}

/**
 * Resolve display value + optional authority href for a catalog field.
 * Prefers explicit authority preferred names when references exist.
 */
export function resolveAuthorityField(
  refs: string[] | undefined,
  fallbackText?: string,
): { value: string; href?: string; segments: Array<{ text: string; href?: string }> } {
  const slugs = refs?.filter(Boolean) ?? [];
  if (slugs.length === 0) {
    const value = fallbackText?.trim() ?? "";
    return { value, segments: value ? [{ text: value }] : [] };
  }

  const segments = slugs.map((slug) => {
    const record = getAuthorityRecord(slug);
    return {
      text: record?.preferredName ?? slug,
      href: record ? getAuthorityHref(slug) : undefined,
    };
  });

  return {
    value: segments.map((s) => s.text).join(" · "),
    href: segments.length === 1 ? segments[0]?.href : undefined,
    segments,
  };
}

/** Catalog Lookup across Authority Records (published only). */
export function searchAuthorityRecords(
  query: string,
  limit = 12,
): AuthorityLookupResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  return getAllAuthorityRecords()
    .filter(isPublishedAuthority)
    .filter((record) => {
      const haystack = [
        record.preferredName,
        record.authorityId,
        record.slug,
        record.type,
        getAuthorityTypeLabel(record.type),
        ...(record.alternativeNames ?? []),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    })
    .sort((a, b) => a.preferredName.localeCompare(b.preferredName))
    .slice(0, limit)
    .map((record) => ({
      slug: record.slug,
      authorityId: record.authorityId,
      preferredName: record.preferredName,
      typeLabel: getAuthorityTypeLabel(record.type),
      href: getAuthorityHref(record.slug),
      kind: "authority" as const,
    }));
}

export function rebuildAuthorityCatalogIndex(): AuthorityCatalogIndex {
  const records = getAllAuthorityRecords().sort((a, b) =>
    a.slug.localeCompare(b.slug),
  );
  const shelf: Record<string, AuthorityShelfSummary> = {};
  for (const record of records) {
    shelf[record.slug] = toShelfSummary(record);
  }

  const index: AuthorityCatalogIndex = {
    schemaVersion: AUTHORITY_INDEX_SCHEMA_VERSION,
    authoritySlugs: records.map((r) => r.slug),
    publishedSlugs: records.filter(isPublishedAuthority).map((r) => r.slug),
    shelf,
    updatedAt: new Date().toISOString(),
  };

  fs.mkdirSync(AUTHORITIES_DIR, { recursive: true });
  fs.writeFileSync(INDEX_PATH, `${JSON.stringify(index, null, 2)}\n`, "utf8");
  return index;
}

export function isAuthorityType(value: string): value is AuthorityType {
  return (AUTHORITY_TYPES as readonly string[]).includes(value);
}
