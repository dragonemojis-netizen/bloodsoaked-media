/**
 * Rebuilds archive.json display index from published entries (no Instagram fetch).
 * Run: node scripts/rebuild-collection-archive-index.mjs
 *      node scripts/rebuild-collection-archive-index.mjs -- --dry-run
 */
import { rebuildArchiveIndex } from "./lib/collection-archive-index.mjs";

const dryRun = process.argv.includes("--dry-run");

const result = rebuildArchiveIndex({ dryRun });
console.log(
  `${dryRun ? "[dry-run] " : ""}Archive index rebuilt: ${result.total} published record(s), featured: ${result.featuredId ?? "none"}`,
);
