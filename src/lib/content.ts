import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import readingTime from "reading-time";
import { isLegacyArchivePublic } from "@/lib/legacy-gate";
import { slugifyTag } from "@/lib/slugs";
import type {
  Category,
  Mood,
  Post,
  PostMeta,
  PostType,
} from "@/types/content";
import { MOODS } from "@/types/content";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");
const LEGACY_DIR = path.join(process.cwd(), "content", "legacy");

const CONTENT_DIRS = [
  { dir: POSTS_DIR, prefix: "" },
  { dir: LEGACY_DIR, prefix: "" },
] as const;

function getSlugsFromDir(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".md") && !file.startsWith("_"))
    .map((file) => file.replace(/\.md$/, ""));
}

function getAllSlugs(): string[] {
  const slugs = new Set<string>();
  for (const { dir } of CONTENT_DIRS) {
    if (!isLegacyArchivePublic() && dir === LEGACY_DIR) continue;
    for (const slug of getSlugsFromDir(dir)) {
      slugs.add(slug);
    }
  }
  return [...slugs];
}

function resolveFilePath(slug: string): string | null {
  const legacyPath = path.join(LEGACY_DIR, `${slug}.md`);
  if (fs.existsSync(legacyPath)) return legacyPath;
  const postPath = path.join(POSTS_DIR, `${slug}.md`);
  if (fs.existsSync(postPath)) return postPath;
  return null;
}

async function markdownToHtml(markdown: string): Promise<string> {
  const result = await remark().use(html).process(markdown);
  return result.toString();
}

function sortByDateDesc<T extends { date: string }>(posts: T[]): T[] {
  return [...posts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

function sortLegacyByOriginalDate(posts: PostMeta[]): PostMeta[] {
  return [...posts].sort((a, b) => {
    const dateA = a.originalPublicationDate ?? a.date;
    const dateB = b.originalPublicationDate ?? b.date;
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });
}

function parseResourceLink(
  raw: unknown,
): Post["resourceLink"] | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const { label, href } = raw as { label?: unknown; href?: unknown };
  if (typeof label !== "string" || typeof href !== "string") return undefined;
  if (!label.trim() || !href.trim()) return undefined;
  return { label: label.trim(), href: href.trim() };
}

function parsePostData(data: Record<string, unknown>, slug: string) {
  const category = data.category as Post["category"];
  const medium =
    (data.medium as Post["medium"]) ??
    (category === "games"
      ? "game"
      : category === "film"
        ? "film"
        : category === "television"
          ? "television"
          : category === "music"
            ? "music"
            : "culture");

  const legacy = (data.legacy as boolean) ?? false;
  const archiveDate =
    (data.archiveDate as string) ?? (data.date as string);

  return {
    slug,
    title: data.title as string,
    date: legacy ? archiveDate : (data.date as string),
    excerpt: data.excerpt as string,
    category,
    type: data.type as PostType,
    tags: (data.tags as string[]) ?? [],
    medium,
    era: (data.era as string) ?? "",
    mood: (data.mood as Mood) ?? "Atmospheric",
    featured: legacy ? false : ((data.featured as boolean) ?? false),
    editorPick: legacy ? false : ((data.editorPick as boolean) ?? false),
    inVault: (data.inVault as boolean) ?? false,
    verdict: data.verdict as Post["verdict"],
    coverImage: data.coverImage as string | undefined,
    resourceLink: parseResourceLink(data.resourceLink),
    requiresLink: parseResourceLink(data.requiresLink),
    authorNote: data.authorNote as string | undefined,
    subtitle: data.subtitle as string | undefined,
    collections: (data.collections as string[]) ?? [],
    legacy,
    originalPublication: data.originalPublication as string | undefined,
    originalPublicationDate: data.originalPublicationDate as
      | string
      | undefined,
    originalSite: data.originalSite as string | undefined,
    originalUrl: data.originalUrl as string | undefined,
    archiveEra: data.archiveEra as string | undefined,
    author: data.author as string | undefined,
    archiveDate: legacy ? archiveDate : undefined,
    restorationNote: data.restorationNote as string | undefined,
  };
}

export async function getAllPosts(): Promise<Post[]> {
  const slugs = getAllSlugs();
  const posts = await Promise.all(slugs.map((slug) => getPostBySlug(slug)));
  return sortByDateDesc(posts.filter((p): p is Post => p !== null));
}

export async function getAllPostMeta(): Promise<PostMeta[]> {
  const posts = await getAllPosts();
  const meta = posts.map(({ slug, readingTime, content, html, ...meta }) => ({
    slug,
    readingTime,
    ...meta,
  }));
  if (!isLegacyArchivePublic()) {
    return meta.filter((p) => !p.legacy);
  }
  return meta;
}

export async function getCurrentPostMeta(): Promise<PostMeta[]> {
  return (await getAllPostMeta()).filter((p) => !p.legacy);
}

export async function getLegacyPosts(): Promise<PostMeta[]> {
  if (!isLegacyArchivePublic()) return [];
  const slugs = getSlugsFromDir(LEGACY_DIR);
  const posts = await Promise.all(
    slugs.map((slug) => getPostBySlug(slug)),
  );
  return sortLegacyByOriginalDate(
    posts
      .filter((p): p is Post => p !== null && p.legacy === true)
      .map(({ slug, readingTime, content, html, ...meta }) => ({
        slug,
        readingTime,
        ...meta,
      })),
  );
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const filePath = resolveFilePath(slug);
  if (!filePath) return null;

  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  const htmlContent = await markdownToHtml(content);
  const stats = readingTime(content);
  const meta = parsePostData(data, slug);

  if (meta.legacy && !isLegacyArchivePublic()) {
    return null;
  }

  return {
    ...meta,
    content,
    html: htmlContent,
    readingTime: stats.text,
  };
}

export async function getPostsByType(type: PostType): Promise<PostMeta[]> {
  const all = await getCurrentPostMeta();
  return all.filter((post) => post.type === type);
}

export async function getPostsByCategory(category: Category): Promise<PostMeta[]> {
  const all = await getAllPostMeta();
  return all.filter((post) => post.category === category);
}

export async function getPostsByMood(mood: Mood): Promise<PostMeta[]> {
  const all = await getAllPostMeta();
  return all.filter((post) => post.mood === mood);
}

export async function getPostsByYear(year: string): Promise<PostMeta[]> {
  const all = await getAllPostMeta();
  return all.filter(
    (post) => new Date(post.date).getFullYear().toString() === year,
  );
}

export async function getPostsByYearMonth(
  year: string,
  month: string,
): Promise<PostMeta[]> {
  const all = await getAllPostMeta();
  return all.filter((post) => {
    const d = new Date(post.date);
    return (
      d.getFullYear().toString() === year &&
      String(d.getMonth() + 1).padStart(2, "0") === month.padStart(2, "0")
    );
  });
}

export async function resolveTagFromSlug(tagSlug: string): Promise<string | null> {
  const tags = getAllTags(await getAllPostMeta());
  return tags.find((t) => slugifyTag(t) === tagSlug.toLowerCase()) ?? null;
}

export async function getPostsByTag(tagSlug: string): Promise<PostMeta[]> {
  const tag = await resolveTagFromSlug(tagSlug);
  if (!tag) return [];
  const normalized = tag.toLowerCase();
  const all = await getAllPostMeta();
  return all.filter((post) =>
    post.tags.some((t) => t.toLowerCase() === normalized),
  );
}

export async function getFeaturedPosts(limit = 3): Promise<PostMeta[]> {
  const all = await getCurrentPostMeta();
  return all
    .filter((post) => post.featured)
    .sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    )
    .slice(0, limit);
}

export async function getEditorPick(): Promise<PostMeta | null> {
  const all = await getCurrentPostMeta();
  return (
    all.find((post) => post.editorPick) ??
    all.find((post) => post.featured) ??
    null
  );
}

export async function getVaultPosts(): Promise<PostMeta[]> {
  const all = await getAllPostMeta();
  return all.filter((post) => post.inVault);
}

export async function getRecentPosts(limit = 6): Promise<PostMeta[]> {
  const all = await getCurrentPostMeta();
  return all.slice(0, limit);
}

export async function getAdjacentPosts(slug: string): Promise<{
  prev: PostMeta | null;
  next: PostMeta | null;
}> {
  const post = await getPostBySlug(slug);
  if (!post) return { prev: null, next: null };

  const pool = post.legacy
    ? sortLegacyByOriginalDate((await getAllPostMeta()).filter((p) => p.legacy))
    : await getCurrentPostMeta();

  const index = pool.findIndex((p) => p.slug === slug);
  if (index === -1) return { prev: null, next: null };

  return {
    prev: index < pool.length - 1 ? pool[index + 1]! : null,
    next: index > 0 ? pool[index - 1]! : null,
  };
}

export async function getRelatedPosts(
  post: PostMeta,
  limit = 4,
): Promise<PostMeta[]> {
  const all = post.legacy
    ? (await getAllPostMeta()).filter((p) => p.legacy)
    : await getCurrentPostMeta();

  const scored = all
    .filter((p) => p.slug !== post.slug)
    .map((p) => {
      let score = 0;
      if (p.category === post.category) score += 3;
      if (p.mood === post.mood) score += 4;
      if (p.medium === post.medium) score += 2;
      if (p.type === post.type) score += 1;
      if (p.originalPublication === post.originalPublication) score += 5;
      const sharedTags = p.tags.filter((t) => post.tags.includes(t));
      score += sharedTags.length * 2;
      return { post: p, score };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((s) => s.post);
}

export function getArchiveYears(posts: PostMeta[]): string[] {
  const years = new Set<string>();
  for (const post of posts) {
    years.add(new Date(post.date).getFullYear().toString());
  }
  return [...years].sort((a, b) => Number(b) - Number(a));
}

export function getArchiveMonthsForYear(
  posts: PostMeta[],
  year: string,
): { month: string; label: string; count: number }[] {
  const monthNames = [
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
  const counts = new Map<string, number>();

  for (const post of posts) {
    const d = new Date(post.date);
    if (d.getFullYear().toString() !== year) continue;
    const m = String(d.getMonth() + 1).padStart(2, "0");
    counts.set(m, (counts.get(m) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort(([a], [b]) => Number(b) - Number(a))
    .map(([month, count]) => ({
      month,
      label: monthNames[Number(month) - 1],
      count,
    }));
}

export function getAllMoodsUsed(posts: PostMeta[]): Mood[] {
  const used = new Set<Mood>();
  for (const post of posts) {
    if (MOODS.includes(post.mood)) used.add(post.mood);
  }
  return MOODS.filter((m) => used.has(m));
}

export function searchPosts(posts: PostMeta[], query: string): PostMeta[] {
  const q = query.trim().toLowerCase();
  if (!q) return posts;

  return posts.filter((post) => {
    const haystack = [
      post.title,
      post.excerpt,
      post.category,
      post.type,
      post.medium,
      post.era,
      post.mood,
      post.originalPublication,
      post.originalSite,
      ...post.tags,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}

export function getAllTags(posts: PostMeta[]): string[] {
  const tags = new Set<string>();
  for (const post of posts) {
    for (const tag of post.tags) tags.add(tag);
  }
  return [...tags].sort((a, b) => a.localeCompare(b));
}
