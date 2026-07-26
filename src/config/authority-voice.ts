/**
 * Authority Record voice — bibliographic reference cards.
 * Quiet. Controlled. Never profile-page language.
 */

import type { AuthorityType } from "@/types/authority";

export const authorityTypeLabels: Record<AuthorityType, string> = {
  series: "Series",
  developer: "Developer",
  publisher: "Publisher",
  studio: "Studio",
  platform: "Platform",
  franchise: "Franchise",
  subject: "Subject",
  genre: "Genre",
  person: "Person",
  organization: "Organization",
  collection: "Collection",
};

export const authorityFields = {
  preferredName: "Preferred Name",
  alternativeNames: "Alternative Names",
  authorityIdentifier: "Authority Identifier",
  type: "Type",
  description: "Archival Description",
  establishedDate: "Established",
  relatedAuthorities: "Related Authorities",
  relatedHoldings: "Related Holdings",
  relatedLibraryEntries: "Related Library Entries",
  externalReferences: "External References",
  stewardshipHistory: "Stewardship History",
} as const;

export const authorityVoice = {
  name: "Authority Records",
  eyebrow: "Controlled Vocabulary",
  cardEyebrow: "Authority Record",
  description:
    "Canonical reference identities for the Bloodsoaked Archive — people, companies, series, platforms, and subjects described once and referenced everywhere.",
  emptyDescription: "An archival description has not yet been entered for this authority.",
  noRelatedEntries: "No Library accessions currently reference this authority.",
  noRelatedAuthorities: "No related authorities have been established.",
  noRelatedHoldings: "No related holdings have been established.",
  noExternalReferences: "No external references recorded.",
  backToLibrary: "← Library",
  lookupKind: "Authority Record",
  lookupEmpty: "No authority records matched that lookup.",
  relatedEntriesLead: "Accessions that intentionally reference this identity.",
  indexTitle: "Authority File",
  indexLead:
    "The controlled identities of the archive. Each card is a reference, not a holding.",
  indexEmpty: "No authority records have been filed.",
} as const;
