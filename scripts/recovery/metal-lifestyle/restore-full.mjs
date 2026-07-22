/**
 * Full Metal Lifestyle publication restoration.
 * Recovers every discoverable article and static page from the live Weebly site
 * (and audit inventory). Does not filter by author.
 *
 * Usage: npm run recovery:ml:restore-full
 * Options: --limit=N (smoke test), --skip-media, --pages-only, --posts-only
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  normalizeUrl,
  parseArticlePage,
} from "./lib/weebly-parser.mjs";
import {
  assertMayMutateArchive,
  shouldSkipExistingRestored,
} from "./lib/preservation-lock.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "../../..");
const AUDIT_PATH = path.join(
  ROOT,
  "recovery/metal-lifestyle/reports/audit.json",
);
const OUT_DIR = path.join(ROOT, "content/archives/metal-lifestyle");
const POSTS_DIR = path.join(OUT_DIR, "posts");
const PAGES_DIR = path.join(OUT_DIR, "pages");
const RAW_DIR = path.join(ROOT, "recovery/metal-lifestyle/raw");
const MEDIA_DIR = path.join(
  ROOT,
  "public/images/archives/metal-lifestyle/media",
);

const BASE = "https://metallifestyle.weebly.com";
const DELAY_MS = 450;
const ARCHIVE_DATE = new Date().toISOString().slice(0, 10);

const args = process.argv.slice(2);
assertMayMutateArchive(args, "recovery:ml:restore-full");
const FORCE = args.includes("--force");
const LIMIT = Number(
  args.find((a) => a.startsWith("--limit="))?.split("=")[1] ?? 0,
);
const SKIP_MEDIA = args.includes("--skip-media");
const PAGES_ONLY = args.includes("--pages-only");
const POSTS_ONLY = args.includes("--posts-only");

const STATIC_SEEDS = [
  "/dysphoria.html",
  "/american-metalcore-project.html",
  "/prisms-local-show-recap.html",
  "/fear-short-horror-tales-from-the-team.html",
  "/curtains-movie--tv-reviews.html",
  "/about-us-meet-the-staff.html",
  "/gaming-corner.html",
  "/gallery.html",
];

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function slugFromUrl(url) {
  try {
    const u = new URL(url);
    let p = u.pathname.replace(/\.html$/i, "").replace(/\/+$/, "");
    if (p.startsWith("/metal-lifestyle/")) {
      return p.slice("/metal-lifestyle/".length).replace(/\//g, "--");
    }
    if (p.startsWith("/1/post/")) {
      // /1/post/2017/01/review-foo → 2017-01-review-foo
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

async function fetchHtml(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "BloodsoakedMedia-ArchiveRecovery/1.0 (full publication preservation)",
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

function collectTargets(audit) {
  const posts = new Map();
  const pages = new Map();

  // Pass 1 — pretty /metal-lifestyle/ permalinks (canonical public URLs)
  for (const article of audit.articles ?? []) {
    const urls = (article.urls ?? [])
      .map((u) => normalizeUrl(String(u).split("#")[0]))
      .filter(Boolean);
    const pretty = urls.find((u) => u.includes("/metal-lifestyle/"));
    if (!pretty) continue;
    const slug = slugFromUrl(pretty);
    if (posts.has(slug)) continue;
    posts.set(slug, {
      slug,
      url: pretty.replace(/^http:/, "https:"),
      title: article.title ?? null,
      publicationDate: article.publicationDate ?? null,
      kind: "post",
    });
  }

  // Pass 2 — legacy /1/post/ paths only when no pretty twin exists
  for (const article of audit.articles ?? []) {
    const urls = (article.urls ?? [])
      .map((u) => normalizeUrl(String(u).split("#")[0]))
      .filter(Boolean);
    if (urls.some((u) => u.includes("/metal-lifestyle/"))) continue;
    const legacy = urls.find((u) => u.includes("/1/post/"));
    if (!legacy) continue;
    const slug = slugFromUrl(legacy);
    const bare = slug.replace(/^\d{4}-\d{2}-/, "");
    if (posts.has(slug) || posts.has(bare)) continue;
    posts.set(slug, {
      slug,
      url: legacy.replace(/^http:/, "https:"),
      title: article.title ?? null,
      publicationDate: article.publicationDate ?? null,
      kind: "post",
    });
  }

  for (const entry of audit.allUrls ?? []) {
    const raw = entry.url;
    if (!raw) continue;
    const canonical = normalizeUrl(String(raw).split("#")[0]);
    if (!canonical || !canonical.includes("metallifestyle.weebly.com")) continue;

    const type = entry.type;
    if (
      type === "article_pretty" ||
      type === "article_legacy" ||
      type === "pagination" ||
      type === "feed" ||
      type === "homepage" ||
      type === "archive_index"
    ) {
      continue;
    }

    // Skip Weebly chrome / pagination / feed noise
    if (
      /cdn-cgi|\/feed$|\/\d+\/feed|--feed$|--previous--|--category--/i.test(
        canonical,
      )
    ) {
      continue;
    }

    // Nested blogs (prisms, gaming-corner, etc.) and static hubs
    if (
      type === "static_page" ||
      type === "other" ||
      /\/(prisms-local-show-recap|gaming-corner|dysphoria|curtains|fear|american-metalcore|gallery|about-us)\//i.test(
        canonical,
      )
    ) {
      const key = pageKeyFromUrl(canonical);
      if (!pages.has(key) && !canonical.includes("/metal-lifestyle/")) {
        pages.set(key, {
          slug: key,
          url: canonical.replace(/^http:/, "https:"),
          title: null,
          kind: "page",
        });
      }
    }
  }

  for (const seed of STATIC_SEEDS) {
    const url = `${BASE}${seed}`;
    const key = pageKeyFromUrl(url);
    if (!pages.has(key)) {
      pages.set(key, { slug: key, url, title: null, kind: "page" });
    }
  }

  return {
    posts: [...posts.values()],
    pages: [...pages.values()],
  };
}

function extractAuthorHint(text) {
  if (!text) return null;
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const tail = lines.slice(-8).join("\n");
  const patterns = [
    /(?:^|\n)-\s*(Dakota G\.?|Dakota Gochee|DG|D\.|Dakota)\s*$/im,
    /(?:^|\n)(Alex Brown|Alex Bugella|Brian Lesmes|Cesar Gonzalez|Caleb Porter)\s*$/im,
    /(?:^|\n)The Metal Lifestyle Team\s*$/im,
  ];
  for (const re of patterns) {
    const m = tail.match(re);
    if (m) return m[1].replace(/^-\s*/, "").trim();
  }
  return null;
}

async function downloadMedia(imageUrl, slug) {
  try {
    const abs = normalizeUrl(imageUrl);
    if (!abs || !abs.includes("metallifestyle.weebly.com")) {
      return { originalUrl: imageUrl, localPath: null, status: "skipped" };
    }
    const pathname = new URL(abs).pathname;
    const baseName = path.basename(pathname).replace(/[^a-zA-Z0-9._-]/g, "_");
    const fileName = `${slug}--${baseName}`.slice(0, 180);
    const dest = path.join(MEDIA_DIR, fileName);
    const publicPath = `/images/archives/metal-lifestyle/media/${fileName}`;

    if (fs.existsSync(dest) && fs.statSync(dest).size > 500) {
      return { originalUrl: abs, localPath: publicPath, status: "cached" };
    }

    const res = await fetch(abs, {
      headers: {
        "User-Agent":
          "BloodsoakedMedia-ArchiveRecovery/1.0 (full publication preservation)",
      },
    });
    if (!res.ok) {
      return {
        originalUrl: abs,
        localPath: null,
        status: "missing",
        httpStatus: res.status,
      };
    }
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 200 || buf.slice(0, 15).toString().includes("<!DOCTYPE")) {
      return { originalUrl: abs, localPath: null, status: "missing" };
    }
    fs.writeFileSync(dest, buf);
    return { originalUrl: abs, localPath: publicPath, status: "saved" };
  } catch (err) {
    return {
      originalUrl: imageUrl,
      localPath: null,
      status: "missing",
      error: err.message,
    };
  }
}

function rewriteContentHtml(html, mediaMap) {
  if (!html) return html;
  let out = html;
  for (const item of mediaMap) {
    if (!item.localPath || !item.originalUrl) continue;
    const escaped = item.originalUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    out = out.replace(new RegExp(escaped, "g"), item.localPath);
    const pathOnly = item.originalUrl.replace(/^https?:\/\/[^/]+/i, "");
    if (pathOnly) {
      out = out.replaceAll(`src="${pathOnly}"`, `src="${item.localPath}"`);
      out = out.replaceAll(`src='${pathOnly}'`, `src='${item.localPath}'`);
    }
  }
  out = out.replace(/src="(\/uploads\/[^"]+)"/g, `src="${BASE}$1"`);
  out = rewriteInternalLinks(out);
  return out;
}

function rewriteInternalLinks(html) {
  if (!html) return html;
  let out = html;
  // Blog pretty URLs → restored post routes
  out = out.replace(
    /https?:\/\/metallifestyle\.weebly\.com\/metal-lifestyle\/([a-zA-Z0-9_-]+)/g,
    "/the-archives/metal-lifestyle/post/$1",
  );
  out = out.replace(
    /\/\/metallifestyle\.weebly\.com\/metal-lifestyle\/([a-zA-Z0-9_-]+)/g,
    "/the-archives/metal-lifestyle/post/$1",
  );
  // Static .html hubs
  out = out.replace(
    /https?:\/\/metallifestyle\.weebly\.com\/([a-zA-Z0-9_-]+)\.html/g,
    "/the-archives/metal-lifestyle/page/$1",
  );
  // Nested section paths
  out = out.replace(
    /https?:\/\/metallifestyle\.weebly\.com\/([a-zA-Z0-9_-]+\/[a-zA-Z0-9_/-]+)/g,
    (_, pathPart) => {
      const key = pathPart.replace(/\.html$/i, "").replace(/\//g, "--");
      return `/the-archives/metal-lifestyle/page/${key}`;
    },
  );
  return out;
}

function missingAssetNotice(originalUrl) {
  return `<figure class="ml-missing-asset" data-original-src="${originalUrl.replace(/"/g, "&quot;")}">
  <p><strong>Preservation notice:</strong> This image could not be recovered from the original publication.</p>
  <p class="ml-missing-asset-url">${originalUrl}</p>
</figure>`;
}

function injectMissingNotices(html, mediaMap) {
  let out = html;
  for (const item of mediaMap) {
    if (item.status !== "missing" || !item.originalUrl) continue;
    const notice = missingAssetNotice(item.originalUrl);
    const pathOnly = item.originalUrl.replace(/^https?:\/\/[^/]+/i, "");
    // Replace broken img tags pointing at missing assets
    const patterns = [
      new RegExp(
        `<img[^>]+src=["']${item.originalUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["'][^>]*>`,
        "gi",
      ),
      pathOnly
        ? new RegExp(
            `<img[^>]+src=["']${pathOnly.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["'][^>]*>`,
            "gi",
          )
        : null,
    ].filter(Boolean);
    for (const re of patterns) {
      out = out.replace(re, notice);
    }
  }
  return out;
}

async function restoreEntry(target, kind) {
  const dir = kind === "post" ? POSTS_DIR : PAGES_DIR;
  const outPath = path.join(dir, `${target.slug}.json`);

  // Preservation lock: never overwrite already-restored bodies without --force.
  if (shouldSkipExistingRestored(outPath, FORCE)) {
    return JSON.parse(fs.readFileSync(outPath, "utf8"));
  }

  let html;
  let status = "restored";
  let httpStatus = 200;
  try {
    html = await fetchHtml(target.url);
  } catch (err) {
    status = "unavailable";
    httpStatus = err.status ?? 0;
    // Do not replace an existing restored/unavailable record with a weaker notice unless forced.
    if (!FORCE && fs.existsSync(outPath)) {
      return JSON.parse(fs.readFileSync(outPath, "utf8"));
    }
    const record = {
      slug: target.slug,
      kind,
      title: target.title ?? target.slug,
      originalUrl: target.url,
      publicationDate: target.publicationDate ?? null,
      dateRaw: null,
      author: null,
      contentHtml: `<div class="ml-unavailable"><p><strong>Preservation notice:</strong> This page could not be recovered from the original Metal Lifestyle publication.</p><p>Original URL: <a href="${target.url}">${target.url}</a></p><p>HTTP status: ${httpStatus || "n/a"}</p></div>`,
      text: "",
      images: [],
      media: [],
      status,
      httpStatus,
      restoredAt: ARCHIVE_DATE,
    };
    fs.writeFileSync(outPath, JSON.stringify(record, null, 2) + "\n");
    return record;
  }

  const rawName = `${kind}-${target.slug}`.slice(0, 140) + ".html";
  fs.writeFileSync(path.join(RAW_DIR, rawName), html, "utf8");

  const parsed = parseArticlePage(html, target.url);
  const author = extractAuthorHint(parsed.text);
  let media = [];
  if (!SKIP_MEDIA && parsed.images?.length) {
    for (const img of parsed.images) {
      media.push(await downloadMedia(img, target.slug));
      await sleep(80);
    }
  } else {
    media = (parsed.images ?? []).map((originalUrl) => ({
      originalUrl,
      localPath: null,
      status: "skipped",
    }));
  }

  let contentHtml = rewriteContentHtml(parsed.contentHtml || "", media);
  contentHtml = injectMissingNotices(contentHtml, media);

  const record = {
    slug: target.slug,
    kind,
    title: parsed.title || target.title || target.slug,
    originalUrl: target.url,
    publicationDate: parsed.publicationDate ?? target.publicationDate ?? null,
    dateRaw: parsed.dateRaw ?? null,
    author,
    contentHtml,
    text: parsed.text ?? "",
    pageType: parsed.pageType,
    images: parsed.images ?? [],
    media,
    status: parsed.text && parsed.text.length > 40 ? "restored" : "thin",
    httpStatus,
    restoredAt: ARCHIVE_DATE,
  };

  fs.writeFileSync(outPath, JSON.stringify(record, null, 2) + "\n");
  return record;
}

async function main() {
  if (!fs.existsSync(AUDIT_PATH)) {
    console.error("Missing audit.json — run npm run recovery:ml:audit first.");
    process.exit(1);
  }

  fs.mkdirSync(POSTS_DIR, { recursive: true });
  fs.mkdirSync(PAGES_DIR, { recursive: true });
  fs.mkdirSync(RAW_DIR, { recursive: true });
  fs.mkdirSync(MEDIA_DIR, { recursive: true });

  const audit = JSON.parse(fs.readFileSync(AUDIT_PATH, "utf8"));
  let { posts, pages } = collectTargets(audit);

  if (POSTS_ONLY) pages = [];
  if (PAGES_ONLY) posts = [];
  if (LIMIT > 0) {
    posts = posts.slice(0, LIMIT);
    pages = pages.slice(0, Math.max(5, Math.floor(LIMIT / 2)));
  }

  console.log("Metal Lifestyle — full publication restore");
  console.log(`Posts to restore: ${posts.length}`);
  console.log(`Pages to restore: ${pages.length}`);
  console.log(`Skip media: ${SKIP_MEDIA}\n`);

  const manifest = {
    generatedAt: new Date().toISOString(),
    sourceSite: BASE,
    principle: "Full publication restoration — not Dakota-only",
    summary: {
      postsAttempted: posts.length,
      pagesAttempted: pages.length,
      postsRestored: 0,
      pagesRestored: 0,
      unavailable: 0,
      thin: 0,
    },
    posts: [],
    pages: [],
  };

  if (!PAGES_ONLY) {
    for (let i = 0; i < posts.length; i++) {
      const target = posts[i];
      process.stdout.write(`[post ${i + 1}/${posts.length}] ${target.slug}\n`);
      try {
        const record = await restoreEntry(target, "post");
        manifest.posts.push({
          slug: record.slug,
          title: record.title,
          publicationDate: record.publicationDate,
          author: record.author,
          status: record.status,
          originalUrl: record.originalUrl,
        });
        if (record.status === "restored") manifest.summary.postsRestored++;
        else if (record.status === "unavailable")
          manifest.summary.unavailable++;
        else if (record.status === "thin") manifest.summary.thin++;
      } catch (err) {
        console.error(`  FAIL ${target.url}: ${err.message}`);
        manifest.summary.unavailable++;
      }
      await sleep(DELAY_MS);
    }
  }

  if (!POSTS_ONLY) {
    for (let i = 0; i < pages.length; i++) {
      const target = pages[i];
      process.stdout.write(`[page ${i + 1}/${pages.length}] ${target.slug}\n`);
      try {
        const record = await restoreEntry(target, "page");
        manifest.pages.push({
          slug: record.slug,
          title: record.title,
          status: record.status,
          originalUrl: record.originalUrl,
        });
        if (record.status === "restored" || record.status === "thin")
          manifest.summary.pagesRestored++;
        else manifest.summary.unavailable++;
      } catch (err) {
        console.error(`  FAIL ${target.url}: ${err.message}`);
        manifest.summary.unavailable++;
      }
      await sleep(DELAY_MS);
    }
  }

  // Always rewrite manifest from the full on-disk corpus (never a partial batch).
  const { rebuildManifestFromDisk } = await import("./lib/rebuild-manifest-from-disk.mjs");
  const full = rebuildManifestFromDisk({
    priorPath: path.join(OUT_DIR, "manifest.json"),
    note: `restore-full batch complete ${ARCHIVE_DATE}`,
  });

  console.log("\n--- Restore summary (batch) ---");
  console.log(JSON.stringify(manifest.summary, null, 2));
  console.log("\n--- Authoritative index (disk) ---");
  console.log(JSON.stringify(full.summary, null, 2));
  console.log(`Manifest: ${path.join(OUT_DIR, "manifest.json")}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
