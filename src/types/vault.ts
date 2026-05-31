export const VAULT_MEDIA_TYPES = [
  "Game",
  "Film",
  "Music",
  "TV",
  "Book",
] as const;

export type VaultMediaType = (typeof VAULT_MEDIA_TYPES)[number];

export interface VaultEntry {
  title: string;
  mediaType: VaultMediaType;
  year: number;
  /** For albums and similar */
  artist?: string;
  note: string;
  vaultStatus?: string;
  coverArt?: string;
  /** Filename stem under public/images/vault/ when title slug is awkward */
  coverSlug?: string;
  articleSlug?: string;
  mediaLogSlug?: string;
}

export interface Vault {
  introduction: string | string[];
  rotatingNote?: string;
  entries: VaultEntry[];
}
