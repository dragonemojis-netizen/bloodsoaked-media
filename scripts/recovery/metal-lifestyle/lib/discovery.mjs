import * as cheerio from "cheerio";
import { normalizeUrl } from "./weebly-parser.mjs";

const BASE_HOST = "metallifestyle.weebly.com";

function extractXmlTag(block, tag) {
  const cdata = block.match(
    new RegExp(`<${tag}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, "i"),
  );
  if (cdata) return cdata[1].trim();
  const plain = block.match(new RegExp(`<${tag}>([^<]*)<\\/${tag}>`, "i"));
  return plain?.[1]?.trim() ?? null;
}

export function isOnDomain(url) {
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, "") === BASE_HOST;
  } catch {
    return false;
  }
}

/** Normalize to canonical article key for deduplication. */
export function articleCanonicalKey(url) {
  const u = new URL(url);
  const path = u.pathname.replace(/\/$/, "").toLowerCase();

  const pretty = path.match(/^\/metal-lifestyle\/([^/]+)$/);
  if (pretty) return `slug:${pretty[1]}`;

  const legacy = path.match(/^\/1\/post\/(\d{4})\/(\d{2})\/([^/]+)\.html$/);
  if (legacy) return `legacy:${legacy[1]}-${legacy[2]}-${legacy[3]}`;

  return `path:${path}`;
}

export function classifyUrl(url) {
  const u = new URL(url);
  const path = u.pathname.toLowerCase();

  if (path.match(/^\/metal-lifestyle\/[^/]+$/)) {
    return "article_pretty";
  }
  if (path.match(/^\/1\/post\/\d{4}\/\d{2}\/[^/]+\.html$/)) {
    return "article_legacy";
  }
  if (path.includes("/metal-lifestyle/previous/")) {
    return "pagination";
  }
  if (path === "/" || path === "/index.html") {
    return "homepage";
  }
  if (path.includes("/1/feed") || path.endsWith(".xml") && path.includes("feed")) {
    return "feed";
  }
  if (path.includes("sitemap")) {
    return "sitemap";
  }
  if (path.includes("/blog") || path.includes("archive")) {
    return "archive_index";
  }
  if (/\.(jpg|jpeg|png|gif|webp|css|js|ico|pdf)$/i.test(path)) {
    return "asset";
  }
  if (path.endsWith(".html") || path.match(/^\/[a-z0-9-]+$/)) {
    return "static_page";
  }
  return "other";
}

export function extractAllInternalLinks(html, pageUrl) {
  const $ = cheerio.load(html);
  const links = new Map();

  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    const normalized = normalizeUrl(href, new URL(pageUrl).origin);
    if (!normalized || !isOnDomain(normalized)) return;
    const type = classifyUrl(normalized);
    if (type === "asset") return;
    if (!links.has(normalized)) {
      links.set(normalized, { url: normalized, type, text: $(el).text().trim().slice(0, 80) });
    }
  });

  return [...links.values()];
}

export function extractBlogPostUrls(html) {
  const $ = cheerio.load(html);
  const urls = new Set();

  $("a.blog-title-link").each((_, el) => {
    const u = normalizeUrl($(el).attr("href"));
    if (u) urls.add(u);
  });

  $("div.blog-social a[href*='metallifestyle']").each((_, el) => {
    const href = $(el).attr("href") ?? "";
    const m = href.match(/metallifestyle\.weebly\.com\/1\/post\/\d{4}\/\d{2}\/[^"'\s]+/i);
    if (m) urls.add(normalizeUrl(`https://${m[0]}`));
  });

  return [...urls];
}

export function extractPaginationUrls(html) {
  const $ = cheerio.load(html);
  const urls = [];
  $("div.blog-page-nav-previous a, div.blog-page-nav-next a").each((_, el) => {
    const u = normalizeUrl($(el).attr("href"));
    if (u) urls.push(u);
  });
  return urls;
}

export function parseRssEntries(xml) {
  const entries = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const link = extractXmlTag(block, "link");
    const title = extractXmlTag(block, "title");
    const pubDate = extractXmlTag(block, "pubDate");
    if (link) {
      entries.push({
        url: normalizeUrl(link),
        title: title ?? null,
        pubDate: pubDate ?? null,
      });
    }
  }
  return entries;
}

/** Weebly serves Atom at /1/feed */
export function parseAtomEntries(xml) {
  const entries = [];
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/gi;
  let match;
  while ((match = entryRegex.exec(xml)) !== null) {
    const block = match[1];
    const link =
      block.match(/<link[^>]*rel=["']alternate["'][^>]*href=["']([^"']+)["']/i)?.[1] ??
      block.match(/<link[^>]*href=["']([^"']+)["'][^>]*\/?>/i)?.[1] ??
      block.match(/<id>([^<]+)<\/id>/i)?.[1]?.trim();
    const title = block
      .match(/<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i)?.[1]
      ?.replace(/<[^>]+>/g, "")
      .trim();
    const pubDate =
      block.match(/<published>([^<]+)<\/published>/i)?.[1]?.trim() ??
      block.match(/<updated>([^<]+)<\/updated>/i)?.[1]?.trim();
    if (link && link.includes("metallifestyle")) {
      entries.push({
        url: normalizeUrl(link),
        title: title ?? null,
        pubDate: pubDate ?? null,
      });
    }
  }
  return entries;
}

export function parseFeedEntries(xml) {
  if (xml.includes("<feed") || xml.includes("<entry>")) {
    return parseAtomEntries(xml);
  }
  return parseRssEntries(xml);
}

export function parseSitemapUrls(xml) {
  const urls = [];
  const locRegex = /<loc>([^<]+)<\/loc>/gi;
  let m;
  while ((m = locRegex.exec(xml)) !== null) {
    const u = normalizeUrl(m[1].trim());
    if (u && isOnDomain(u)) urls.push(u);
  }
  return urls;
}

export function yearFromUrl(url) {
  const u = new URL(url);
  const legacy = u.pathname.match(/\/1\/post\/(\d{4})\//);
  if (legacy) return parseInt(legacy[1], 10);
  return null;
}

export function monthFromUrl(url) {
  const u = new URL(url);
  const legacy = u.pathname.match(/\/1\/post\/(\d{4})\/(\d{2})\//);
  if (legacy) return `${legacy[1]}-${legacy[2]}`;
  return null;
}
