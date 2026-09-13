import { LIBRARY_SCALING_CONTRACT } from "@/config/library-stewardship";
import type {
  LibraryBrowsePlatform,
  LibraryBrowseQuery,
  LibraryCatalog,
  LibraryShelfCard,
} from "@/types/library";
import { LIBRARY_BROWSE_PLATFORMS } from "@/types/library";

export { LIBRARY_BROWSE_PLATFORMS } from "@/types/library";

/**
 * Client-safe Library browse helpers. This file must not import Node fs —
 * the public /library shelf is prerendered and filtered in the browser so
 * query URLs do not invoke Fluid Active CPU.
 */

export function resolveLibraryBrowsePlatform(
  card: Pick<LibraryShelfCard, "platform" | "steamAppId">,
): LibraryBrowsePlatform | undefined {
  if (card.steamAppId != null || card.platform === "Steam") {
    return "Steam";
  }
  if (
    card.platform &&
    (LIBRARY_BROWSE_PLATFORMS as readonly string[]).includes(card.platform)
  ) {
    return card.platform as LibraryBrowsePlatform;
  }
  return undefined;
}

export function normalizeBrowseList(values: string[] | undefined): string[] {
  if (!values?.length) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of values) {
    const value = raw.trim();
    if (!value || seen.has(value)) continue;
    seen.add(value);
    out.push(value);
  }
  return out;
}

export function toggleLibraryBrowseValue(
  values: string[] | undefined,
  value: string,
): string[] {
  const current = normalizeBrowseList(values);
  if (current.includes(value)) {
    return current.filter((entry) => entry !== value);
  }
  return [...current, value];
}

export function libraryBrowseQueryHasFacets(query: LibraryBrowseQuery): boolean {
  return Boolean(
    query.q?.trim() || query.platforms?.length || query.genres?.length,
  );
}

export function filterLibraryShelfCards(
  cards: LibraryShelfCard[],
  query: LibraryBrowseQuery = {},
): LibraryShelfCard[] {
  let result = cards;

  const q = query.q?.trim().toLowerCase();
  if (q) {
    result = result.filter((card) => {
      const haystack = [
        card.title,
        card.synopsis,
        card.originalTitle,
        card.developer,
        card.publisher,
        card.platform,
        resolveLibraryBrowsePlatform(card),
        card.director,
        card.artist,
        card.shelfMark,
        card.steamAppId != null ? String(card.steamAppId) : "",
        ...card.subjects,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }

  const platforms = normalizeBrowseList(query.platforms).filter((platform) =>
    (LIBRARY_BROWSE_PLATFORMS as readonly string[]).includes(platform),
  );
  if (platforms.length > 0) {
    const allowed = new Set(platforms);
    result = result.filter((card) => {
      const browsePlatform = resolveLibraryBrowsePlatform(card);
      return browsePlatform != null && allowed.has(browsePlatform);
    });
  }

  const genres = normalizeBrowseList(query.genres);
  if (genres.length > 0) {
    const allowed = new Set(genres.map((genre) => genre.toLowerCase()));
    result = result.filter((card) =>
      card.subjects.some((subject) => allowed.has(subject.toLowerCase())),
    );
  }

  return result;
}

export function getLibraryBrowseHref(query: LibraryBrowseQuery = {}): string {
  const params = new URLSearchParams();
  if (query.q?.trim()) params.set("q", query.q.trim());

  const platforms = normalizeBrowseList(query.platforms).filter((platform) =>
    (LIBRARY_BROWSE_PLATFORMS as readonly string[]).includes(platform),
  );
  if (platforms.length > 0) params.set("platform", platforms.join(","));

  const genres = normalizeBrowseList(query.genres);
  if (genres.length > 0) params.set("genre", genres.join(","));

  if (query.page && query.page > 1) params.set("page", String(query.page));
  const serialized = params.toString();
  return serialized ? `/library?${serialized}` : "/library";
}

export function parseLibraryBrowseParamList(
  value: string | string[] | undefined,
): string[] {
  if (value == null) return [];
  const parts = Array.isArray(value) ? value : [value];
  return normalizeBrowseList(
    parts.flatMap((part) => part.split(",").map((entry) => entry.trim())),
  );
}

export function paginateLibraryCatalog(
  published: LibraryShelfCard[],
  query: LibraryBrowseQuery = {},
): LibraryCatalog {
  const pageSize = LIBRARY_SCALING_CONTRACT.shelfPageSize;
  const requestedPage = Math.max(1, query.page ?? 1);
  const filtered = filterLibraryShelfCards(published, query);
  const pageCount =
    filtered.length === 0 ? 0 : Math.ceil(filtered.length / pageSize);
  const page =
    pageCount === 0 ? 1 : Math.min(requestedPage, Math.max(1, pageCount));
  const start = (page - 1) * pageSize;

  return {
    entries: filtered.slice(start, start + pageSize),
    total: filtered.length,
    publishedTotal: published.length,
    isEmpty: published.length === 0,
    page,
    pageSize,
    pageCount,
    hasPreviousPage: pageCount > 0 && page > 1,
    hasNextPage: pageCount > 0 && page < pageCount,
  };
}

export function parseLibraryBrowseSearchParams(
  params: URLSearchParams,
): LibraryBrowseQuery {
  const pageRaw = params.get("page");
  const pageNum = pageRaw ? Number.parseInt(pageRaw, 10) : undefined;
  const platforms = parseLibraryBrowseParamList(
    params.get("platform") ?? undefined,
  ).filter((platform): platform is LibraryBrowsePlatform =>
    (LIBRARY_BROWSE_PLATFORMS as readonly string[]).includes(platform),
  );
  const genres = parseLibraryBrowseParamList(params.get("genre") ?? undefined);

  return {
    q: params.get("q") ?? undefined,
    platforms: platforms.length > 0 ? platforms : undefined,
    genres: genres.length > 0 ? genres : undefined,
    page:
      pageNum != null && !Number.isNaN(pageNum) && pageNum > 0
        ? pageNum
        : undefined,
  };
}
