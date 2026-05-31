/**
 * Fetches cover art from curated Wikipedia page titles into public/images/media-log/.
 * Run: node scripts/fetch-media-log-covers.mjs [--force]
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const LIBRARY_PATH = path.join(ROOT, "content", "media-log", "cover-library.json");
const OUT_DIR = path.join(ROOT, "public", "images", "media-log");

const headers = {
  "User-Agent": "BloodsoakedMedia/1.0 (media-log cover fetch; contact@bloodsoakedmedia.com)",
};

function wikiTitleToApiPath(title) {
  return encodeURIComponent(title.replace(/ /g, "_"));
}

async function queryPageImage(title) {
  const apiUrl = new URL("https://en.wikipedia.org/w/api.php");
  apiUrl.searchParams.set("action", "query");
  apiUrl.searchParams.set("format", "json");
  apiUrl.searchParams.set("redirects", "1");
  apiUrl.searchParams.set("titles", title);
  apiUrl.searchParams.set("prop", "pageimages");
  apiUrl.searchParams.set("piprop", "thumbnail|original");
  apiUrl.searchParams.set("pithumbsize", "600");

  const res = await fetch(apiUrl, { headers });
  if (!res.ok) return null;
  const data = await res.json();
  const pages = data.query?.pages ?? {};
  for (const page of Object.values(pages)) {
    if (page.pageid && page.pageid > 0) {
      return page.original?.source ?? page.thumbnail?.source ?? null;
    }
  }
  return null;
}

async function searchWikipediaTitle(query) {
  const apiUrl = new URL("https://en.wikipedia.org/w/api.php");
  apiUrl.searchParams.set("action", "query");
  apiUrl.searchParams.set("format", "json");
  apiUrl.searchParams.set("list", "search");
  apiUrl.searchParams.set("srsearch", query);
  apiUrl.searchParams.set("srlimit", "3");
  apiUrl.searchParams.set("srnamespace", "0");

  const res = await fetch(apiUrl, { headers });
  if (!res.ok) return null;
  const data = await res.json();
  return data.query?.search?.[0]?.title ?? null;
}

async function fetchWikipediaCover(title, searchHint) {
  const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${wikiTitleToApiPath(title)}`;
  const summaryRes = await fetch(summaryUrl, { headers });
  if (summaryRes.ok) {
    const data = await summaryRes.json();
    if (data.thumbnail?.source) return { url: data.thumbnail.source, matchedTitle: title };
    if (data.originalimage?.source) {
      return { url: data.originalimage.source, matchedTitle: title };
    }
  }

  let image = await queryPageImage(title);
  if (image) return { url: image, matchedTitle: title };

  if (searchHint) {
    const found = await searchWikipediaTitle(`${searchHint} video game`);
    if (found && found !== title) {
      image = await queryPageImage(found);
      if (image) return { url: image, matchedTitle: found };
    }
  }

  return null;
}

async function downloadImage(url, dest) {
  const res = await fetch(url, { headers });
  if (!res.ok) return false;
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(dest, buf);
  return true;
}

const force = process.argv.includes("--force");
const library = JSON.parse(fs.readFileSync(LIBRARY_PATH, "utf8"));
const fetchLog = [];
fs.mkdirSync(OUT_DIR, { recursive: true });

let saved = 0;
let skipped = 0;
let failed = 0;

for (const [slug, meta] of Object.entries(library.entries ?? {})) {
  const dest = path.join(OUT_DIR, `${slug}.jpg`);
  if (fs.existsSync(dest) && !force) {
    skipped++;
    fetchLog.push({ slug, status: "skipped" });
    continue;
  }
  if (meta.local) {
    const src = path.join(ROOT, meta.local.replace(/^\//, ""));
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
      saved++;
      fetchLog.push({ slug, status: "local_copy" });
      continue;
    }
  }
  if (!meta.wikipedia) {
    skipped++;
    fetchLog.push({ slug, status: "no_source" });
    continue;
  }

  const result = await fetchWikipediaCover(
    meta.wikipedia,
    meta.searchHint ?? meta.wikipedia,
  );
  if (!result?.url) {
    console.warn(`No cover: ${slug} (${meta.wikipedia})`);
    failed++;
    fetchLog.push({ slug, status: "failed", wikipedia: meta.wikipedia });
    continue;
  }
  const ok = await downloadImage(result.url, dest);
  if (ok) {
    console.log(`Saved ${slug}.jpg <- ${result.matchedTitle}`);
    saved++;
    fetchLog.push({
      slug,
      status: "saved",
      wikipedia: meta.wikipedia,
      matchedTitle: result.matchedTitle,
    });
  } else {
    failed++;
    fetchLog.push({ slug, status: "download_failed", wikipedia: meta.wikipedia });
  }
  await new Promise((r) => setTimeout(r, 300));
}

const logPath = path.join(ROOT, "content", "media-log", "reports", "cover-fetch-log.json");
fs.mkdirSync(path.dirname(logPath), { recursive: true });
fs.writeFileSync(
  logPath,
  JSON.stringify({ generatedAt: new Date().toISOString(), saved, skipped, failed, entries: fetchLog }, null, 2),
  "utf8",
);

console.log(`Covers: ${saved} saved, ${skipped} skipped, ${failed} failed.`);
