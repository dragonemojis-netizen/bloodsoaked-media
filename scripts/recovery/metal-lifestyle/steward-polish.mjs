/**
 * Stewardship polish for restored Metal Lifestyle content.
 * Does not fetch new pages — only repairs formatting, metadata, and media notices.
 *
 * Usage: npm run recovery:ml:steward-polish
 * Sealed archive requires: --force
 */
import fs from "fs";
import path from "path";
import * as cheerio from "cheerio";
import { fileURLToPath } from "url";
import { normalizeUrl } from "./lib/weebly-parser.mjs";
import { assertMayMutateArchive } from "./lib/preservation-lock.mjs";

assertMayMutateArchive(process.argv, "recovery:ml:steward-polish");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "../../..");
const ARCHIVE = path.join(ROOT, "content/archives/metal-lifestyle");
const POSTS_DIR = path.join(ARCHIVE, "posts");
const PAGES_DIR = path.join(ARCHIVE, "pages");
const MANIFEST_PATH = path.join(ARCHIVE, "manifest.json");
const BASE = "https://metallifestyle.weebly.com";
const ARCHIVE_BASE = "/the-archives/metal-lifestyle";

const AUTHOR_ALIASES = {
  // Display keys stay exact on articles; indexes list each distinct byline.
};

function listJson(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => path.join(dir, f));
}

function excerptFromText(text, max = 240) {
  const plain = String(text || "")
    .replace(/\s+/g, " ")
    .trim();
  if (!plain) return "";
  if (plain.length <= max) return plain;
  return `${plain.slice(0, max - 1).trim()}…`;
}

function inferCategory(record) {
  const title = (record.title || "").toLowerCase();
  const text = (record.text || "").slice(0, 400).toLowerCase();
  if (/^single review|^review:|^review\b/.test(title)) return "Reviews";
  if (/interview/.test(title)) return "Interviews";
  if (/gaming|playstation|xbox|nintendo|steam|game\b|dlc\b/.test(title))
    return "Video Games";
  if (/top\s+\d+|best of|albums of|lps of|year.?end|recommendations|q\d/.test(title))
    return "Lists & Features";
  if (/live|prisms|concert|tour|show recap/.test(title)) return "Live";
  if (/movie|film|tv|bojack|cinema|curtains/.test(title)) return "Film & Television";
  if (/opinion|editorial|prediction|side gallery/.test(title)) return "Opinion";
  if (/metal|hardcore|deathcore|grind|punk/.test(text)) return "Metal";
  return "Music";
}

function extractAuthor(text, existing) {
  if (existing && String(existing).trim()) return String(existing).trim();
  if (!text) return null;
  const cleaned = String(text).replace(/[\u200b\u200c\u200d\ufeff]/g, "");
  const patterns = [
    /-\s*(Dakota Gochee|Dakota G\.|Dakota G|DG|D\.|Dakota)\s*$/im,
    /-\s*(Alex Brown|Alex Bugella|Brian Lesmes|Cesar Gonzalez|Caleb Porter|Michael Terry)\s*$/im,
    /(The Metal Lifestyle Team)\s*$/im,
    /(Dakota Gochee|Dakota G\.|Dakota G|DG|Alex Brown|Alex Bugella|Brian Lesmes|Cesar Gonzalez|Caleb Porter|Michael Terry)\s*$/im,
  ];
  for (const re of patterns) {
    const m = cleaned.trim().match(re);
    if (m) return m[1].replace(/^-\s*/, "").trim();
  }
  // Title-prefixed columns (e.g. "Alex Brown's Top Ten…")
  return null;
}

function rewriteInternalLinks(html, knownPostSlugs, knownPageSlugs) {
  if (!html) return html;
  const $ = cheerio.load(html, { decodeEntities: false });

  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;

    // Already pointing at the preserved archive — never re-resolve against Weebly.
    if (
      href.startsWith(ARCHIVE_BASE) ||
      href.startsWith("/the-archives/metal-lifestyle")
    ) {
      return;
    }
    // Mangled form from prior polish: Weebly host + archive path
    if (/metallifestyle\.weebly\.com\/the-archives\/metal-lifestyle/i.test(href)) {
      try {
        const u = new URL(href, BASE);
        $(el).attr("href", u.pathname + u.search + u.hash);
      } catch {
        /* keep */
      }
      return;
    }

    const abs = normalizeUrl(href.split("#")[0], BASE);
    if (!abs || !abs.includes("metallifestyle.weebly.com")) return;

    try {
      const u = new URL(abs);
      let p = u.pathname.replace(/\.html$/i, "").replace(/\/+$/, "");

      if (p.startsWith("/metal-lifestyle/")) {
        const slug = p.slice("/metal-lifestyle/".length);
        if (knownPostSlugs.has(slug)) {
          $(el).attr("href", `${ARCHIVE_BASE}/post/${slug}`);
          $(el).removeAttr("data-ml-dead");
          $(el).removeAttr("data-ml-external-archive");
        } else {
          $(el).attr("href", abs);
          $(el).attr("data-ml-external-archive", "unrestored");
        }
        return;
      }

      if (p.startsWith("/1/post/")) {
        const parts = p.split("/").filter(Boolean);
        const legacySlug = parts.slice(2).join("-");
        const bare = legacySlug.replace(/^\d{4}-\d{2}-/, "");
        const hit = knownPostSlugs.has(bare)
          ? bare
          : knownPostSlugs.has(legacySlug)
            ? legacySlug
            : null;
        if (hit) {
          $(el).attr("href", `${ARCHIVE_BASE}/post/${hit}`);
          $(el).removeAttr("data-ml-external-archive");
        } else {
          $(el).attr("href", abs);
          $(el).attr("data-ml-external-archive", "unrestored");
        }
        return;
      }

      const pageKey = p.replace(/^\//, "").replace(/\//g, "--");
      if (knownPageSlugs.has(pageKey)) {
        $(el).attr("href", `${ARCHIVE_BASE}/page/${pageKey}`);
        $(el).removeAttr("data-ml-external-archive");
      } else if (p.length > 1) {
        $(el).attr("href", abs);
        $(el).attr("data-ml-external-archive", "unrestored");
      }
    } catch {
      /* keep original */
    }
  });

  return $("body").html() ?? html;
}

function polishHtml(html, media = []) {
  if (!html) return html;
  const $ = cheerio.load(html, { decodeEntities: false });

  // Remove defunct AdSense / Weebly ad chrome (not editorial content)
  $(".wsite-adsense").remove();
  $('script[src*="serveAds"]').remove();
  $('script[src*="adsense"]').remove();

  // Normalize empty zero-width leftovers
  $("*").each((_, el) => {
    const node = $(el);
    if (node.children().length === 0) {
      const t = node.text().replace(/[\u200b\u200c\u200d\ufeff​]/g, "").trim();
      if (!t && ["span", "font"].includes(el.tagName)) {
        node.remove();
      }
    }
  });

  // Missing local media → archival placeholder (preserve layout box)
  for (const item of media) {
    if (item.status !== "missing" || !item.originalUrl) continue;
    const pathOnly = item.originalUrl.replace(/^https?:\/\/[^/]+/i, "");
    const selectors = [
      `img[src="${item.originalUrl}"]`,
      pathOnly ? `img[src="${pathOnly}"]` : null,
      item.localPath ? `img[src="${item.localPath}"]` : null,
    ].filter(Boolean);

    for (const sel of selectors) {
      $(sel).each((_, img) => {
        const $img = $(img);
        const alt = $img.attr("alt") || "Historical image";
        const notice = `
<figure class="ml-missing-asset" data-original-src="${item.originalUrl.replace(/"/g, "&quot;")}">
  <div class="ml-missing-asset-frame" aria-hidden="true"></div>
  <figcaption>
    <strong>Preservation notice:</strong> This image is known to have appeared in the original publication but could not be recovered.
    <span class="ml-missing-asset-url">${item.originalUrl}</span>
  </figcaption>
</figure>`;
        $img.replaceWith(notice);
      });
    }
  }

  // Broken leftover remote weebly images that 404 often — leave absolute;
  // runtime CSS handles onerror via not applicable; keep structure.

  // YouTube iframes: ensure responsive wrapper
  $("iframe[src*='youtube'], iframe[src*='youtu.be']").each((_, el) => {
    const $el = $(el);
    if (!$el.parent().hasClass("ml-embed")) {
      $el.wrap('<div class="ml-embed ml-embed--video"></div>');
    }
  });

  return $("body").html() ?? html;
}

function buildPreservation(record) {
  const missingAssets = (record.media || [])
    .filter((m) => m.status === "missing")
    .map((m) => m.originalUrl);

  return {
    originalUrl: record.originalUrl,
    recoverySource: "live-weebly",
    recoveryDate: record.restoredAt || null,
    preservationStatus: record.status,
    missingAssets,
    waybackSnapshotDate: null,
    polishedAt: new Date().toISOString().slice(0, 10),
  };
}

function polishRecord(record, knownPostSlugs, knownPageSlugs) {
  const author = extractAuthor(record.text, record.author);
  let contentHtml = polishHtml(record.contentHtml || "", record.media || []);
  contentHtml = rewriteInternalLinks(
    contentHtml,
    knownPostSlugs,
    knownPageSlugs,
  );

  const category = record.category || inferCategory({ ...record, author });
  const excerpt = record.excerpt || excerptFromText(record.text);

  // Unavailable notice quality
  if (record.status === "unavailable") {
    contentHtml = `<div class="ml-unavailable">
  <p class="ml-unavailable-label">Preservation notice</p>
  <p>This page is known to have existed but could not yet be fully recovered.</p>
  <p>Original URL: <a href="${record.originalUrl}">${record.originalUrl}</a></p>
  ${record.httpStatus ? `<p>Last recovery attempt returned HTTP ${record.httpStatus}.</p>` : ""}
</div>`;
  }

  return {
    ...record,
    author,
    category,
    excerpt,
    contentHtml,
    preservation: buildPreservation(record),
  };
}

function authorSlug(name) {
  return String(name)
    .trim()
    .toLowerCase()
    .replace(/\./g, "dot")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function categorySlug(name) {
  return String(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function main() {
  const postFiles = listJson(POSTS_DIR);
  const pageFiles = listJson(PAGES_DIR);

  const knownPostSlugs = new Set(
    postFiles.map((f) => path.basename(f, ".json")),
  );
  const knownPageSlugs = new Set(
    pageFiles.map((f) => path.basename(f, ".json")),
  );

  const authors = new Map();
  const categories = new Map();
  const postsMeta = [];
  const pagesMeta = [];

  let polished = 0;
  let adsStripped = 0;

  for (const file of postFiles) {
    const raw = JSON.parse(fs.readFileSync(file, "utf8"));
    if (/wsite-adsense|serveAds/.test(raw.contentHtml || "")) adsStripped++;
    const next = polishRecord(raw, knownPostSlugs, knownPageSlugs);
    fs.writeFileSync(file, JSON.stringify(next, null, 2) + "\n");
    polished++;

    postsMeta.push({
      slug: next.slug,
      title: next.title,
      publicationDate: next.publicationDate,
      author: next.author,
      category: next.category,
      excerpt: next.excerpt,
      status: next.status,
      originalUrl: next.originalUrl,
    });

    if (next.author) {
      const key = next.author;
      if (!authors.has(key)) {
        authors.set(key, {
          name: key,
          slug: authorSlug(key),
          articleSlugs: [],
        });
      }
      authors.get(key).articleSlugs.push(next.slug);
    }

    if (next.category) {
      const key = next.category;
      if (!categories.has(key)) {
        categories.set(key, {
          name: key,
          slug: categorySlug(key),
          description: null,
          articleSlugs: [],
        });
      }
      categories.get(key).articleSlugs.push(next.slug);
    }
  }

  for (const file of pageFiles) {
    const raw = JSON.parse(fs.readFileSync(file, "utf8"));
    const next = polishRecord(raw, knownPostSlugs, knownPageSlugs);
    fs.writeFileSync(file, JSON.stringify(next, null, 2) + "\n");
    polished++;
    pagesMeta.push({
      slug: next.slug,
      title: next.title,
      status: next.status,
      originalUrl: next.originalUrl,
    });
  }

  // Sort author/category article lists by date via post lookup
  const dateBySlug = new Map(
    postsMeta.map((p) => [p.slug, p.publicationDate || ""]),
  );
  const sortSlugs = (slugs) =>
    [...slugs].sort((a, b) =>
      (dateBySlug.get(b) || "").localeCompare(dateBySlug.get(a) || ""),
    );

  const priorAuthors = (() => {
    const p = path.join(ARCHIVE, "authors.json");
    if (!fs.existsSync(p)) return new Map();
    try {
      return new Map(
        JSON.parse(fs.readFileSync(p, "utf8")).map((a) => [a.name, a]),
      );
    } catch {
      return new Map();
    }
  })();

  const authorsOut = [...authors.values()].map((a) => {
    const prior = priorAuthors.get(a.name);
    return {
      ...a,
      articleSlugs: sortSlugs(a.articleSlugs),
      publicationCount: a.articleSlugs.length,
      // Preservation lock: never wipe biographies during polish.
      biography: prior?.biography ?? null,
      profileTitle: prior?.profileTitle,
      profileFrom: prior?.profileFrom,
    };
  });
  authorsOut.sort((a, b) => b.publicationCount - a.publicationCount);

  const categoriesOut = [...categories.values()].map((c) => ({
    ...c,
    articleSlugs: sortSlugs(c.articleSlugs),
    articleCount: c.articleSlugs.length,
  }));
  categoriesOut.sort((a, b) => b.articleCount - a.articleCount);

  postsMeta.sort((a, b) =>
    (b.publicationDate || "").localeCompare(a.publicationDate || ""),
  );

  const manifest = fs.existsSync(MANIFEST_PATH)
    ? JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"))
    : {};

  const nextManifest = {
    ...manifest,
    polishedAt: new Date().toISOString(),
    principle: "Full publication stewardship — authenticity over modernization",
    posts: postsMeta,
    pages: pagesMeta,
    authors: authorsOut,
    categories: categoriesOut,
    summary: {
      ...(manifest.summary || {}),
      postsIndexed: postsMeta.length,
      pagesIndexed: pagesMeta.length,
      authors: authorsOut.length,
      categories: categoriesOut.length,
      adsStripped,
      polished,
    },
  };

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(nextManifest, null, 2) + "\n");
  fs.writeFileSync(
    path.join(ARCHIVE, "authors.json"),
    JSON.stringify(authorsOut, null, 2) + "\n",
  );
  fs.writeFileSync(
    path.join(ARCHIVE, "categories.json"),
    JSON.stringify(categoriesOut, null, 2) + "\n",
  );

  console.log("Steward polish complete");
  console.log(JSON.stringify(nextManifest.summary, null, 2));
}

main();
