/**
 * Fetches Vault cover/poster/album art into public/images/vault/
 * Run: node scripts/fetch-vault-covers.mjs [--force]
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const LIBRARY = path.join(ROOT, "content", "vault-cover-library.json");
const OUT = path.join(ROOT, "public", "images", "vault");
const headers = {
  "User-Agent": "BloodsoakedMedia/1.0 (vault cover fetch; contact@bloodsoakedmedia.com)",
};

function wikiPath(title) {
  return encodeURIComponent(title.replace(/ /g, "_"));
}

async function fetchCover(title) {
  const summary = await fetch(
    `https://en.wikipedia.org/api/rest_v1/page/summary/${wikiPath(title)}`,
    { headers },
  );
  if (summary.ok) {
    const data = await summary.json();
    if (data.thumbnail?.source) return data.thumbnail.source;
    if (data.originalimage?.source) return data.originalimage.source;
  }

  const url = new URL("https://en.wikipedia.org/w/api.php");
  url.searchParams.set("action", "query");
  url.searchParams.set("format", "json");
  url.searchParams.set("redirects", "1");
  url.searchParams.set("titles", title);
  url.searchParams.set("prop", "pageimages");
  url.searchParams.set("piprop", "thumbnail|original");
  url.searchParams.set("pithumbsize", "800");
  const res = await fetch(url, { headers });
  if (!res.ok) return null;
  const data = await res.json();
  for (const page of Object.values(data.query?.pages ?? {})) {
    if (page.pageid > 0) {
      return page.original?.source ?? page.thumbnail?.source ?? null;
    }
  }
  return null;
}

async function download(url, dest) {
  const res = await fetch(url, { headers });
  if (!res.ok) return false;
  fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
  return true;
}

const force = process.argv.includes("--force");
const lib = JSON.parse(fs.readFileSync(LIBRARY, "utf8")).entries ?? {};
fs.mkdirSync(OUT, { recursive: true });

for (const [slug, meta] of Object.entries(lib)) {
  const dest = path.join(OUT, `${slug}.jpg`);
  if (fs.existsSync(dest) && !force) continue;
  if (!meta.wikipedia) continue;
  const img = await fetchCover(meta.wikipedia);
  if (img && (await download(img, dest))) {
    console.log(`Saved ${slug}.jpg`);
  } else {
    console.warn(`Failed: ${slug} (${meta.wikipedia})`);
  }
  await new Promise((r) => setTimeout(r, 300));
}
