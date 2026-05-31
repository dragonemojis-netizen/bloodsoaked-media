import * as cheerio from "cheerio";
import TurndownService from "turndown";

const turndown = new TurndownService({
  headingStyle: "atx",
  bulletListMarker: "-",
  codeBlockStyle: "fenced",
});

turndown.remove(["script", "style", "iframe"]);

const MONTH_MAP = {
  january: "01",
  february: "02",
  march: "03",
  april: "04",
  may: "05",
  june: "06",
  july: "07",
  august: "08",
  september: "09",
  october: "10",
  november: "11",
  december: "12",
};

export function normalizeUrl(href, base = "https://metallifestyle.weebly.com") {
  if (!href) return null;
  if (href.startsWith("//")) return `https:${href}`;
  if (href.startsWith("http")) return href.split("#")[0];
  if (href.startsWith("/")) return `${base}${href.split("#")[0]}`;
  return `${base}/${href.split("#")[0]}`;
}

export function extractBlogLinks(html) {
  const $ = cheerio.load(html);
  const links = new Set();

  $("a.blog-title-link").each((_, el) => {
    const href = $(el).attr("href");
    const url = normalizeUrl(href);
    if (url) links.add(url);
  });

  const nextPage = $("div.blog-page-nav-previous a").attr("href");
  const nextUrl = nextPage ? normalizeUrl(nextPage) : null;

  return { postUrls: [...links], nextPageUrl: nextUrl };
}

export function extractStaticContentLinks(html) {
  const $ = cheerio.load(html);
  const links = new Set();
  $("#wsite-content a[href], .wsite-menu-default a[href]").each((_, el) => {
    const href = $(el).attr("href");
    const url = normalizeUrl(href);
    if (!url || !url.includes("metallifestyle.weebly.com")) return;
    if (url.includes("/metal-lifestyle/")) return;
    if (/\.(jpg|png|gif|pdf)$/i.test(url)) return;
    links.add(url);
  });
  return [...links];
}

export function parseBlogDate(raw) {
  if (!raw) return null;
  const cleaned = raw.replace(/\s+/g, " ").trim();
  const mdy = cleaned.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (mdy) {
    const [, m, d, y] = mdy;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  const long = cleaned.match(/^(\w+)\s+(\d{1,2}),?\s+(\d{4})$/i);
  if (long) {
    const month = MONTH_MAP[long[1].toLowerCase()];
    if (month) {
      return `${long[3]}-${month}-${long[2].padStart(2, "0")}`;
    }
  }
  return null;
}

export function parseArticlePage(html, url) {
  const $ = cheerio.load(html);
  const isBlog = $(".blog-post").length > 0;

  if (isBlog) {
    const title =
      $(".blog-title a").first().text().trim() ||
      $(".blog-title-link").first().text().trim() ||
      $("title").text().replace(/ - Metal Lifestyle.*/i, "").trim();
    const dateRaw = $(".blog-date").first().text().trim();
    const contentHtml = $(".blog-content").first().html() ?? "";
    const text = $(".blog-content").first().text();
    const markdown = turndown.turndown(contentHtml || "");
    return {
      pageType: "blog",
      title,
      publicationDate: parseBlogDate(dateRaw),
      dateRaw,
      text,
      markdown,
      contentHtml,
      images: extractImages($, ".blog-content"),
    };
  }

  const title =
    $("#wsite-content h2").first().text().trim() ||
    $("title").text().replace(/ - Metal Lifestyle.*/i, "").trim();
  const contentHtml = $("#wsite-content").html() ?? "";
  const text = $("#wsite-content").text();
  const markdown = turndown.turndown(contentHtml || "");

  return {
    pageType: "static",
    title,
    publicationDate: null,
    dateRaw: null,
    text,
    markdown,
    contentHtml,
    images: extractImages($, "#wsite-content"),
  };
}

function extractImages($, selector) {
  const images = [];
  $(`${selector} img`).each((_, el) => {
    const src = $(el).attr("src");
    if (!src || src.includes("wsite-social")) return;
    images.push(normalizeUrl(src));
  });
  return images;
}
