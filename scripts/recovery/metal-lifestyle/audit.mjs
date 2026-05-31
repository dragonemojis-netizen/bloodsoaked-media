/**
 * Comprehensive Metal Lifestyle recovery audit — discovery only, no import.
 * Usage: npm run recovery:ml:audit
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  articleCanonicalKey,
  classifyUrl,
  extractAllInternalLinks,
  extractBlogPostUrls,
  extractPaginationUrls,
  isOnDomain,
  monthFromUrl,
  parseFeedEntries,
  parseSitemapUrls,
  yearFromUrl,
} from "./lib/discovery.mjs";
import { normalizeUrl, parseArticlePage, parseBlogDate } from "./lib/weebly-parser.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "../../..");
const RAW_DIR = path.join(ROOT, "recovery/metal-lifestyle/raw");
const REPORTS_DIR = path.join(ROOT, "recovery/metal-lifestyle/reports");
const AUDIT_RAW = path.join(RAW_DIR, "audit");

const BASE = "https://metallifestyle.weebly.com";
const DELAY_MS = 500;
const ERA_YEARS = [2015, 2016, 2017, 2018, 2019];

const SEED_URLS = [
  `${BASE}/`,
  `${BASE}/blog.html`,
  `${BASE}/gallery.html`,
  `${BASE}/about-us-meet-the-staff.html`,
  `${BASE}/gaming-corner.html`,
  `${BASE}/dysphoria.html`,
  `${BASE}/american-metalcore-project.html`,
  `${BASE}/prisms-local-show-recap.html`,
  `${BASE}/fear-short-horror-tales-from-the-team.html`,
  `${BASE}/curtains-movie--tv-reviews.html`,
];

const FEED_CANDIDATES = [
  `${BASE}/1/feed`,
  `${BASE}/feed`,
  `${BASE}/rss.xml`,
  `${BASE}/atom.xml`,
];

const SITEMAP_CANDIDATES = [
  `${BASE}/sitemap.xml`,
  `${BASE}/sitemap_index.xml`,
  `${BASE}/robots.txt`,
];

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchText(url, accept = "text/html") {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "BloodsoakedMedia-ArchiveAudit/1.0 (preservation)",
      Accept: accept.includes("xml") ? "application/xml,text/xml,*/*" : "*/*",
    },
  });
  return { ok: res.ok, status: res.status, body: await res.text(), url };
}

function track(set, url, source) {
  if (!url || !isOnDomain(url)) return;
  if (!set.has(url)) {
    set.set(url, new Set());
  }
  set.get(url).add(source);
}

function isArticleType(type) {
  return type === "article_pretty" || type === "article_legacy";
}

async function discoverPagination() {
  const articles = new Set();
  const visited = new Set();
  const pagesToVisit = [`${BASE}/`];

  for (let p = 2; p <= 60; p++) {
    pagesToVisit.push(`${BASE}/metal-lifestyle/previous/${p}`);
  }

  fs.mkdirSync(AUDIT_RAW, { recursive: true });

  for (let i = 0; i < pagesToVisit.length; i++) {
    const pageUrl = pagesToVisit[i];
    if (visited.has(pageUrl)) continue;
    const { ok, body, status } = await fetchText(pageUrl);
    if (!ok) {
      if (i > 2 && status === 404) break;
      continue;
    }
    visited.add(pageUrl);
    fs.writeFileSync(
      path.join(AUDIT_RAW, `pagination-${i}.html`),
      body,
      "utf8",
    );

    extractBlogPostUrls(body).forEach((u) => articles.add(u));

    // Legacy permalinks embedded in share widgets
    const legacyMatches = body.matchAll(
      /https?:\/\/metallifestyle\.weebly\.com\/1\/post\/\d{4}\/\d{2}\/[^"'\s]+\.html/gi,
    );
    for (const m of legacyMatches) {
      articles.add(normalizeUrl(m[0]));
    }

    await sleep(DELAY_MS);
  }

  return { articles: [...articles], visitedPages: [...visited] };
}

async function discoverFeeds() {
  const results = [];
  for (const feedUrl of FEED_CANDIDATES) {
    const { ok, status, body } = await fetchText(feedUrl, "application/xml");
    results.push({ feedUrl, ok, status, entryCount: 0, entries: [] });
    if (!ok) continue;
    fs.writeFileSync(
      path.join(AUDIT_RAW, `feed-${feedUrl.split("/").pop() || "feed"}.xml`),
      body,
      "utf8",
    );
    const entries = parseFeedEntries(body);
    results[results.length - 1].entryCount = entries.length;
    results[results.length - 1].entries = entries;
  }
  return results;
}

async function discoverSitemaps() {
  const found = [];
  for (const sm of SITEMAP_CANDIDATES) {
    const { ok, status, body } = await fetchText(sm, "application/xml");
    found.push({ url: sm, ok, status, urls: [] });
    if (!ok) continue;
    if (sm.endsWith("robots.txt")) {
      const sitemapLines = body
        .split("\n")
        .filter((l) => l.toLowerCase().startsWith("sitemap:"))
        .map((l) => l.split(":").slice(1).join(":").trim());
      for (const line of sitemapLines) {
        const sub = await fetchText(line, "application/xml");
        if (sub.ok) found.push({ url: line, ok: true, urls: parseSitemapUrls(sub.body) });
      }
    } else {
      found[found.length - 1].urls = parseSitemapUrls(body);
    }
  }
  return found;
}

async function bfsInternalLinks(seeds, maxPages = 120) {
  const queue = [...seeds];
  const seen = new Set();
  const allUrls = new Map();

  while (queue.length > 0 && seen.size < maxPages) {
    const url = queue.shift();
    if (seen.has(url)) continue;
    seen.add(url);

    const { ok, body } = await fetchText(url);
    if (!ok) continue;

    const links = extractAllInternalLinks(body, url);
    for (const link of links) {
      track(allUrls, link.url, "internal_link");
      if (!seen.has(link.url) && seen.size + queue.length < maxPages) {
        const t = classifyUrl(link.url);
        if (t !== "asset" && t !== "feed") queue.push(link.url);
      }
    }
    await sleep(DELAY_MS);
  }

  return { crawled: [...seen], discovered: allUrls };
}

function buildArticleRegistry(sources) {
  const byKey = new Map();

  function addArticle(url, source, meta = {}) {
    const key = articleCanonicalKey(url);
    const type = classifyUrl(url);
    if (!isArticleType(type)) return;

    if (!byKey.has(key)) {
      byKey.set(key, {
        canonicalKey: key,
        urls: [],
        sources: new Set(),
        title: meta.title ?? null,
        publicationDate: meta.publicationDate ?? null,
        year: yearFromUrl(url) ?? (meta.publicationDate ? parseInt(meta.publicationDate.slice(0, 4), 10) : null),
        month: monthFromUrl(url),
      });
    }
    const entry = byKey.get(key);
    if (!entry.urls.includes(url)) entry.urls.push(url);
    entry.sources.add(source);
    if (meta.title && !entry.title) entry.title = meta.title;
    if (meta.publicationDate && !entry.publicationDate) {
      entry.publicationDate = meta.publicationDate;
      entry.year = parseInt(meta.publicationDate.slice(0, 4), 10);
    }
  }

  for (const u of sources.paginationArticles) addArticle(u, "pagination");
  for (const e of sources.rssEntries) {
    addArticle(e.url, "rss", {
      title: e.title,
      publicationDate: e.pubDate ? tryParseRssDate(e.pubDate) : null,
    });
  }
  for (const u of sources.sitemapArticles) addArticle(u, "sitemap");
  for (const u of sources.internalArticles) addArticle(u, "internal_link");

  return [...byKey.values()];
}

function tryParseRssDate(pubDate) {
  const d = new Date(pubDate);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

function analyzeYearGaps(articles) {
  const byYear = Object.fromEntries(ERA_YEARS.map((y) => [y, []]));
  const unknown = [];

  for (const a of articles) {
    if (a.year && byYear[a.year]) byYear[a.year].push(a);
    else unknown.push(a);
  }

  const counts = ERA_YEARS.map((y) => ({ year: y, count: byYear[y].length }));
  const avg =
    counts.reduce((s, c) => s + c.count, 0) / Math.max(counts.length, 1);
  const lowThreshold = Math.max(5, Math.floor(avg * 0.35));

  const lowYears = counts.filter((c) => c.count < lowThreshold && c.count > 0);
  const emptyYears = counts.filter((c) => c.count === 0);

  const byMonth = {};
  for (const a of articles) {
    const m =
      a.publicationDate?.slice(0, 7) ??
      a.month ??
      (a.year ? `${a.year}-??` : "unknown");
    if (!byMonth[m]) byMonth[m] = 0;
    byMonth[m]++;
  }

  const sparseMonths = Object.entries(byMonth)
    .filter(([k]) => k.includes("??") === false && ERA_YEARS.some((y) => k.startsWith(String(y))))
    .filter(([, c]) => c === 0);

  return { byYear, counts, unknown, lowYears, emptyYears, byMonth, avg, lowThreshold };
}

function findDuplicates(articles) {
  return articles
    .filter((a) => a.urls.length > 1)
    .map((a) => ({
      canonicalKey: a.canonicalKey,
      title: a.title,
      urls: a.urls,
      sources: [...a.sources],
    }));
}

function findOrphans(articles, allDiscoveredUrls) {
  const articleUrlSet = new Set();
  articles.forEach((a) => a.urls.forEach((u) => articleUrlSet.add(u)));

  const legacyOnly = articles.filter(
    (a) =>
      a.urls.every((u) => classifyUrl(u) === "article_legacy") &&
      a.urls.length === 1,
  );

  const rssNotPagination = articles.filter(
    (a) => a.sources.has("rss") && !a.sources.has("pagination"),
  );

  const inRssNotPretty = articles.filter((a) => {
    const hasLegacy = a.urls.some((u) => classifyUrl(u) === "article_legacy");
    const hasPretty = a.urls.some((u) => classifyUrl(u) === "article_pretty");
    return hasLegacy && !hasPretty;
  });

  const linkedButNotArticle = [...allDiscoveredUrls.keys()].filter((url) => {
    const t = classifyUrl(url);
    return t === "static_page" || t === "other";
  });

  return {
    legacyOnly,
    rssNotPagination,
    inRssNotPretty,
    nonArticlePages: linkedButNotArticle.slice(0, 50),
  };
}

function compareToPriorInventory(articles) {
  const priorPath = path.join(REPORTS_DIR, "inventory.json");
  if (!fs.existsSync(priorPath)) return null;
  const prior = JSON.parse(fs.readFileSync(priorPath, "utf8"));
  const priorUrls = new Set(
    [
      ...(prior.approvedForImport ?? []),
      ...(prior.requiresReview ?? []),
      ...(prior.excluded ?? []),
    ].map((e) => e.url),
  );
  const auditUrls = new Set();
  articles.forEach((a) => a.urls.forEach((u) => auditUrls.add(u)));

  const missingFromPriorCrawl = [...auditUrls].filter((u) => !priorUrls.has(u));
  const inPriorNotInAudit = [...priorUrls].filter((u) => !auditUrls.has(u));

  return { missingFromPriorCrawl, inPriorNotInAudit, priorTotal: priorUrls.size };
}

function generateMarkdownReport(data) {
  const lines = [];
  lines.push("# Metal Lifestyle Recovery Audit");
  lines.push("");
  lines.push(`**Generated:** ${data.generatedAt}`);
  lines.push(`**Source:** ${BASE}`);
  lines.push("");
  lines.push("> Preservation audit only. No content imported.");
  lines.push("");
  lines.push("## Executive Summary");
  lines.push("");
  lines.push(`| Metric | Count |`);
  lines.push(`|--------|------:|`);
  lines.push(`| Total URLs discovered | ${data.summary.totalUrls} |`);
  lines.push(`| Unique article entries (canonical) | ${data.summary.uniqueArticles} |`);
  lines.push(`| Article URL variants (all forms) | ${data.summary.articleUrlVariants} |`);
  lines.push(`| Duplicate URL groups | ${data.summary.duplicateGroups} |`);
  lines.push(`| RSS feed entries | ${data.summary.rssEntries} |`);
  lines.push(`| Pagination pages crawled | ${data.summary.paginationPages} |`);
  lines.push(`| Internal link crawl pages | ${data.summary.internalCrawlPages} |`);
  lines.push("");
  lines.push("## Discovery Methods");
  lines.push("");
  for (const m of data.discoveryMethods) {
    lines.push(`### ${m.name}`);
    lines.push(`- Status: ${m.status}`);
    lines.push(`- URLs found: ${m.urlCount}`);
    if (m.notes) lines.push(`- Notes: ${m.notes}`);
    lines.push("");
  }
  lines.push("## Publication Era Analysis (2015–2019)");
  lines.push("");
  lines.push("| Year | Articles | Flag |");
  lines.push("|------|--------:|------|");
  for (const c of data.yearAnalysis.counts) {
    const flag = data.yearAnalysis.lowYears.some((l) => l.year === c.year)
      ? "⚠ Low"
      : c.count === 0
        ? "⚠ Empty"
        : "";
    lines.push(`| ${c.year} | ${c.count} | ${flag} |`);
  }
  lines.push("");
  lines.push(`Average per year: **${data.yearAnalysis.avg.toFixed(1)}** · Low threshold: **< ${data.yearAnalysis.lowThreshold}**`);
  lines.push("");
  if (data.yearAnalysis.emptyYears.length) {
    lines.push("**Years with zero discovered articles:** " + data.yearAnalysis.emptyYears.map((y) => y.year).join(", "));
    lines.push("");
  }
  if (data.yearAnalysis.lowYears.length) {
    lines.push("**Years with unusually low counts:**");
    for (const y of data.yearAnalysis.lowYears) {
      lines.push(`- ${y.year}: ${y.count} articles`);
    }
    lines.push("");
  }
  if (data.yearAnalysis.unknownCount) {
    lines.push(`**Articles without resolved year:** ${data.yearAnalysis.unknownCount} (need date extraction from page body)`);
    lines.push("");
  }
  lines.push("### Monthly distribution (2015–2019)");
  lines.push("");
  const months = Object.entries(data.yearAnalysis.byMonth)
    .filter(([k]) => /^(2015|2016|2017|2018|2019)-/.test(k))
    .sort(([a], [b]) => a.localeCompare(b));
  for (const [month, count] of months) {
    lines.push(`- ${month}: ${count}`);
  }
  lines.push("");
  lines.push("## Duplicate URLs");
  lines.push("");
  if (data.duplicates.length === 0) {
    lines.push("No duplicate canonical groups found.");
  } else {
    lines.push(`${data.duplicates.length} articles exist under multiple URL forms (pretty + legacy /1/post/ paths).`);
    lines.push("");
    for (const d of data.duplicates.slice(0, 25)) {
      lines.push(`- **${d.title ?? d.canonicalKey}**`);
      d.urls.forEach((u) => lines.push(`  - ${u}`));
    }
    if (data.duplicates.length > 25) {
      lines.push(`- … and ${data.duplicates.length - 25} more (see audit.json)`);
    }
  }
  lines.push("");
  lines.push("## Orphaned & Gap Signals");
  lines.push("");
  lines.push(`- **Legacy URL only** (no pretty permalink in crawl): ${data.orphans.inRssNotPretty.length}`);
  lines.push(`- **In RSS but not pagination index**: ${data.orphans.rssNotPagination.length}`);
  lines.push(`- **Non-article pages linked internally**: ${data.orphans.nonArticlePages.length}`);
  lines.push("");
  if (data.priorComparison) {
    lines.push("## Comparison to Prior Crawl (`inventory.json`)");
    lines.push("");
    lines.push(`- Prior crawl URLs: ${data.priorComparison.priorTotal}`);
    lines.push(`- New URLs found in audit: ${data.priorComparison.missingFromPriorCrawl.length}`);
    lines.push(`- Prior URLs not in audit: ${data.priorComparison.inPriorNotInAudit.length}`);
    lines.push("");
    if (data.priorComparison.missingFromPriorCrawl.length > 0) {
      lines.push("### Sample URLs missing from prior crawl");
      for (const u of data.priorComparison.missingFromPriorCrawl.slice(0, 20)) {
        lines.push(`- ${u}`);
      }
      lines.push("");
    }
  }
  lines.push("## Recommended Next Steps");
  lines.push("");
  lines.push("1. Resolve low-count years by cross-checking RSS against pagination.");
  lines.push("2. Fetch legacy `/1/post/YYYY/MM/*.html` URLs not mapped to pretty permalinks.");
  lines.push("3. Manually review static section pages (Gaming Corner, Curtains, etc.) for embedded articles.");
  lines.push("4. Do **not** import until review queue is reconciled with this audit.");
  lines.push("");
  return lines.join("\n");
}

async function enrichArticleDates(articles) {
  let enriched = 0;
  for (const a of articles) {
    if (a.publicationDate) continue;
    const fetchUrl = a.urls.find((u) => classifyUrl(u) === "article_pretty") ?? a.urls[0];
    const safe = new URL(fetchUrl).pathname.replace(/[^a-z0-9.-]/gi, "_").slice(0, 100);
    const cache = path.join(AUDIT_RAW, `article-${safe}.html`);
    let html;
    if (fs.existsSync(cache)) {
      html = fs.readFileSync(cache, "utf8");
    } else {
      const { ok, body } = await fetchText(fetchUrl);
      if (!ok) continue;
      html = body;
      fs.writeFileSync(cache, html, "utf8");
      await sleep(DELAY_MS);
    }
    const parsed = parseArticlePage(html, fetchUrl);
    if (parsed.publicationDate) {
      a.publicationDate = parsed.publicationDate;
      a.year = parseInt(parsed.publicationDate.slice(0, 4), 10);
      enriched++;
    }
    if (parsed.title && !a.title) a.title = parsed.title;
  }
  return enriched;
}

async function main() {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
  fs.mkdirSync(AUDIT_RAW, { recursive: true });

  console.log("Metal Lifestyle — Comprehensive Recovery Audit\n");

  const allUrls = new Map();
  const discoveryMethods = [];

  console.log("1/5 Pagination crawl…");
  const pagination = await discoverPagination();
  pagination.articles.forEach((u) => track(allUrls, u, "pagination"));
  discoveryMethods.push({
    name: "Homepage + Pagination",
    status: "ok",
    urlCount: pagination.articles.length,
    notes: `${pagination.visitedPages.length} index pages visited`,
  });

  console.log("2/5 RSS / Atom feeds…");
  const feeds = await discoverFeeds();
  const rssEntries = [];
  for (const f of feeds) {
    if (f.ok && f.entries.length) {
      f.entries.forEach((e) => {
        track(allUrls, e.url, "rss");
        rssEntries.push(e);
      });
      discoveryMethods.push({
        name: `Feed: ${f.feedUrl}`,
        status: "ok",
        urlCount: f.entryCount,
      });
    } else {
      discoveryMethods.push({
        name: `Feed: ${f.feedUrl}`,
        status: `HTTP ${f.status ?? "failed"}`,
        urlCount: 0,
      });
    }
  }

  console.log("3/5 Sitemap / robots…");
  const sitemaps = await discoverSitemaps();
  const sitemapArticles = [];
  for (const sm of sitemaps) {
    sm.urls.forEach((u) => {
      track(allUrls, u, "sitemap");
      if (isArticleType(classifyUrl(u))) sitemapArticles.push(u);
    });
    discoveryMethods.push({
      name: `Sitemap: ${sm.url}`,
      status: sm.ok ? "ok" : "failed",
      urlCount: sm.urls?.length ?? 0,
    });
  }

  console.log("4/5 Seed navigation + internal links…");
  SEED_URLS.forEach((u) => track(allUrls, u, "navigation"));
  const bfs = await bfsInternalLinks(SEED_URLS, 100);
  bfs.discovered.forEach((_, url) => track(allUrls, url, "internal_link"));
  discoveryMethods.push({
    name: "Internal link BFS",
    status: "ok",
    urlCount: bfs.crawled.length,
    notes: "From nav seeds + hub pages",
  });

  const internalArticles = [...allUrls.keys()].filter((u) =>
    isArticleType(classifyUrl(u)),
  );

  console.log("5/5 Building article registry…");
  let articles = buildArticleRegistry({
    paginationArticles: pagination.articles,
    rssEntries,
    sitemapArticles,
    internalArticles,
  });

  console.log(`Enriching dates for ${articles.filter((a) => !a.publicationDate).length} articles…`);
  const enriched = await enrichArticleDates(articles);
  console.log(`Dates enriched from live pages: ${enriched}`);

  articles = buildArticleRegistry({
    paginationArticles: pagination.articles,
    rssEntries,
    sitemapArticles,
    internalArticles: articles.flatMap((a) => a.urls),
  });
  for (const a of articles) {
    const rss = rssEntries.find((e) => articleCanonicalKey(e.url) === a.canonicalKey);
    if (rss?.title && !a.title) a.title = rss.title;
  }
  await enrichArticleDates(articles);

  const duplicates = findDuplicates(articles);
  const yearAnalysis = analyzeYearGaps(articles);
  const orphans = findOrphans(articles, allUrls);
  const priorComparison = compareToPriorInventory(articles);

  const articleUrlVariants = articles.reduce((s, a) => s + a.urls.length, 0);

  const audit = {
    generatedAt: new Date().toISOString(),
    sourceSite: BASE,
    summary: {
      totalUrls: allUrls.size,
      uniqueArticles: articles.length,
      articleUrlVariants,
      duplicateGroups: duplicates.length,
      rssEntries: rssEntries.length,
      paginationPages: pagination.visitedPages.length,
      internalCrawlPages: bfs.crawled.length,
    },
    discoveryMethods,
    articles,
    duplicates,
    yearAnalysis: {
      counts: yearAnalysis.counts,
      lowYears: yearAnalysis.lowYears,
      emptyYears: yearAnalysis.emptyYears,
      byMonth: yearAnalysis.byMonth,
      avg: yearAnalysis.avg,
      lowThreshold: yearAnalysis.lowThreshold,
      unknownCount: yearAnalysis.unknown.length,
    },
    orphans: {
      inRssNotPretty: orphans.inRssNotPretty.map((a) => ({
        title: a.title,
        urls: a.urls,
      })),
      rssNotPagination: orphans.rssNotPagination.map((a) => ({
        title: a.title,
        urls: a.urls,
      })),
      nonArticlePages: orphans.nonArticlePages,
    },
    priorComparison,
    allUrls: [...allUrls.entries()].map(([url, sources]) => ({
      url,
      type: classifyUrl(url),
      sources: [...sources],
    })),
  };

  fs.writeFileSync(
    path.join(REPORTS_DIR, "audit.json"),
    JSON.stringify(audit, null, 2),
    "utf8",
  );
  fs.writeFileSync(
    path.join(REPORTS_DIR, "RECOVERY-AUDIT.md"),
    generateMarkdownReport(audit),
    "utf8",
  );

  console.log("\n--- Audit Complete ---");
  console.log(JSON.stringify(audit.summary, null, 2));
  console.log(`\nReports written:`);
  console.log(`  recovery/metal-lifestyle/reports/audit.json`);
  console.log(`  recovery/metal-lifestyle/reports/RECOVERY-AUDIT.md`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
