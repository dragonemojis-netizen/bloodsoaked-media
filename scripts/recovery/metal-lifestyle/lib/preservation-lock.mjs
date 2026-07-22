/**
 * Shared preservation lock for Metal Lifestyle archive content.
 *
 * When content/archives/metal-lifestyle/PRESERVATION.lock.json has
 * { "sealed": true }, mutating scripts refuse to overwrite historical
 * JSON unless --force is passed.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../..",
);export const ARCHIVE_ROOT = path.join(ROOT, "content/archives/metal-lifestyle");
export const LOCK_PATH = path.join(ARCHIVE_ROOT, "PRESERVATION.lock.json");

export function readPreservationLock() {
  if (!fs.existsSync(LOCK_PATH)) {
    return { sealed: false, missing: true };
  }
  try {
    return JSON.parse(fs.readFileSync(LOCK_PATH, "utf8"));
  } catch {
    return { sealed: false, corrupt: true };
  }
}

export function assertMayMutateArchive(argv = process.argv, label = "script") {
  const force = argv.includes("--force");
  const lock = readPreservationLock();
  if (lock.sealed && !force) {
    console.error(
      [
        "",
        `Preservation lock: Metal Lifestyle archive is SEALED.`,
        `Refusing to run ${label} without --force.`,
        "",
        "The recoverable publication is considered historically complete.",
        "Only re-run recovery/polish when:",
        "  • new historical evidence appears, or",
        "  • a factual preservation defect must be repaired.",
        "",
        "Pass --force to acknowledge intentional mutation.",
        `Lock file: ${LOCK_PATH}`,
        "",
      ].join("\n"),
    );
    process.exit(2);
  }
  return { force, lock };
}

export function shouldSkipExistingRestored(existingPath, force) {
  if (force) return false;
  if (!fs.existsSync(existingPath)) return false;
  try {
    const rec = JSON.parse(fs.readFileSync(existingPath, "utf8"));
    return rec.status === "restored" && (rec.contentHtml || "").length > 40;
  } catch {
    return false;
  }
}
