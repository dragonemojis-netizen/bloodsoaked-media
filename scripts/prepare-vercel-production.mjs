import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const MARKER = path.join(ROOT, ".build-stash", "manifest.json");

/** Production Vercel deploys omit Archives from the Next.js output artifact. */
function shouldOmitArchivesFromBuild() {
  if (process.env.NEXT_PUBLIC_ARCHIVES_LOCAL === "true") return false;
  return process.env.VERCEL === "1";
}

const STASH_PAIRS = [
  ["src/app/the-archives", ".build-stash/the-archives-app"],
  ["public/images/archives", ".build-stash/public-images-archives"],
  ["content/archives", ".build-stash/content-archives"],
];

function movePath(srcRel, destRel) {
  const src = path.join(ROOT, srcRel);
  const dest = path.join(ROOT, destRel);
  if (!fs.existsSync(src)) return;

  if (fs.existsSync(dest)) {
    fs.rmSync(dest, { recursive: true, force: true });
  }

  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.cpSync(src, dest, { recursive: true });
  fs.rmSync(src, { recursive: true, force: true });
}

function moveBack(srcRel, destRel) {
  const src = path.join(ROOT, srcRel);
  const dest = path.join(ROOT, destRel);
  if (!fs.existsSync(dest)) return;

  if (fs.existsSync(src)) {
    fs.rmSync(src, { recursive: true, force: true });
  }

  fs.mkdirSync(path.dirname(src), { recursive: true });
  fs.cpSync(dest, src, { recursive: true });
  fs.rmSync(dest, { recursive: true, force: true });
}

function prepare() {
  if (!shouldOmitArchivesFromBuild()) return;

  fs.mkdirSync(path.join(ROOT, ".build-stash"), { recursive: true });
  const moved = [];

  for (const pair of STASH_PAIRS) {
    const [srcRel] = pair;
    if (!fs.existsSync(path.join(ROOT, srcRel))) continue;
    movePath(...pair);
    moved.push(pair);
  }

  if (moved.length > 0) {
    fs.writeFileSync(MARKER, JSON.stringify({ moved }, null, 2));
    console.log(
      `[prepare-vercel-production] Stashed ${moved.length} Archives paths for production build.`,
    );
  }
}

function restore() {
  if (!fs.existsSync(MARKER)) return;

  const { moved } = JSON.parse(fs.readFileSync(MARKER, "utf8"));

  for (const pair of moved) {
    moveBack(...pair);
  }

  fs.rmSync(MARKER, { force: true });
  fs.rmSync(path.join(ROOT, ".build-stash"), { recursive: true, force: true });
  console.log("[prepare-vercel-production] Restored Archives paths after build.");
}

const command = process.argv[2];
if (command === "prepare") prepare();
else if (command === "restore") restore();
else {
  console.error("Usage: node scripts/prepare-vercel-production.mjs <prepare|restore>");
  process.exit(1);
}
