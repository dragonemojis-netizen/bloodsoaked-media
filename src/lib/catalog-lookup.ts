/**
 * Catalog Lookup — holdings facet for the public Library stacks.
 * Published Collection records only; Pipeline Steam imports stay out of public lookup.
 */

import {
  getAllCollectionArchiveRecords,
  getCollectionSpecimenHref,
} from "@/lib/collection-archive";

export interface CatalogHoldingLookupResult {
  id: string;
  title: string;
  href: string;
  meta: string;
  kind: "holding";
  searchHaystack?: string;
}

export function listPublishedCatalogHoldings(): CatalogHoldingLookupResult[] {
  return getAllCollectionArchiveRecords()
    .filter(
      (record) =>
        record.visibility === "published" &&
        !record.tombstone &&
        record.origin !== "development" &&
        record.origin !== "steam",
    )
    .sort((a, b) => a.title.localeCompare(b.title))
    .map((record) => ({
      id: record.id,
      title: record.title,
      href: getCollectionSpecimenHref(record.id),
      meta: "Collection holding",
      kind: "holding" as const,
      searchHaystack: [
        record.id,
        record.title,
        record.filing?.shelfMark,
        record.filing?.librarySlug,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase(),
    }));
}

export function searchCatalogHoldings(
  query: string,
  limit = 12,
): CatalogHoldingLookupResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  return listPublishedCatalogHoldings()
    .filter((record) =>
      (record.searchHaystack ?? record.title.toLowerCase()).includes(q),
    )
    .slice(0, limit);
}
