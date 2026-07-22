/**
 * One-shot: apply About Us biographies onto authors.json without refetching.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import * as cheerio from "cheerio";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const about = JSON.parse(
  fs.readFileSync(
    path.join(ROOT, "content/archives/metal-lifestyle/pages/about-us-meet-the-staff.json"),
    "utf8",
  ),
);
const authorsPath = path.join(ROOT, "content/archives/metal-lifestyle/authors.json");
const authors = JSON.parse(fs.readFileSync(authorsPath, "utf8"));

const $ = cheerio.load(`<div>${about.contentHtml}</div>`);
const bios = [];
$("h2.wsite-content-title").each((_, el) => {
  const title = $(el).text().trim();
  let html = "";
  let node = el.nextSibling;
  while (node && !(node.type === "tag" && node.name === "h2")) {
    html += $.html(node);
    node = node.nextSibling;
  }
  const text = cheerio.load(html).text().replace(/\s+/g, " ").trim();
  const name = title.split(" - ")[0].replace(/-$/, "").trim();
  bios.push({ title, name, text });
});

function slugify(name) {
  return String(name)
    .toLowerCase()
    .replace(/\./g, "dot")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

let applied = 0;
for (const b of bios) {
  let a =
    authors.find((x) => x.name.toLowerCase() === b.name.toLowerCase()) ||
    (/dakota/i.test(b.name)
      ? authors.find((x) => x.name === "Dakota G.")
      : null) ||
    (/bugella/i.test(b.name)
      ? authors.find((x) => /bugella/i.test(x.name))
      : null) ||
    (/brown/i.test(b.name)
      ? authors.find((x) => x.name === "Alex Brown")
      : null) ||
    (/brian/i.test(b.name)
      ? authors.find((x) => /brian/i.test(x.name))
      : null) ||
    (/caleb/i.test(b.name)
      ? authors.find((x) => /caleb/i.test(x.name))
      : null) ||
    (/cesar/i.test(b.name)
      ? authors.find((x) => /cesar/i.test(x.name))
      : null);

  if (!a) {
    a = {
      name: b.name,
      slug: slugify(b.name),
      articleSlugs: [],
      publicationCount: 0,
      biography: null,
      profileFrom: "about-us-meet-the-staff",
    };
    authors.push(a);
  }
  if (!a.biography && b.text) {
    a.biography = b.text;
    a.profileTitle = b.title;
    applied += 1;
    console.log("bio ->", a.name);
  } else {
    console.log("keep", a.name);
  }
}

authors.sort((a, b) => a.name.localeCompare(b.name));
fs.writeFileSync(authorsPath, JSON.stringify(authors, null, 2));
console.log("applied", applied);
