/**
 * Files a Collection Pipeline accession into the Bloodsoaked Library.
 *
 * Filing transforms an existing accession — it does not create a parallel copy.
 * Steam imports stay Pipeline until this command is run.
 *
 * Usage:
 *   npm run library:file -- steam-70
 *   npm run library:file:dry -- steam-70
 *   node scripts/file-library-accession.mjs steam-70 -- --slug half-life
 */

import { spawnSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import { fileCollectionAccession } from "./lib/library/file-accession.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const args = process.argv.slice(2).filter((arg) => arg !== "--");
const dryRun = args.includes("--dry-run");
const slugFlag = args.find((arg) => arg.startsWith("--slug"));
const slugOverride = slugFlag
  ? slugFlag.includes("=")
    ? slugFlag.split("=")[1]
    : args[args.indexOf("--slug") + 1]
  : null;

const positional = args.filter(
  (arg) => !arg.startsWith("--") && arg !== slugOverride,
);
const collectionId = positional[0];

function log(message) {
  console.log(message);
}

function rebuildLibraryIndex() {
  const result = spawnSync(
    process.execPath,
    [path.join(ROOT, "scripts", "rebuild-library-index.mjs")],
    { cwd: ROOT, encoding: "utf8" },
  );
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  if (result.status !== 0) {
    throw new Error("library:reindex failed after filing");
  }
}

function main() {
  if (!collectionId) {
    console.error("Usage: npm run library:file -- <collection-id>");
    console.error("Example: npm run library:file -- steam-70");
    process.exit(1);
  }

  log("Archive Filing");
  log("==============");
  log(`Collection: ${collectionId}`);
  if (dryRun) log("Mode: dry-run (no files will be written)");
  if (slugOverride) log(`Slug override: ${slugOverride}`);

  let result;
  try {
    result = fileCollectionAccession({
      collectionId,
      slugOverride,
      dryRun,
    });
  } catch (err) {
    console.error(`\nFiling refused: ${err.message}`);
    process.exit(1);
  }

  const { library, collection } = result;

  log("");
  log(`Shelf mark:     ${library.shelfMark}`);
  log(`Library slug:   ${library.slug}`);
  log(`Title:          ${library.title}`);
  log(`Accession:      ${library.accession?.source} → ${library.accession?.sourceReference}`);
  log(`Library status: ${library.status}`);
  log(`Visibility:     ${library.visibility}`);
  log(`Collection →    ${collection.status}`);
  log(`Steam block:    ${library.steam ? `app ${library.steam.appId} attached` : "none"}`);
  log(
    `Editorial:      curatorNotes/collectionNotes empty · preservation {} · artifacts []`,
  );

  if (!dryRun) {
    rebuildLibraryIndex();
    log("");
    log(`Wrote: content/library/entries/${library.slug}.json`);
    log(`Updated: content/collection/entries/${collection.id}.json`);
    log("Library index rebuilt. Accession remains hidden until curated.");
  } else {
    log("");
    log("Dry run complete — no files written.");
  }
}

main();
