/**
 * Validates the Collection archive under content/collection/.
 * Run: node scripts/audit-collection-archive.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const COLLECTION_DIR = path.join(ROOT, "content", "collection");
const ENTRIES_DIR = path.join(COLLECTION_DIR, "entries");
const ARCHIVE_PATH = path.join(COLLECTION_DIR, "archive.json");
const SCHEMA_PATH = path.join(COLLECTION_DIR, "schema-version.json");
const SYNC_STATE_PATH = path.join(COLLECTION_DIR, "sync-state.json");
const MEDIA_INDEX_PATH = path.join(COLLECTION_DIR, "media-index.json");
const IMAGE_DIR = path.join(ROOT, "public", "images", "collection");
const REPORT_DIR = path.join(COLLECTION_DIR, "reports");

const EVENT_TYPES = new Set([
  "acquisition",
  "discovery",
  "preservation",
  "expansion",
  "arrival",
]);
const STATUSES = new Set(["Catalogued", "Preservation", "Pipeline"]);
const VISIBILITY = new Set(["published", "hidden"]);
const ORIGINS = new Set(["instagram", "curated", "development"]);

function fileExists(publicPath) {
  const diskPath = path.join(ROOT, "public", publicPath.replace(/^\//, ""));
  return fs.existsSync(diskPath);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function listEntryFiles() {
  if (!fs.existsSync(ENTRIES_DIR)) return [];
  return fs
    .readdirSync(ENTRIES_DIR)
    .filter((f) => f.endsWith(".json") && !f.startsWith("_"));
}

const errors = [];
const warnings = [];

function error(message) {
  errors.push(message);
}

function warn(message) {
  warnings.push(message);
}

if (!fs.existsSync(SCHEMA_PATH)) {
  error("Missing content/collection/schema-version.json");
} else {
  const schema = readJson(SCHEMA_PATH);
  if (typeof schema.version !== "number") {
    error("schema-version.json must include numeric version");
  }
}

if (!fs.existsSync(ARCHIVE_PATH)) {
  error("Missing content/collection/archive.json");
}

if (!fs.existsSync(SYNC_STATE_PATH)) {
  warn("Missing content/collection/sync-state.json");
}

let mediaIndex = null;
if (fs.existsSync(MEDIA_INDEX_PATH)) {
  mediaIndex = readJson(MEDIA_INDEX_PATH);
  if (!mediaIndex.byMediaId || typeof mediaIndex.byMediaId !== "object") {
    error("media-index.json must include byMediaId object");
  }
} else {
  warn("Missing content/collection/media-index.json (created on first Instagram sync)");
}

let archive = null;
if (fs.existsSync(ARCHIVE_PATH)) {
  archive = readJson(ARCHIVE_PATH);
  if (typeof archive.schemaVersion !== "number") {
    error("archive.json must include schemaVersion");
  }
  if (!Array.isArray(archive.entryIds)) {
    error("archive.json must include entryIds array");
  }
  if (archive.featuredId != null && typeof archive.featuredId !== "string") {
    error("archive.json featuredId must be a string or null");
  }
}

const entryFiles = listEntryFiles();
const entryIdsFromFiles = entryFiles.map((f) => f.replace(/\.json$/, ""));
const records = new Map();

for (const file of entryFiles) {
  const filePath = path.join(ENTRIES_DIR, file);
  const expectedId = file.replace(/\.json$/, "");
  let record;

  try {
    record = readJson(filePath);
  } catch {
    error(`Invalid JSON: entries/${file}`);
    continue;
  }

  if (!record.id) {
    error(`entries/${file} missing id`);
    continue;
  }

  if (record.id !== expectedId) {
    error(
      `entries/${file} id mismatch — file slug "${expectedId}" vs record.id "${record.id}"`,
    );
  }

  if (records.has(record.id)) {
    error(`Duplicate archive id: ${record.id}`);
  }
  records.set(record.id, record);

  if (!record.origin || !ORIGINS.has(record.origin)) {
    error(`${record.id}: missing or invalid origin (instagram | curated | development)`);
  }

  if (record.origin === "development" && record.developmentMeta?.synthetic !== true) {
    warn(`${record.id}: development record should include developmentMeta.synthetic: true`);
  }

  if (record.origin === "instagram" && record.source?.platform !== "instagram") {
    error(`${record.id}: origin instagram requires source.platform instagram`);
  }

  if (record.origin === "curated" && record.source?.platform !== "manual") {
    warn(`${record.id}: curated records usually use source.platform manual`);
  }

  if (!record.title || typeof record.title !== "string") {
    error(`${record.id}: missing title`);
  }

  if (!EVENT_TYPES.has(record.eventType)) {
    error(`${record.id}: invalid eventType "${record.eventType}"`);
  }

  if (!STATUSES.has(record.status)) {
    error(`${record.id}: invalid status "${record.status}"`);
  }

  if (!record.catalogued) {
    error(`${record.id}: missing catalogued date`);
  }

  if (!VISIBILITY.has(record.visibility)) {
    error(`${record.id}: invalid visibility "${record.visibility}"`);
  }

  if (!record.source || typeof record.source !== "object") {
    error(`${record.id}: missing source provenance block`);
  } else {
    if (!["instagram", "manual"].includes(record.source.platform)) {
      error(`${record.id}: source.platform must be instagram or manual`);
    }

    if (
      record.origin === "instagram" &&
      record.source.platform === "instagram" &&
      !record.source.captionSnapshot
    ) {
      error(
        `${record.id}: instagram records must include immutable captionSnapshot`,
      );
    }

    if (record.source.captionSnapshot && !record.source.captionSnapshotAt) {
      warn(
        `${record.id}: captionSnapshot present without captionSnapshotAt timestamp`,
      );
    }

    if (record.source.imageSnapshot && !fileExists(record.source.imageSnapshot)) {
      warn(
        `${record.id}: imageSnapshot path missing on disk (${record.source.imageSnapshot})`,
      );
    }
  }

  if (record.notes && record.source?.captionSnapshot === record.notes) {
    warn(
      `${record.id}: curator notes identical to captionSnapshot — keep provenance and curation separate`,
    );
  }

  if (record.coverImage && !fileExists(record.coverImage)) {
    warn(`${record.id}: coverImage path missing on disk (${record.coverImage})`);
  }

  if (
    record.source?.platform === "instagram" &&
    record.source.mediaId &&
    mediaIndex &&
    mediaIndex.byMediaId[record.source.mediaId] &&
    mediaIndex.byMediaId[record.source.mediaId] !== record.id
  ) {
    error(
      `${record.id}: media-index maps ${record.source.mediaId} to a different entry`,
    );
  }

  const localByConvention = [
    `/images/collection/${record.id}/primary.webp`,
    `/images/collection/${record.id}.jpg`,
  ];
  const hasConventionImage = localByConvention.some((p) => fileExists(p));
  if (
    !record.coverImage &&
    !record.source?.imageSnapshot &&
    !hasConventionImage &&
    record.status !== "Pipeline"
  ) {
    warn(`${record.id}: no resolved cover image (acceptable until image sync)`);
  }
}

if (mediaIndex) {
  for (const [mediaId, entryId] of Object.entries(mediaIndex.byMediaId)) {
    if (!records.has(entryId)) {
      error(`media-index references missing entry: ${entryId} (media ${mediaId})`);
    } else {
      const record = records.get(entryId);
      if (record.source?.mediaId && record.source.mediaId !== mediaId) {
        error(
          `media-index mismatch for ${entryId}: index ${mediaId} vs record ${record.source.mediaId}`,
        );
      }
    }
  }
}

for (const orphan of entryIdsFromFiles) {
  if (!records.has(orphan)) {
    error(`Unreadable or missing record for entries/${orphan}.json`);
  }
}

if (archive) {
  for (const id of archive.entryIds) {
    if (!records.has(id)) {
      error(`archive.json references missing entry: ${id}`);
    } else {
      const record = records.get(id);
      if (record.origin === "development") {
        error(`archive.json lists development seed in public display index: ${id}`);
      }
      if (record.status === "Pipeline") {
        warn(
          `archive.json lists pipeline entry in display index: ${id} (usually omitted until catalogued)`,
        );
      }
    }
  }

  if (archive.featuredId) {
    if (!records.has(archive.featuredId)) {
      error(`archive.json featuredId not found: ${archive.featuredId}`);
    } else if (!archive.entryIds.includes(archive.featuredId)) {
      warn(
        `archive.json featuredId "${archive.featuredId}" is not listed in entryIds`,
      );
    }
  }

  const orphansNotIndexed = entryIdsFromFiles.filter(
    (id) => !archive.entryIds.includes(id),
  );
  for (const id of orphansNotIndexed) {
    const record = records.get(id);
    if (record?.origin === "development") continue;
    if (record?.status === "Catalogued") {
      warn(
        `Catalogued entry not in archive.json entryIds: ${id} (may be intentional pipeline/preservation-only record)`,
      );
    }
  }
}

const stats = {
  total: records.size,
  instagram: 0,
  curated: 0,
  development: 0,
  catalogued: 0,
  pipeline: 0,
  preservation: 0,
  withCaptionSnapshot: 0,
  withImageSnapshot: 0,
};

for (const record of records.values()) {
  if (record.origin === "instagram") stats.instagram += 1;
  if (record.origin === "curated") stats.curated += 1;
  if (record.origin === "development") stats.development += 1;
  if (record.status === "Catalogued") stats.catalogued += 1;
  if (record.status === "Pipeline") stats.pipeline += 1;
  if (record.status === "Preservation") stats.preservation += 1;
  if (record.source?.captionSnapshot) stats.withCaptionSnapshot += 1;
  if (record.source?.imageSnapshot) stats.withImageSnapshot += 1;
}

if (!fs.existsSync(REPORT_DIR)) {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
}

const report = {
  generatedAt: new Date().toISOString(),
  stats,
  errors,
  warnings,
  entryIds: [...records.keys()].sort(),
};

const reportPath = path.join(
  REPORT_DIR,
  `audit-${new Date().toISOString().slice(0, 10)}.json`,
);
fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);

console.log("Collection Archive Audit");
console.log("========================");
console.log(`Entries:        ${stats.total}`);
console.log(`Instagram:      ${stats.instagram}`);
console.log(`Curated:        ${stats.curated}`);
console.log(`Development:    ${stats.development}`);
console.log(`Catalogued:     ${stats.catalogued}`);
console.log(`Pipeline:       ${stats.pipeline}`);
console.log(`Preservation:   ${stats.preservation}`);
console.log(`Caption snaps:  ${stats.withCaptionSnapshot}`);
console.log(`Image snaps:    ${stats.withImageSnapshot}`);
console.log(`Warnings:       ${warnings.length}`);
console.log(`Errors:         ${errors.length}`);
console.log(`Report:         ${path.relative(ROOT, reportPath)}`);

if (warnings.length > 0) {
  console.log("\nWarnings:");
  for (const w of warnings) console.log(`  - ${w}`);
}

if (errors.length > 0) {
  console.log("\nErrors:");
  for (const e of errors) console.log(`  - ${e}`);
  process.exit(1);
}

console.log("\nAudit passed.");
