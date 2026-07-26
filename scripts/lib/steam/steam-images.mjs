/**
 * Steam acquisition source — artwork preservation.
 *
 * Downloads header capsule and hero artwork into a Steam-scoped image folder,
 * mirroring the Collection image manifest pattern. Steam artwork is kept
 * separate from the editorial cover; failures are non-fatal.
 */

import crypto from "crypto";
import fs from "fs";
import path from "path";
import { ensureDir, writeJsonAtomic } from "../collection-archive-fs.mjs";
import {
  STEAM_IMAGE_DIR,
  steamImageDir,
  steamPublicImagePath,
} from "./steam-archive-fs.mjs";

const ARTWORK_TARGETS = [
  { key: "headerCapsule", file: "header.jpg" },
  { key: "capsule", file: "capsule.jpg" },
  { key: "hero", file: "hero.jpg" },
];

async function downloadOne(remoteUrl, diskPath, { force }) {
  if (fs.existsSync(diskPath) && !force) {
    return { status: "skipped", reason: "exists" };
  }

  const res = await fetch(remoteUrl, {
    headers: { "user-agent": "bloodsoaked-media-archive/1.0 (+steam-sync)" },
  });
  if (!res.ok) {
    return { status: "failed", reason: `http_${res.status}` };
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  if (buffer.length === 0) {
    return { status: "failed", reason: "empty" };
  }

  fs.writeFileSync(diskPath, buffer);
  return {
    status: "saved",
    bytes: buffer.length,
    sha256: crypto.createHash("sha256").update(buffer).digest("hex"),
  };
}

/**
 * Preserves Steam artwork for a title and returns local public paths for the
 * files that were successfully stored. `remoteArtwork` comes from normalization.
 */
export async function preserveSteamArtwork({
  appId,
  remoteArtwork,
  dryRun = false,
  force = false,
}) {
  const artwork = {};
  const results = [];
  if (!remoteArtwork) return { artwork, results };

  const dir = steamImageDir(appId);
  const manifest = {
    appId,
    fetchedAt: new Date().toISOString(),
    files: {},
  };

  if (!dryRun) {
    ensureDir(STEAM_IMAGE_DIR);
    ensureDir(dir);
  }

  for (const { key, file } of ARTWORK_TARGETS) {
    const remoteUrl = remoteArtwork[key];
    if (!remoteUrl) continue;

    const publicPath = steamPublicImagePath(appId, file);

    if (dryRun) {
      artwork[key] = publicPath;
      results.push({ key, status: "dry-run" });
      continue;
    }

    try {
      const outcome = await downloadOne(remoteUrl, path.join(dir, file), {
        force,
      });
      results.push({ key, ...outcome });
      if (outcome.status === "saved" || outcome.status === "skipped") {
        artwork[key] = publicPath;
        if (outcome.sha256) {
          manifest.files[file] = { sha256: outcome.sha256, bytes: outcome.bytes };
        }
      }
    } catch (err) {
      results.push({ key, status: "failed", reason: err.message });
    }
  }

  if (!dryRun && Object.keys(manifest.files).length > 0) {
    writeJsonAtomic(path.join(dir, "manifest.json"), manifest);
  }

  return { artwork, results };
}
