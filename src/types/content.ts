export const POST_TYPES = [
  "review",
  "essay",
  "retrospective",
  "collection",
  "editorial",
] as const;

export type PostType = (typeof POST_TYPES)[number];

export const CATEGORIES = [
  "games",
  "film",
  "television",
  "music",
  "culture",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const MEDIUMS = [
  "game",
  "film",
  "television",
  "music",
  "book",
  "culture",
] as const;

export type Medium = (typeof MEDIUMS)[number];

export const MOODS = [
  "Bleak",
  "Comforting",
  "Melancholic",
  "Cult Classic",
  "Obsessive",
  "Atmospheric",
  "Nostalgic",
  "Unsettling",
] as const;

export type Mood = (typeof MOODS)[number];

export const VERDICTS = [
  "Recommended",
  "Recommended With Caveats",
  "For Fans Only",
  "Not Recommended",
] as const;

export type Verdict = (typeof VERDICTS)[number];

export interface PostFrontmatter {
  title: string;
  subtitle?: string;
  date: string;
  excerpt: string;
  category: Category;
  type: PostType;
  tags: string[];
  medium: Medium;
  era: string;
  mood: Mood;
  featured?: boolean;
  editorPick?: boolean;
  inVault?: boolean;
  verdict?: Verdict;
  coverImage?: string;
  /** Optional external link shown in the article header (e.g. download / project page) */
  resourceLink?: { label: string; href: string };
  /** Optional companion note/link beside resourceLink (e.g. base game requirement) */
  requiresLink?: { label: string; href: string };
  authorNote?: string;
  /** Collection slugs — also auto-detected from collection JSON */
  collections?: string[];
  /** Legacy preservation — see content/legacy/ */
  legacy?: boolean;
  originalPublication?: string;
  originalPublicationDate?: string;
  originalSite?: string;
  originalUrl?: string;
  archiveEra?: string;
  author?: string;
  archiveDate?: string;
  restorationNote?: string;
}

export interface Post extends PostFrontmatter {
  slug: string;
  content: string;
  html: string;
  readingTime: string;
}

export interface PostMeta extends PostFrontmatter {
  slug: string;
  readingTime: string;
}
