import fs from "fs";
import path from "path";
import {
  getMetalLifestyleAuthors,
  getMetalLifestyleCategories,
  getMetalLifestyleManifest,
  type MetalLifestyleAuthor,
  type MetalLifestyleManifestEntry,
} from "@/lib/metal-lifestyle-archive";
import { METAL_LIFESTYLE_BASE } from "@/config/metal-lifestyle";

const MEDIA_DIR = path.join(
  process.cwd(),
  "public/images/archives/metal-lifestyle/media",
);

export interface MetalLifestyleCatalogStats {
  /** Collection title as held */
  collectionTitle: string;
  /** Holding institution */
  holdingInstitution: string;
  /** Original publication host */
  originalSite: string;
  /** Form/genre of the material */
  form: string;
  publicationYears: string;
  yearStart: number | null;
  yearEnd: number | null;
  articlesRestored: number;
  articlesTotal: number;
  articlesUnavailable: number;
  pagesRestored: number;
  pagesTotal: number;
  pagesUnavailable: number;
  pagesThin: number;
  mediaAssets: number;
  /** Restored records / all article+page records */
  restorationPercent: number;
  restorationStatus: string;
  preservationSeal: string | null;
  sealedAt: string | null;
  lastPreservationPass: string | null;
  authors: number;
  authorsWithBiography: number;
  categories: number;
  briefHistory: string;
}

export interface TimelineMonth {
  key: string; // YYYY-MM
  year: number;
  month: number;
  label: string;
  posts: MetalLifestyleManifestEntry[];
}

export interface TimelineYear {
  year: number;
  months: TimelineMonth[];
  articleCount: number;
}

export interface SeriesEntry {
  slug: string;
  kind: "post" | "page";
  title: string;
  publicationDate: string | null;
}

export interface DetectedSeries {
  slug: string;
  title: string;
  description: string;
  /** Chronological entries (newest first) — posts and section pages */
  entries: SeriesEntry[];
  articleSlugs: string[];
  articleCount: number;
}

export interface SeriesMembership {
  series: DetectedSeries;
  /** Entries immediately before/after this piece in chronological order (oldest→newest) */
  nearby: SeriesEntry[];
  position: number;
  total: number;
}

export interface RelatedReadingItem {
  slug: string;
  title: string;
  reason: string;
  publicationDate?: string | null;
  author?: string | null;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const SERIES_RULES: Array<{
  slug: string;
  title: string;
  description: string;
  /** Minimum matched pieces to publish as a series (default 2) */
  minCount?: number;
  matchPost?: (post: MetalLifestyleManifestEntry) => boolean;
  matchPage?: (page: MetalLifestyleManifestEntry) => boolean;
}> = [
  // Documented editorial sections (Weebly hubs + nested pages / related posts)
  {
    slug: "american-metalcore-project",
    title: "American Metalcore Project",
    description:
      "A recurring Metal Lifestyle section documenting American metalcore history and related features.",
    minCount: 1,
    matchPage: (p) =>
      p.slug === "american-metalcore-project" ||
      p.slug.startsWith("american-metalcore-project--"),
    matchPost: (p) => /american metalcore project/i.test(p.title),
  },
  {
    slug: "prisms",
    title: "Prisms: Local Show Recap",
    description:
      "Recurring live show documentation filed under Prisms.",
    minCount: 1,
    matchPage: (p) =>
      p.slug === "prisms-local-show-recap" ||
      p.slug.startsWith("prisms-local-show-recap--") ||
      p.slug.startsWith("prisms-local-show-reviews--"),
    matchPost: (p) => /^prisms\b|prisms:/i.test(p.title),
  },
  {
    slug: "curtains",
    title: "Curtains: Movie & TV Reviews",
    description:
      "Recurring film and television coverage published under Curtains.",
    minCount: 1,
    matchPage: (p) =>
      p.slug === "curtains-movie--tv-reviews" ||
      p.slug.startsWith("curtains-movie--tv-reviews--"),
    matchPost: (p) => /curtains/i.test(p.title),
  },
  {
    slug: "gaming-corner",
    title: "Gaming Corner",
    description:
      "Recurring video game writing hosted in Gaming Corner.",
    minCount: 1,
    matchPage: (p) =>
      p.slug === "gaming-corner" || p.slug.startsWith("gaming-corner--"),
    matchPost: (p) => /gaming corner/i.test(p.title),
  },
  {
    slug: "fear",
    title: "FEAR: Short Horror Tales from the Team",
    description:
      "Recurring short horror writing filed under FEAR.",
    minCount: 1,
    matchPage: (p) =>
      p.slug === "fear-short-horror-tales-from-the-team" ||
      p.slug.startsWith("fear-short-horror-tales-from-the-team--"),
    matchPost: (p) => /\bfear\b/i.test(p.title) && /horror|tale/i.test(p.title),
  },
  {
    slug: "dysphoria",
    title: "Dysphoria",
    description: "Recurring Dysphoria section features from the original site.",
    minCount: 1,
    matchPage: (p) =>
      p.slug === "dysphoria" || p.slug.startsWith("dysphoria--"),
  },
  // Blog column formats
  {
    slug: "album-reviews",
    title: "Album & EP Reviews",
    description: "Recurring review column pieces titled Review: …",
    matchPost: (p) => /^review:/i.test(p.title),
  },
  {
    slug: "single-reviews",
    title: "Single Reviews",
    description: "Recurring single-review format.",
    matchPost: (p) => /^single review:/i.test(p.title),
  },
  {
    slug: "group-reviews",
    title: "Group Reviews",
    description: "Multi-contributor group review features.",
    matchPost: (p) => /^group review:/i.test(p.title),
  },
  {
    slug: "alex-brown-year-end",
    title: "Alex Brown — Year-End & Lists",
    description: "Recurring year-end and ranked lists by Alex Brown.",
    matchPost: (p) =>
      /alex brown/i.test(p.title) &&
      /top\s+ten|top\s+10|top\s+25|final review/i.test(p.title),
  },
  {
    slug: "dakota-year-end",
    title: "Dakota — Year-End Lists",
    description: "Year-end album lists filed under Dakota bylines.",
    matchPost: (p) =>
      /dakota/i.test(p.title) && /top\s+ten|albums of/i.test(p.title),
  },
  {
    slug: "side-gallery",
    title: "The Side Gallery",
    description: "Recurring Side Gallery features.",
    matchPost: (p) => /side gallery/i.test(p.title),
  },
  {
    slug: "versus-match",
    title: "Versus Match",
    description: "Versus Match comparison columns.",
    matchPost: (p) => /versus match/i.test(p.title),
  },
  {
    slug: "interviews",
    title: "Interviews",
    description: "Interview features and related conversation pieces.",
    matchPost: (p) => /interview/i.test(p.title),
  },
];

function countMediaFiles(): number {
  if (!fs.existsSync(MEDIA_DIR)) return 0;
  return fs.readdirSync(MEDIA_DIR).filter((f) => !f.startsWith(".")).length;
}

function readPreservationSeal(): {
  status: string | null;
  sealedAt: string | null;
} {
  const lockPath = path.join(
    process.cwd(),
    "content/archives/metal-lifestyle/PRESERVATION.lock.json",
  );
  if (!fs.existsSync(lockPath)) return { status: null, sealedAt: null };
  try {
    const lock = JSON.parse(fs.readFileSync(lockPath, "utf8")) as {
      status?: string;
      sealedAt?: string;
      sealed?: boolean;
    };
    return {
      status: lock.status ?? (lock.sealed ? "sealed" : null),
      sealedAt: lock.sealedAt ?? null,
    };
  } catch {
    return { status: null, sealedAt: null };
  }
}

/** Catalog holdings derived from the authoritative on-disk archive index. */
export function getMetalLifestyleCatalogStats(): MetalLifestyleCatalogStats | null {
  const manifest = getMetalLifestyleManifest();
  if (!manifest) return null;

  const posts = manifest.posts ?? [];
  const pages = manifest.pages ?? [];
  const restoredPosts = posts.filter((p) => p.status === "restored");
  const unavailablePosts = posts.filter((p) => p.status === "unavailable");
  const restoredPages = pages.filter(
    (p) => p.status === "restored" || p.status === "thin",
  );
  const unavailablePages = pages.filter((p) => p.status === "unavailable");
  const thinPages = pages.filter((p) => p.status === "thin");

  const dated = restoredPosts
    .map((p) => p.publicationDate)
    .filter((d): d is string => Boolean(d));
  const years = dated
    .map((d) => Number(d.slice(0, 4)))
    .filter((y) => !Number.isNaN(y));
  const yearStart = years.length ? Math.min(...years) : null;
  const yearEnd = years.length ? Math.max(...years) : null;

  const totalRecords = posts.length + pages.length;
  const recovered = restoredPosts.length + restoredPages.length;
  const restorationPercent =
    totalRecords > 0
      ? Math.round((recovered / totalRecords) * 1000) / 10
      : 0;

  let restorationStatus = "Partial recovery";
  const seal = readPreservationSeal();
  if (seal.status) {
    restorationStatus = "Historically complete (recoverable corpus)";
  } else if (restorationPercent >= 95) {
    restorationStatus = "Stable preservation";
  } else if (restorationPercent >= 70) {
    restorationStatus = "Substantial recovery";
  }

  const publicationYears =
    yearStart && yearEnd
      ? yearStart === yearEnd
        ? String(yearStart)
        : `${yearStart}–${yearEnd}`
      : "Unknown";

  const authors = getMetalLifestyleAuthors();

  return {
    collectionTitle: "Metal Lifestyle",
    holdingInstitution: "Bloodsoaked Media — The Archives",
    originalSite: manifest.sourceSite,
    form: "Independent online publication (Weebly), preserved as a digital special collection",
    publicationYears,
    yearStart,
    yearEnd,
    articlesRestored: restoredPosts.length,
    articlesTotal: posts.length,
    articlesUnavailable: unavailablePosts.length,
    pagesRestored: restoredPages.length,
    pagesTotal: pages.length,
    pagesUnavailable: unavailablePages.length,
    pagesThin: thinPages.length,
    mediaAssets: countMediaFiles(),
    restorationPercent,
    restorationStatus,
    preservationSeal: seal.status,
    sealedAt: seal.sealedAt,
    lastPreservationPass:
      manifest.lastPreservationPass ??
      manifest.polishedAt?.slice(0, 10) ??
      manifest.generatedAt?.slice(0, 10) ??
      null,
    authors: authors.length,
    authorsWithBiography: authors.filter((a) => Boolean(a.biography)).length,
    categories: getMetalLifestyleCategories().length,
    briefHistory:
      "Metal Lifestyle was an independent music publication covering heavy music, interviews, reviews, live coverage, and adjacent media during its original Weebly run. This archive preserves recoverable pages and articles as historical artifacts — not as a redesigned successor.",
  };
}

export function getMetalLifestyleTimeline(): TimelineYear[] {
  const manifest = getMetalLifestyleManifest();
  if (!manifest) return [];

  const byMonth = new Map<string, MetalLifestyleManifestEntry[]>();
  for (const post of manifest.posts) {
    if (!post.publicationDate) continue;
    if (post.status === "unavailable") continue;
    const key = post.publicationDate.slice(0, 7); // YYYY-MM
    if (!/^\d{4}-\d{2}$/.test(key)) continue;
    if (!byMonth.has(key)) byMonth.set(key, []);
    byMonth.get(key)!.push(post);
  }

  const years = new Map<number, TimelineYear>();
  for (const [key, posts] of [...byMonth.entries()].sort((a, b) =>
    b[0].localeCompare(a[0]),
  )) {
    const year = Number(key.slice(0, 4));
    const month = Number(key.slice(5, 7));
    if (!years.has(year)) {
      years.set(year, { year, months: [], articleCount: 0 });
    }
    const entry = years.get(year)!;
    const sorted = [...posts].sort((a, b) =>
      (b.publicationDate || "").localeCompare(a.publicationDate || ""),
    );
    entry.months.push({
      key,
      year,
      month,
      label: MONTH_NAMES[month - 1] ?? key,
      posts: sorted,
    });
    entry.articleCount += sorted.length;
  }

  return [...years.values()].sort((a, b) => b.year - a.year);
}

export function detectMetalLifestyleSeries(): DetectedSeries[] {
  const manifest = getMetalLifestyleManifest();
  if (!manifest) return [];

  const posts = (manifest.posts ?? []).filter((p) => p.status !== "unavailable");
  const pages = (manifest.pages ?? []).filter((p) => p.status !== "unavailable");
  const series: DetectedSeries[] = [];

  for (const rule of SERIES_RULES) {
    const matched: SeriesEntry[] = [];
    if (rule.matchPost) {
      for (const p of posts) {
        if (rule.matchPost(p)) {
          matched.push({
            slug: p.slug,
            kind: "post",
            title: p.title,
            publicationDate: p.publicationDate ?? null,
          });
        }
      }
    }
    if (rule.matchPage) {
      for (const p of pages) {
        if (rule.matchPage(p)) {
          matched.push({
            slug: p.slug,
            kind: "page",
            title: p.title,
            publicationDate: p.publicationDate ?? null,
          });
        }
      }
    }

    const min = rule.minCount ?? 2;
    if (matched.length < min) continue;

    // Newest first for listings
    matched.sort((a, b) =>
      (b.publicationDate || "").localeCompare(a.publicationDate || ""),
    );

    series.push({
      slug: rule.slug,
      title: rule.title,
      description: rule.description,
      entries: matched,
      articleSlugs: matched.map((e) => e.slug),
      articleCount: matched.length,
    });
  }

  return series.sort((a, b) => b.articleCount - a.articleCount);
}

export function getMetalLifestyleSeries(slug: string): DetectedSeries | null {
  return detectMetalLifestyleSeries().find((s) => s.slug === slug) ?? null;
}

/**
 * Series membership for a preserved post or page.
 * Used for stewardship discoverability chrome — not historical content.
 */
export function getSeriesMembership(
  slug: string,
  kind: "post" | "page" = "post",
): SeriesMembership | null {
  const series = detectMetalLifestyleSeries().find((s) =>
    s.entries.some((e) => e.slug === slug && e.kind === kind),
  );
  if (!series) return null;

  // Chronological oldest → newest for neighbor navigation
  const chronological = [...series.entries].sort((a, b) =>
    (a.publicationDate || "9999").localeCompare(b.publicationDate || "9999"),
  );
  const index = chronological.findIndex(
    (e) => e.slug === slug && e.kind === kind,
  );
  if (index < 0) return null;

  const nearby: SeriesEntry[] = [];
  if (index > 0) nearby.push(chronological[index - 1]);
  if (index < chronological.length - 1) nearby.push(chronological[index + 1]);

  return {
    series,
    nearby,
    position: index + 1,
    total: chronological.length,
  };
}

export function seriesEntryHref(entry: SeriesEntry): string {
  return entry.kind === "page"
    ? `${METAL_LIFESTYLE_BASE}/page/${entry.slug}`
    : `${METAL_LIFESTYLE_BASE}/post/${entry.slug}`;
}

export function expandMetalLifestyleAuthor(author: MetalLifestyleAuthor) {
  const manifest = getMetalLifestyleManifest();
  const posts = (manifest?.posts ?? []).filter(
    (p) => p.author === author.name && p.status !== "unavailable",
  );
  const dated = posts
    .map((p) => p.publicationDate)
    .filter((d): d is string => Boolean(d))
    .sort();
  const categories = [
    ...new Set(
      posts.map((p) => p.category).filter((c): c is string => Boolean(c)),
    ),
  ].sort();

  return {
    ...author,
    firstPublication: dated[0] ?? null,
    lastPublication: dated[dated.length - 1] ?? null,
    categories,
  };
}

export function getRelatedReading(
  slug: string,
  limit = 6,
): RelatedReadingItem[] {
  const manifest = getMetalLifestyleManifest();
  const current = manifest?.posts.find((p) => p.slug === slug);
  if (!current || !manifest) return [];

  const series = detectMetalLifestyleSeries().find((s) =>
    s.entries.some((e) => e.slug === slug && e.kind === "post"),
  );
  const candidates = manifest.posts.filter(
    (p) => p.slug !== slug && p.status !== "unavailable",
  );

  const scored: Array<RelatedReadingItem & { score: number }> = [];

  for (const p of candidates) {
    let score = 0;
    const reasons: string[] = [];

    if (current.author && p.author === current.author) {
      score += 5;
      reasons.push("same author");
    }
    if (current.category && p.category === current.category) {
      score += 3;
      reasons.push("same category");
    }
    if (series?.articleSlugs.includes(p.slug)) {
      score += 4;
      reasons.push("same series");
    }
    if (current.publicationDate && p.publicationDate) {
      const cy = current.publicationDate.slice(0, 4);
      const cm = current.publicationDate.slice(0, 7);
      if (p.publicationDate.slice(0, 7) === cm) {
        score += 3;
        reasons.push("same month");
      } else if (p.publicationDate.slice(0, 4) === cy) {
        score += 2;
        reasons.push("same year");
      }
    }
    // Shared distinctive title tokens (event-ish)
    const curTokens = new Set(
      current.title
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter((t) => t.length > 4),
    );
    const shared = p.title
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((t) => t.length > 4 && curTokens.has(t));
    if (shared.length >= 2) {
      score += 2;
      reasons.push("related coverage");
    }

    if (score > 0) {
      scored.push({
        slug: p.slug,
        title: p.title,
        publicationDate: p.publicationDate,
        author: p.author,
        reason: reasons[0] ?? "related",
        score,
      });
    }
  }

  return scored
    .sort((a, b) => b.score - a.score || (b.publicationDate || "").localeCompare(a.publicationDate || ""))
    .slice(0, limit)
    .map(({ score: _s, ...rest }) => rest);
}

export interface ArchiveSearchParams {
  q?: string;
  author?: string;
  category?: string;
  year?: string;
}

export function searchMetalLifestyleArchive(
  params: ArchiveSearchParams,
): MetalLifestyleManifestEntry[] {
  const manifest = getMetalLifestyleManifest();
  if (!manifest) return [];

  const q = params.q?.trim().toLowerCase() ?? "";
  const author = params.author?.trim().toLowerCase() ?? "";
  const category = params.category?.trim().toLowerCase() ?? "";
  const year = params.year?.trim() ?? "";

  return manifest.posts
    .filter((p) => p.status !== "unavailable")
    .filter((p) => {
      if (author && (p.author || "").toLowerCase() !== author) return false;
      if (category && (p.category || "").toLowerCase() !== category)
        return false;
      if (year && !(p.publicationDate || "").startsWith(year)) return false;
      if (!q) return true;
      const hay = [
        p.title,
        p.author,
        p.category,
        p.excerpt,
        p.slug,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    })
    .sort((a, b) =>
      (b.publicationDate || "").localeCompare(a.publicationDate || ""),
    );
}

export const DISCOVERY_LINKS = [
  { href: METAL_LIFESTYLE_BASE, label: "Catalog" },
  { href: `${METAL_LIFESTYLE_BASE}/blog`, label: "Publication" },
  { href: `${METAL_LIFESTYLE_BASE}/timeline`, label: "Timeline" },
  { href: `${METAL_LIFESTYLE_BASE}/series`, label: "Series" },
  { href: `${METAL_LIFESTYLE_BASE}/search`, label: "Search" },
  { href: `${METAL_LIFESTYLE_BASE}/statistics`, label: "Collection Record" },
] as const;
