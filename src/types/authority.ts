/**
 * Authority Records — controlled identities shared across the archive.
 *
 * Not articles. Not holdings. Bibliographic reference cards that answer:
 * "What is this entity within the Bloodsoaked Archive?"
 *
 * Descriptions and relationships are curated. Never auto-generated.
 */

import type { LibraryStewardshipEvent } from "@/types/library";

export const AUTHORITY_TYPES = [
  "series",
  "developer",
  "publisher",
  "studio",
  "platform",
  "franchise",
  "subject",
  "genre",
  "person",
  "organization",
  "collection",
] as const;

export type AuthorityType = (typeof AUTHORITY_TYPES)[number];

export const AUTHORITY_VISIBILITY = ["published", "hidden"] as const;
export type AuthorityVisibility = (typeof AUTHORITY_VISIBILITY)[number];

export interface AuthorityExternalReference {
  label: string;
  url: string;
}

/**
 * Explicit authority references on a Library accession.
 * Slugs point at content/library/authorities/{slug}.json.
 * Relationships are established deliberately — never inferred from free text.
 */
export interface LibraryAuthorityReferences {
  developers?: string[];
  publishers?: string[];
  studios?: string[];
  platforms?: string[];
  series?: string[];
  franchises?: string[];
  subjects?: string[];
  genres?: string[];
  people?: string[];
  organizations?: string[];
  collections?: string[];
}

/** On-disk Authority Record. */
export interface AuthorityRecord {
  slug: string;
  /** Stable archive identifier — AUTH-NNNN */
  authorityId: string;
  type: AuthorityType;
  preferredName: string;
  alternativeNames?: string[];
  /**
   * Short archival description — curated prose only.
   * Prefer empty until a curator writes it.
   */
  description?: string;
  /** When the entity was established, if known (year or free archival date). */
  establishedDate?: string;
  /** Intentionally related Authority Record slugs. */
  relatedAuthoritySlugs?: string[];
  /** Intentionally related Collection holding ids. */
  relatedHoldingIds?: string[];
  externalReferences?: AuthorityExternalReference[];
  stewardshipHistory?: LibraryStewardshipEvent[];
  visibility: AuthorityVisibility;
  filedAt: string;
  curatorialRevisionAt?: string;
}

/** Presentation model for Authority reference cards. */
export interface AuthorityEntry {
  slug: string;
  authorityId: string;
  type: AuthorityType;
  typeLabel: string;
  preferredName: string;
  alternativeNames: string[];
  description?: string;
  establishedDate?: string;
  relatedAuthoritySlugs: string[];
  relatedHoldingIds: string[];
  externalReferences: AuthorityExternalReference[];
  stewardshipHistory: LibraryStewardshipEvent[];
  visibility: AuthorityVisibility;
  filedAt: string;
  curatorialRevisionAt?: string;
  href: string;
  /** Derived from Library accessions that explicitly reference this authority. */
  relatedLibraryEntries: AuthorityLibraryLink[];
  relatedAuthorities: AuthorityPeerLink[];
}

export interface AuthorityLibraryLink {
  slug: string;
  title: string;
  shelfMark: string;
  href: string;
  year?: number;
}

export interface AuthorityPeerLink {
  slug: string;
  preferredName: string;
  typeLabel: string;
  href: string;
}

export interface AuthorityShelfSummary {
  slug: string;
  authorityId: string;
  type: AuthorityType;
  preferredName: string;
  visibility: AuthorityVisibility;
  alternativeNames?: string[];
}

export interface AuthorityCatalogIndex {
  schemaVersion: number;
  authoritySlugs: string[];
  publishedSlugs?: string[];
  shelf?: Record<string, AuthorityShelfSummary>;
  updatedAt: string | null;
}

/** Catalog Lookup hit — distinguished as reference material. */
export interface AuthorityLookupResult {
  slug: string;
  authorityId: string;
  preferredName: string;
  typeLabel: string;
  href: string;
  kind: "authority";
}
