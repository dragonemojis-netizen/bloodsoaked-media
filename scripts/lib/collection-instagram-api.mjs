const DEFAULT_VERSION = "v25.0";
const DEFAULT_BASE = "https://graph.instagram.com";

const MEDIA_FIELDS = [
  "id",
  "caption",
  "media_type",
  "media_url",
  "permalink",
  "timestamp",
  "thumbnail_url",
  "children{id,media_type,media_url,thumbnail_url}",
].join(",");

export function loadInstagramConfig(env = process.env) {
  const accessToken = env.INSTAGRAM_ACCESS_TOKEN?.trim();
  if (!accessToken) {
    throw new Error(
      "INSTAGRAM_ACCESS_TOKEN is required. Run npm run collection:instagram:setup after configuring .env.local.",
    );
  }

  return {
    accessToken,
    userId: env.INSTAGRAM_USER_ID?.trim() || null,
    apiVersion: env.INSTAGRAM_GRAPH_API_VERSION?.trim() || DEFAULT_VERSION,
    apiBase: env.INSTAGRAM_API_BASE_URL?.trim() || DEFAULT_BASE,
    pageLimit: Number(env.COLLECTION_SYNC_PAGE_LIMIT || "25"),
    requestDelayMs: Number(env.COLLECTION_SYNC_REQUEST_DELAY_MS || "200"),
  };
}

function apiUrl(config, path, params = {}) {
  const url = new URL(`${config.apiBase}/${config.apiVersion}/${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (value != null) url.searchParams.set(key, String(value));
  }
  url.searchParams.set("access_token", config.accessToken);
  return url;
}

async function graphGet(config, path, params = {}) {
  const url = apiUrl(config, path, params);
  const res = await fetch(url);
  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message =
      body?.error?.message ||
      body?.error_message ||
      `Instagram API request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    err.code = body?.error?.code;
    err.type = body?.error?.type;
    err.payload = body;
    throw err;
  }

  return body;
}

export async function fetchInstagramIdentity(config) {
  const data = await graphGet(config, "me", {
    fields: "user_id,username,account_type,media_count",
  });

  const userId = data.user_id || data.id;
  if (!userId) {
    throw new Error("Instagram /me response did not include user_id.");
  }

  return {
    userId: String(userId),
    username: data.username ?? null,
    accountType: data.account_type ?? null,
    mediaCount: data.media_count ?? null,
  };
}

export async function resolveInstagramUserId(config) {
  if (config.userId) return config.userId;
  const identity = await fetchInstagramIdentity(config);
  return identity.userId;
}

export async function fetchAllInstagramMedia(config, userId, { limit = null } = {}) {
  const items = [];
  let nextPath = `${userId}/media`;
  let nextParams = { fields: MEDIA_FIELDS, limit: String(config.pageLimit) };

  while (nextPath) {
    const page = await graphGet(config, nextPath, nextParams);
    if (Array.isArray(page.data)) items.push(...page.data);

    if (limit != null && items.length >= limit) {
      return items.slice(0, limit);
    }

    const nextUrl = page.paging?.next;
    if (!nextUrl) break;

    const parsed = new URL(nextUrl);
    nextPath = parsed.pathname.replace(
      new RegExp(`^/${config.apiVersion}/`),
      "",
    );
    nextParams = Object.fromEntries(parsed.searchParams.entries());
    delete nextParams.access_token;

    await delay(config.requestDelayMs);
  }

  return items;
}

export function resolveMediaImageUrl(media) {
  if (!media) return null;
  if (media.media_type === "VIDEO") {
    return media.thumbnail_url || media.media_url || null;
  }
  if (media.media_type === "CAROUSEL_ALBUM" && media.children?.data?.length) {
    const child =
      media.children.data.find((item) => item.media_url || item.thumbnail_url) ||
      media.children.data[0];
    return child?.media_url || child?.thumbnail_url || null;
  }
  return media.media_url || media.thumbnail_url || null;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
