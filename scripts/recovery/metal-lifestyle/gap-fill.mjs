/**
 * Historical completeness pass for Metal Lifestyle.
 *
 * Baseline = restored archive. Only recovers demonstrably missing material.
 * Never overwrites complete content. Ignores ads, feeds, printer/pagination junk.
 *
 * Usage: npm run recovery:ml:gap-fill
 * Options: --dry-run, --skip-media, --limit=N
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import * as cheerio from "cheerio";
import {
  normalizeUrl,
  parseArticlePage,
  extractStaticContentLinks,
} from "./lib/weebly-parser.mjs";
import { assertMayMutateArchive } from "./lib/preservation-lock.mjs";
import { rebuildManifestFromDisk } from "./lib/rebuild-manifest-from-disk.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "../../..");
const AUDIT_PATH = path.join(
  ROOT,
  "recovery/metal-lifestyle/reports/audit.json",
);
const ARCHIVE = path.join(ROOT, "content/archives/metal-lifestyle");
const POSTS_DIR = path.join(ARCHIVE, "posts");
const PAGES_DIR = path.join(ARCHIVE, "pages");
const MEDIA_DIR = path.join(
  ROOT,
  "public/images/archives/metal-lifestyle/media",
);
const RAW_DIR = path.join(ROOT, "recovery/metal-lifestyle/gap-raw");
const REPORT_PATH = path.join(
  ROOT,
  "recovery/metal-lifestyle/reports/GAP-FILL-REPORT.md",
);
const REPORT_JSON = path.join(
  ROOT,
  "recovery/metal-lifestyle/reports/gap-fill-report.json",
);

const BASE = "https://metallifestyle.weebly.com";
const DELAY_MS = 500;
const ARCHIVE_DATE = new Date().toISOString().slice(0, 10);

const args = process.argv.slice(2);
if (!args.includes("--dry-run")) {
  assertMayMutateArchive(args, "recovery:ml:gap-fill");
}
const DRY = args.includes("--dry-run");
const SKIP_MEDIA = args.includes("--skip-media");
const NO_WAYBACK = args.includes("--no-wayback");
const LIMIT = Number(
  args.find((a) => a.startsWith("--limit="))?.split("=")[1] ?? 0,
);

const FALSE_GAP =
  /adsense|serveAds|cdn-cgi|--feed$|\/feed|printer|print=1|--previous--|--next--|--category--|wsite-search|facebook\.com\/plugins|twitter\.com\/widgets/i;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function loadJsonDir(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));
}

function slugFromUrl(url) {
  try {
    const u = new URL(url);
    let p = u.pathname.replace(/\.html$/i, "").replace(/\/+$/, "");
    if (p.startsWith("/metal-lifestyle/")) {
      return p.slice("/metal-lifestyle/".length).replace(/\//g, "--");
    }
    if (p.startsWith("/1/post/")) {
      const parts = p.split("/").filter(Boolean);
      return parts.slice(2).join("-");
    }
    return p.replace(/^\//, "").replace(/\//g, "--") || "index";
  } catch {
    return "unknown";
  }
}

function pageKeyFromUrl(url) {
  try {
    const u = new URL(url);
    return (
      u.pathname
        .replace(/^\//, "")
        .replace(/\.html$/i, "")
        .replace(/\/+/g, "/")
        .replace(/\//g, "--") || "index"
    );
  } catch {
    return "unknown";
  }
}

function textLen(htmlOrText) {
  return String(htmlOrText || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim().length;
}

function isThin(record) {
  if (!record) return true;
  if (record.status === "unavailable") return true;
  return textLen(record.contentHtml || record.text) < 80;
}

async function fetchHtml(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "BloodsoakedMedia-ArchiveRecovery/1.0 (historical gap fill)",
    },
    redirect: "follow",
  });
  if (!res.ok) {
    const err = new Error(`HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return res.text();
}

/** Wayback Machine fallback — historical source when live host 404s. */
async function fetchHtmlWithWayback(url) {
  try {
    const html = await fetchHtml(url);
    return { html, source: "live" };
  } catch (err) {
    if (err.status !== 404 && err.status !== 410) throw err;
  }
  if (NO_WAYBACK) {
    const err = new Error("HTTP 404 (Wayback skipped)");
    err.status = 404;
    throw err;
  }
  const api = `https://archive.org/wayback/available?url=${encodeURIComponent(url)}`;
  let avail;
  try {
    avail = await fetch(api, {
      headers: {
        "User-Agent":
          "BloodsoakedMedia-ArchiveRecovery/1.0 (historical gap fill)",
      },
    });
  } catch (err) {
    const e = new Error(`Wayback unavailable: ${err.message}`);
    e.status = 503;
    throw e;
  }
  if (avail.status === 429) {
    const err = new Error("Wayback rate limited (429)");
    err.status = 429;
    throw err;
  }
  if (!avail.ok) {
    const err = new Error(`Wayback availability HTTP ${avail.status}`);
    err.status = avail.status;
    throw err;
  }
  const data = await avail.json();
  const snap = data?.archived_snapshots?.closest;
  if (!snap?.available || !snap?.url) {
    // CDX fallback
    try {
      const cdx = `https://web.archive.org/cdx/search/cdx?url=${encodeURIComponent(url)}&output=json&limit=1&filter=statuscode:200&fl=timestamp,original`;
      const cdxRes = await fetch(cdx, {
        headers: {
          "User-Agent":
            "BloodsoakedMedia-ArchiveRecovery/1.0 (historical gap fill)",
        },
      });
      if (cdxRes.ok) {
        const rows = await cdxRes.json();
        if (Array.isArray(rows) && rows.length > 1) {
          const ts = rows[1][0];
          const waybackUrl = `https://web.archive.org/web/${ts}id_/${url}`;
          const html = await fetchHtml(waybackUrl);
          return { html, source: "wayback-cdx", waybackUrl, timestamp: ts };
        }
      }
    } catch {
      /* fall through */
    }
    const err = new Error("HTTP 404 (no Wayback snapshot)");
    err.status = 404;
    throw err;
  }
  const html = await fetchHtml(snap.url);
  return { html, source: "wayback", waybackUrl: snap.url, timestamp: snap.timestamp };
}

function extractGalleryPayload($) {
  /** Weebly often embeds gallery JSON in data attributes or script. */
  const items = [];
  $(".imageGallery a[href], .imageGallery img[src], [data-gallery] img").each(
    (_, el) => {
      const $el = $(el);
      const src =
        $el.attr("data-src") ||
        $el.attr("data-full") ||
        $el.attr("href") ||
        $el.attr("src");
      const caption =
        $el.attr("title") ||
        $el.attr("alt") ||
        $el.closest("a").attr("title") ||
        "";
      if (src && /uploads\//i.test(src)) {
        items.push({
          src: normalizeUrl(src),
          caption: String(caption || "").trim(),
        });
      }
    },
  );

  $("script").each((_, el) => {
    const raw = $(el).html() || "";
    if (!/imageGallery|galleryImages|w-fancybox/i.test(raw)) return;
    const urls = [...raw.matchAll(/https?:\\?\/\\?\/[^\"'\s]+uploads[^\"'\s]+/gi)];
    for (const m of urls) {
      const cleaned = m[0]
        .replace(/\\\//g, "/")
        .replace(/\\u002F/g, "/");
      if (/uploads\//i.test(cleaned)) {
        items.push({ src: cleaned.split("\\")[0], caption: "" });
      }
    }
    const rel = [...raw.matchAll(/\/uploads\/[^\"'\\]+/gi)];
    for (const m of rel) {
      items.push({ src: normalizeUrl(m[0]), caption: "" });
    }
  });

  const seen = new Set();
  return items.filter((it) => {
    if (!it.src || seen.has(it.src)) return false;
    seen.add(it.src);
    return true;
  });
}

/** Multi-author About Us: Weebly may expose several blog-post blocks. */
function parseStaffPage(html, url) {
  const $ = cheerio.load(html);
  const posts = [];
  $(".blog-post").each((_, el) => {
    const $p = $(el);
    const title =
      $p.find(".blog-title a, .blog-title-link, .blog-title").first().text().trim() ||
      null;
    const dateRaw = $p.find(".blog-date").first().text().trim() || null;
    const contentHtml = $p.find(".blog-content").first().html() ?? "";
    const text = $p.find(".blog-content").first().text() ?? "";
    const images = [];
    $p.find(".blog-content img[src]").each((__, img) => {
      const src = normalizeUrl($(img).attr("src"));
      if (src) images.push(src);
    });
    if (textLen(contentHtml) >= 40 || images.length) {
      posts.push({ title, dateRaw, contentHtml, text, images });
    }
  });

  if (posts.length <= 1) {
    // Fall back to full #wsite-content for non-blog staff layouts
    const contentHtml = $("#wsite-content").html() ?? "";
    const text = $("#wsite-content").text() ?? "";
    const images = [];
    $("#wsite-content img[src]").each((_, img) => {
      const src = normalizeUrl($(img).attr("src"));
      if (src) images.push(src);
    });
    return {
      mode: "static-or-single",
      title:
        $("#wsite-content h2").first().text().trim() ||
        $("title").text().replace(/ - Metal Lifestyle.*/i, "").trim(),
      contentHtml,
      text,
      images,
      staffPosts: posts,
    };
  }

  // Merge all staff posts into one archival page body
  const parts = posts.map((p) => {
    const h = p.title
      ? `<h2 class="wsite-content-title">${escapeHtml(p.title)}</h2>`
      : "";
    return `${h}${p.contentHtml}`;
  });
  return {
    mode: "multi-staff",
    title: "About Us: Meet the Staff",
    contentHtml: parts.join("\n\n"),
    text: posts.map((p) => `${p.title || ""}\n${p.text}`).join("\n\n"),
    images: [...new Set(posts.flatMap((p) => p.images))],
    staffPosts: posts,
  };
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function mediaFileName(slug, originalUrl) {
  try {
    const base = path.basename(new URL(originalUrl).pathname);
    const safe = base.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(0, 120);
    return `${slug}--${safe}`;
  } catch {
    return `${slug}--asset`;
  }
}

async function saveMedia(slug, urls) {
  const media = [];
  if (SKIP_MEDIA || DRY) {
    for (const originalUrl of urls) {
      media.push({
        originalUrl,
        localPath: null,
        status: DRY ? "dry-run" : "skipped",
      });
    }
    return media;
  }
  fs.mkdirSync(MEDIA_DIR, { recursive: true });
  for (const originalUrl of urls) {
    const name = mediaFileName(slug, originalUrl);
    const dest = path.join(MEDIA_DIR, name);
    const localPath = `/images/archives/metal-lifestyle/media/${name}`;
    if (fs.existsSync(dest)) {
      media.push({ originalUrl, localPath, status: "saved" });
      continue;
    }
    try {
      const res = await fetch(originalUrl, {
        headers: {
          "User-Agent":
            "BloodsoakedMedia-ArchiveRecovery/1.0 (historical gap fill)",
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(dest, buf);
      media.push({ originalUrl, localPath, status: "saved" });
      await sleep(200);
    } catch {
      media.push({ originalUrl, localPath: null, status: "missing" });
    }
  }
  return media;
}

function rewriteMediaInHtml(html, media) {
  let out = html || "";
  for (const m of media) {
    if (m.status !== "saved" || !m.localPath || !m.originalUrl) continue;
    out = out.split(m.originalUrl).join(m.localPath);
    try {
      const pathOnly = new URL(m.originalUrl).pathname;
      out = out.split(pathOnly).join(m.localPath);
    } catch {
      /* ignore */
    }
  }
  return out;
}

function writeRecord(dir, record) {
  if (DRY) return;
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, `${record.slug}.json`),
    JSON.stringify(record, null, 2),
    "utf8",
  );
}

function rebuildManifest(posts, pages) {
  // Prefer full disk rebuild so a partial in-memory set cannot truncate the index.
  if (!DRY) {
    return rebuildManifestFromDisk({
      note: `gap-fill ${ARCHIVE_DATE}`,
    });
  }
  return {
    publication: "Metal Lifestyle",
    originalSite: BASE,
    lastPreservationPass: ARCHIVE_DATE,
    generatedAt: new Date().toISOString(),
    posts: posts.map(summarize),
    pages: pages.map(summarize),
  };
}

function summarize(r) {
  return {
    slug: r.slug,
    title: r.title,
    originalUrl: r.originalUrl,
    publicationDate: r.publicationDate ?? null,
    author: r.author ?? null,
    category: r.category ?? null,
    status: r.status,
    excerpt: (r.text || "").replace(/\s+/g, " ").trim().slice(0, 180) || null,
  };
}

function rebuildAuthors(posts) {
  const priorPath = path.join(ARCHIVE, "authors.json");
  const prior = new Map();
  if (fs.existsSync(priorPath)) {
    try {
      for (const a of JSON.parse(fs.readFileSync(priorPath, "utf8"))) {
        prior.set(a.name, a);
      }
    } catch {
      /* ignore */
    }
  }

  const map = new Map();
  for (const p of posts) {
    if (p.status === "unavailable" || !p.author) continue;
    if (!map.has(p.author)) {
      const prev = prior.get(p.author);
      map.set(p.author, {
        name: p.author,
        slug: slugifyAuthor(p.author),
        articleSlugs: [],
        publicationCount: 0,
        biography: prev?.biography ?? null,
        profileTitle: prev?.profileTitle,
        profileFrom: prev?.profileFrom,
      });
    }
    const a = map.get(p.author);
    a.articleSlugs.push(p.slug);
    a.publicationCount += 1;
  }
  // Keep staff-only authors (bios, zero articles) from prior index
  for (const [name, prev] of prior) {
    if (!map.has(name) && prev.biography) {
      map.set(name, {
        ...prev,
        articleSlugs: prev.articleSlugs || [],
        publicationCount: prev.publicationCount || 0,
      });
    }
  }
  const authors = [...map.values()].sort((a, b) =>
    a.name.localeCompare(b.name),
  );
  if (!DRY) {
    fs.writeFileSync(
      path.join(ARCHIVE, "authors.json"),
      JSON.stringify(authors, null, 2),
      "utf8",
    );
  }
  return authors;
}

function slugifyAuthor(name) {
  return String(name)
    .toLowerCase()
    .replace(/\./g, "dot")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function applyStaffBiographies(authors, staffPosts) {
  let applied = 0;
  for (const post of staffPosts) {
    const title = post.title || "";
    // e.g. "Cesar Gonzalez - Staff Writer"
    const name = title.split(" - ")[0].trim();
    if (!name || name.length < 3) continue;
    const match = authors.find(
      (a) =>
        a.name.toLowerCase() === name.toLowerCase() ||
        name.toLowerCase().includes(a.name.toLowerCase()) ||
        a.name.toLowerCase().includes(name.toLowerCase().split(" ")[0]),
    );
    const bio = (post.text || "").replace(/\s+/g, " ").trim();
    if (!bio) continue;
    if (match) {
      if (!match.biography) {
        match.biography = bio;
        applied += 1;
      }
    } else {
      authors.push({
        name,
        slug: slugifyAuthor(name),
        articleSlugs: [],
        publicationCount: 0,
        biography: bio,
        profileFrom: "about-us-meet-the-staff",
      });
      applied += 1;
    }
  }
  if (!DRY) {
    authors.sort((a, b) => a.name.localeCompare(b.name));
    fs.writeFileSync(
      path.join(ARCHIVE, "authors.json"),
      JSON.stringify(authors, null, 2),
      "utf8",
    );
  }
  return applied;
}

async function tryRecoverUrl(target, kind) {
  const fetched = await fetchHtmlWithWayback(target.url);
  const html = fetched.html;
  fs.mkdirSync(RAW_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(RAW_DIR, `${target.slug}.html`),
    html,
    "utf8",
  );

  if (FALSE_GAP.test(target.url) || FALSE_GAP.test(html.slice(0, 2000))) {
    return { ok: false, reason: "false-gap-filtered" };
  }

  let parsed;
  if (kind === "page" && /about-us-meet-the-staff/i.test(target.slug)) {
    parsed = parseStaffPage(html, target.url);
  } else {
    parsed = parseArticlePage(html, target.url);
  }

  if (textLen(parsed.contentHtml || parsed.text) < 40) {
    // Gallery attempt
    const $ = cheerio.load(html);
    const gallery = extractGalleryPayload($);
    if (gallery.length) {
      const galleryHtml = gallery
        .map((g) => {
          const cap = g.caption
            ? `<div style="display:block;font-size:90%">${escapeHtml(g.caption)}</div>`
            : `<div style="display:block;font-size:90%"></div>`;
          return `<div class="wsite-image wsite-image-border-none" style="text-align:center"><a href="${g.src}"><img src="${g.src}" alt="${escapeHtml(g.caption || "Picture")}" style="max-width:100%"></a>${cap}</div>`;
        })
        .join("\n");
      parsed = {
        ...parsed,
        contentHtml: galleryHtml,
        text: gallery.map((g) => g.caption).filter(Boolean).join("\n"),
        images: gallery.map((g) => g.src),
        galleryRecovered: true,
        galleryCount: gallery.length,
      };
    } else {
      return { ok: false, reason: "empty-body", parsed, source: fetched.source };
    }
  }

  return { ok: true, parsed, html, source: fetched.source, waybackUrl: fetched.waybackUrl };
}

function shouldMerge(existing, parsed) {
  if (!existing || existing.status === "unavailable") {
    return { merge: true, mode: "fill-unavailable" };
  }
  const oldLen = textLen(existing.contentHtml || existing.text);
  const newLen = textLen(parsed.contentHtml || parsed.text);
  if (oldLen < 80 && newLen > oldLen + 40) {
    return { merge: true, mode: "fill-thin" };
  }
  // About Us: archived only Cesar; live has more staff posts
  if (
    existing.slug === "about-us-meet-the-staff" &&
    parsed.mode === "multi-staff" &&
    (parsed.staffPosts?.length || 0) > 1 &&
    newLen > oldLen + 100
  ) {
    return { merge: true, mode: "expand-staff-page" };
  }
  // Gallery fill
  if (parsed.galleryRecovered && oldLen < 80 && newLen >= 40) {
    return { merge: true, mode: "fill-gallery" };
  }
  // Missing images only — do not replace body
  const existingImgs = new Set(existing.images || []);
  const newImgs = (parsed.images || []).filter((u) => !existingImgs.has(u));
  if (newImgs.length && newLen <= oldLen + 40) {
    return { merge: true, mode: "media-only", newImgs };
  }
  return { merge: false, mode: "skip-complete", oldLen, newLen };
}

async function main() {
  const report = {
    generatedAt: new Date().toISOString(),
    dryRun: DRY,
    recovered: {
      staffProfiles: 0,
      authorBiographies: 0,
      missingImages: 0,
      missingParagraphsPages: 0,
      unavailableArticlesFilled: 0,
      galleries: 0,
      navigationItems: 0,
    },
    stillUnavailable: [],
    skippedFalseGaps: [],
    actions: [],
  };

  const posts = loadJsonDir(POSTS_DIR);
  const pages = loadJsonDir(PAGES_DIR);
  const bySlug = new Map([
    ...posts.map((p) => [p.slug, { record: p, kind: "post" }]),
    ...pages.map((p) => [p.slug, { record: p, kind: "page" }]),
  ]);

  let audit = { articles: [], allUrls: [] };
  if (fs.existsSync(AUDIT_PATH)) {
    audit = JSON.parse(fs.readFileSync(AUDIT_PATH, "utf8"));
  }

  /** Candidates: unavailable + thin + known staff/gallery hubs */
  const candidates = [];

  for (const p of posts) {
    if (p.status === "unavailable" || isThin(p)) {
      candidates.push({
        slug: p.slug,
        url: p.originalUrl,
        kind: "post",
        reason: p.status === "unavailable" ? "unavailable" : "thin",
      });
    }
  }
  for (const p of pages) {
    if (FALSE_GAP.test(p.slug)) {
      report.skippedFalseGaps.push({ slug: p.slug, reason: "junk-slug" });
      continue;
    }
    if (p.status === "unavailable" || isThin(p)) {
      candidates.push({
        slug: p.slug,
        url: p.originalUrl,
        kind: "page",
        reason: p.status === "unavailable" ? "unavailable" : "thin",
      });
    }
  }

  // Always re-check About Us + Gallery even if not flagged thin correctly
  for (const forced of [
    {
      slug: "about-us-meet-the-staff",
      url: `${BASE}/about-us-meet-the-staff.html`,
      kind: "page",
      reason: "staff-completeness",
    },
    {
      slug: "gallery",
      url: `${BASE}/gallery.html`,
      kind: "page",
      reason: "gallery-completeness",
    },
    {
      slug: "gallery--every-time-i-die-at-the-webster-underground-hartford-ct-on-3718",
      url: `${BASE}/gallery/every-time-i-die-at-the-webster-underground-hartford-ct-on-3718.html`,
      kind: "page",
      reason: "gallery-completeness",
    },
  ]) {
    if (!candidates.some((c) => c.slug === forced.slug)) {
      candidates.push(forced);
    }
  }

  // Audit articles missing from archive entirely
  const postSlugs = new Set(posts.map((p) => p.slug));
  for (const article of audit.articles ?? []) {
    const urls = (article.urls ?? [])
      .map((u) => normalizeUrl(String(u).split("#")[0]))
      .filter(Boolean);
    const pretty = urls.find((u) => u.includes("/metal-lifestyle/"));
    const url = pretty || urls.find((u) => u.includes("/1/post/"));
    if (!url || FALSE_GAP.test(url)) continue;
    const slug = slugFromUrl(url);
    const bare = slug.replace(/^\d{4}-\d{2}-/, "");
    if (postSlugs.has(slug) || postSlugs.has(bare)) continue;
    candidates.push({
      slug,
      url,
      kind: "post",
      reason: "missing-from-archive",
      title: article.title,
    });
  }

  // Deduplicate candidates
  const seen = new Set();
  const unique = [];
  for (const c of candidates) {
    if (!c.url || seen.has(c.slug)) continue;
    if (FALSE_GAP.test(c.url) || FALSE_GAP.test(c.slug)) {
      report.skippedFalseGaps.push({ slug: c.slug, reason: "false-gap" });
      continue;
    }
    // Skip malformed page URLs like //part-23...
    if (/weebly\.com\/\/+/i.test(c.url) || /--part-23/i.test(c.slug)) {
      report.skippedFalseGaps.push({
        slug: c.slug,
        reason: "malformed-duplicate-url",
      });
      continue;
    }
    seen.add(c.slug);
    unique.push(c);
  }

  // Prefer completeness targets before long unavailable tail
  const priority = (c) => {
    if (c.reason === "staff-completeness") return 0;
    if (c.reason === "gallery-completeness") return 1;
    if (c.reason === "thin") return 2;
    if (c.reason === "missing-from-archive") return 3;
    return 4;
  };
  unique.sort((a, b) => priority(a) - priority(b));

  const work = LIMIT > 0 ? unique.slice(0, LIMIT) : unique;
  console.log(
    `Gap-fill candidates: ${unique.length} (processing ${work.length})${DRY ? " [dry-run]" : ""}`,
  );

  let staffPostsForBios = [];

  for (let i = 0; i < work.length; i++) {
    const target = work[i];
    process.stdout.write(
      `[${i + 1}/${work.length}] ${target.kind} ${target.slug} … `,
    );
    try {
      const result = await tryRecoverUrl(target, target.kind);
      if (!result.ok) {
        console.log(result.reason);
        if (target.reason === "unavailable" || target.reason === "missing-from-archive") {
          report.stillUnavailable.push({
            slug: target.slug,
            url: target.url,
            kind: target.kind,
            confidence: result.reason === "empty-body" ? "high" : "medium",
            note:
              result.reason === "empty-body"
                ? "Host returned a page without recoverable editorial body (empty widget or tombstone)."
                : `Fetch/parse failed: ${result.reason}`,
          });
        }
        await sleep(DELAY_MS);
        continue;
      }

      const existingEntry = bySlug.get(target.slug);
      const existing = existingEntry?.record ?? null;
      const decision = shouldMerge(existing, result.parsed);

      if (!decision.merge) {
        console.log(`skip (${decision.mode})`);
        report.actions.push({
          slug: target.slug,
          action: "skip",
          mode: decision.mode,
        });
        await sleep(DELAY_MS);
        continue;
      }

      const imageUrls = [
        ...new Set([
          ...(result.parsed.images || []),
          ...(decision.newImgs || []),
        ]),
      ];
      const media = await saveMedia(target.slug, imageUrls);
      const savedNew = media.filter((m) => m.status === "saved").length;
      report.recovered.missingImages += Math.max(
        0,
        savedNew - (existing?.media || []).filter((m) => m.status === "saved")
          .length,
      );

      let contentHtml = rewriteMediaInHtml(
        result.parsed.contentHtml || "",
        media,
      );

      // Preserve stewardship: strip adsense if present
      contentHtml = contentHtml
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/wsite-adsense[\s\S]*?(?=<|$)/gi, "");

      const record = {
        ...(existing || {}),
        slug: target.slug,
        kind: target.kind,
        title:
          result.parsed.title ||
          existing?.title ||
          target.title ||
          target.slug,
        originalUrl: target.url,
        publicationDate:
          result.parsed.publicationDate ?? existing?.publicationDate ?? null,
        dateRaw: result.parsed.dateRaw ?? existing?.dateRaw ?? null,
        author: existing?.author ?? null,
        category: existing?.category ?? null,
        contentHtml:
          decision.mode === "media-only"
            ? existing.contentHtml
            : contentHtml,
        text:
          decision.mode === "media-only"
            ? existing.text
            : result.parsed.text || "",
        pageType: result.parsed.pageType || existing?.pageType || target.kind,
        images: [
          ...new Set([...(existing?.images || []), ...imageUrls]),
        ],
        media: mergeMedia(existing?.media || [], media),
        status: "restored",
        archivedAt: existing?.archivedAt || ARCHIVE_DATE,
        gapFilledAt: ARCHIVE_DATE,
        gapFillMode: decision.mode,
        preservationNotes: [
          ...(existing?.preservationNotes || []),
          `Gap-fill ${ARCHIVE_DATE}: ${decision.mode}`,
        ],
      };

      if (result.parsed.galleryRecovered) {
        report.recovered.galleries += 1;
        record.galleryItemCount = result.parsed.galleryCount;
      }

      if (decision.mode === "fill-unavailable" && target.kind === "post") {
        report.recovered.unavailableArticlesFilled += 1;
      }
      if (
        decision.mode === "fill-thin" ||
        decision.mode === "expand-staff-page"
      ) {
        report.recovered.missingParagraphsPages += 1;
      }
      if (decision.mode === "expand-staff-page") {
        report.recovered.staffProfiles = result.parsed.staffPosts?.length || 0;
        staffPostsForBios = result.parsed.staffPosts || [];
      }

      writeRecord(target.kind === "post" ? POSTS_DIR : PAGES_DIR, record);
      bySlug.set(target.slug, { record, kind: target.kind });
      console.log(`merged (${decision.mode}) len=${textLen(record.contentHtml)}`);
      report.actions.push({
        slug: target.slug,
        action: "merged",
        mode: decision.mode,
        textLength: textLen(record.contentHtml),
      });
    } catch (err) {
      console.log(`error ${err.status || err.message}`);
      report.stillUnavailable.push({
        slug: target.slug,
        url: target.url,
        kind: target.kind,
        confidence: err.status === 404 ? "high" : "medium",
        note: `Still unreachable: ${err.message}`,
      });
    }
    await sleep(DELAY_MS);
  }

  // Live nav comparison (homepage)
  try {
    const homeHtml = await fetchHtml(`${BASE}/`);
    const $ = cheerio.load(homeHtml);
    const liveNav = [];
    $(".wsite-menu-default a, #wsite-menu-main a, .wsite-menu a").each(
      (_, el) => {
        const label = $(el).text().replace(/\s+/g, " ").trim();
        const href = normalizeUrl($(el).attr("href"));
        if (label && href) liveNav.push({ label, href });
      },
    );
    const navConfigPath = path.join(
      ROOT,
      "src/config/metal-lifestyle.ts",
    );
    const navSrc = fs.readFileSync(navConfigPath, "utf8");
    const missingNav = liveNav.filter(
      (n) =>
        n.label.length > 1 &&
        !/home/i.test(n.label) &&
        !FALSE_GAP.test(n.href) &&
        !navSrc.includes(n.label.slice(0, 24)),
    );
    report.liveNavCount = liveNav.length;
    report.missingNavigationCandidates = missingNav;
    report.recovered.navigationItems = 0; // observational unless we patch config
    if (missingNav.length) {
      report.actions.push({
        action: "nav-gap-observed",
        items: missingNav,
      });
    }
  } catch (err) {
    report.actions.push({ action: "nav-check-failed", error: err.message });
  }

  // Rebuild indexes from disk
  const postsFinal = loadJsonDir(POSTS_DIR);
  const pagesFinal = loadJsonDir(PAGES_DIR);
  rebuildManifest(postsFinal, pagesFinal);
  let authors = rebuildAuthors(postsFinal);
  if (staffPostsForBios.length) {
    report.recovered.authorBiographies = applyStaffBiographies(
      authors,
      staffPostsForBios,
    );
  } else {
    // If staff page already merged this run, re-read it
    const about = pagesFinal.find((p) => p.slug === "about-us-meet-the-staff");
    if (about && /<h2 class="wsite-content-title">/i.test(about.contentHtml || "")) {
      const $ = cheerio.load(`<div>${about.contentHtml}</div>`);
      const reconstructed = [];
      $("h2.wsite-content-title").each((_, el) => {
        const title = $(el).text().trim();
        let html = "";
        let node = el.nextSibling;
        while (node && !(node.type === "tag" && node.name === "h2")) {
          html += $.html(node);
          node = node.nextSibling;
        }
        reconstructed.push({
          title,
          text: cheerio.load(html).text(),
        });
      });
      if (reconstructed.length) {
        authors = JSON.parse(
          fs.readFileSync(path.join(ARCHIVE, "authors.json"), "utf8"),
        );
        report.recovered.authorBiographies = applyStaffBiographies(
          authors,
          reconstructed,
        );
        report.recovered.staffProfiles = Math.max(
          report.recovered.staffProfiles,
          reconstructed.length,
        );
      }
    }
  }

  // Write report
  const md = [
    "# Metal Lifestyle — Gap Fill Report",
    "",
    `Generated: ${report.generatedAt}`,
    DRY ? "Mode: dry-run (no writes)" : "Mode: merge into baseline archive",
    "",
    "## Recovered",
    "",
    `- Staff profiles merged into About Us: **${report.recovered.staffProfiles}**`,
    `- Author biographies applied: **${report.recovered.authorBiographies}**`,
    `- Missing images saved (net): **${report.recovered.missingImages}**`,
    `- Thin/incomplete pages expanded: **${report.recovered.missingParagraphsPages}**`,
    `- Previously unavailable articles filled: **${report.recovered.unavailableArticlesFilled}**`,
    `- Galleries recovered: **${report.recovered.galleries}**`,
    `- Navigation items added: **${report.recovered.navigationItems}**`,
    "",
    "## Still unavailable",
    "",
    ...(report.stillUnavailable.length
      ? report.stillUnavailable.map(
          (u) =>
            `- \`${u.slug}\` (${u.kind}) — confidence **${u.confidence}** — ${u.note} — ${u.url}`,
        )
      : ["- None in this pass."]),
    "",
    "## False gaps ignored",
    "",
    `- Count: ${report.skippedFalseGaps.length}`,
    "",
    "## Actions",
    "",
    "```json",
    JSON.stringify(report.actions.slice(0, 100), null, 2),
    report.actions.length > 100
      ? `\n… ${report.actions.length - 100} more`
      : "",
    "```",
    "",
  ].join("\n");

  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, md, "utf8");
  fs.writeFileSync(REPORT_JSON, JSON.stringify(report, null, 2), "utf8");
  console.log(`\nWrote ${REPORT_PATH}`);
  console.log(JSON.stringify(report.recovered, null, 2));
}

function mergeMedia(existing, incoming) {
  const map = new Map();
  for (const m of existing) map.set(m.originalUrl, m);
  for (const m of incoming) {
    const prev = map.get(m.originalUrl);
    if (!prev || (prev.status !== "saved" && m.status === "saved")) {
      map.set(m.originalUrl, m);
    }
  }
  return [...map.values()];
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
