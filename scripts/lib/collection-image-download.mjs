import crypto from "crypto";
import fs from "fs";
import path from "path";
import {
  ROOT,
  entryImageDir,
  ensureDir,
  publicImagePaths,
  writeJsonAtomic,
} from "./collection-archive-fs.mjs";

export function imageFilesExist(entryId) {
  const paths = publicImagePaths(entryId);
  const originalDisk = path.join(ROOT, "public", paths.original.replace(/^\//, ""));
  return fs.existsSync(originalDisk);
}

export async function downloadArchiveImage({
  entryId,
  imageUrl,
  sourceMediaId,
  dryRun = false,
  force = false,
}) {
  const paths = publicImagePaths(entryId);
  const dir = entryImageDir(entryId);
  const originalDisk = path.join(
    dir,
    path.basename(paths.original),
  );
  const displayDisk = path.join(dir, path.basename(paths.display));
  const manifestDisk = path.join(dir, path.basename(paths.manifest));

  if (!imageUrl) {
    return { status: "skipped", reason: "no_image_url" };
  }

  if (imageFilesExist(entryId) && !force) {
    return {
      status: "skipped",
      reason: "exists",
      imageSnapshot: paths.original,
      coverImage: paths.display,
    };
  }

  if (dryRun) {
    return {
      status: "dry-run",
      imageSnapshot: paths.original,
      coverImage: paths.display,
    };
  }

  ensureDir(dir);

  const res = await fetch(imageUrl);
  if (!res.ok) {
    return {
      status: "failed",
      reason: `download_http_${res.status}`,
    };
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  const sha256 = crypto.createHash("sha256").update(buffer).digest("hex");

  if (fs.existsSync(manifestDisk) && !force) {
    const existing = JSON.parse(fs.readFileSync(manifestDisk, "utf8"));
    if (existing.sha256 === sha256 && fs.existsSync(originalDisk)) {
      return {
        status: "skipped",
        reason: "unchanged",
        imageSnapshot: paths.original,
        coverImage: paths.display,
      };
    }
  }

  fs.writeFileSync(originalDisk, buffer);
  fs.writeFileSync(displayDisk, buffer);

  const manifest = {
    entryId,
    sourceMediaId,
    sourceUrl: imageUrl,
    sha256,
    bytes: buffer.length,
    fetchedAt: new Date().toISOString(),
    files: {
      original: paths.original,
      display: paths.display,
    },
  };

  writeJsonAtomic(manifestDisk, manifest);

  return {
    status: "saved",
    imageSnapshot: paths.original,
    coverImage: paths.display,
    sha256,
  };
}
