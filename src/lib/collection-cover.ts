import fs from "fs";
import path from "path";
import type { CollectionArchiveRecord } from "@/types/collection-archive";

const PUBLIC_DIR = path.join(process.cwd(), "public");
const COLLECTION_IMAGE_DIR = path.join(PUBLIC_DIR, "images", "collection");

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"] as const;

export interface CollectionImageDimensions {
  width: number;
  height: number;
}

function readPngDimensions(buffer: Buffer): CollectionImageDimensions | null {
  if (buffer.length < 24) return null;
  if (buffer.toString("ascii", 1, 4) !== "PNG") return null;
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

function readJpegDimensions(buffer: Buffer): CollectionImageDimensions | null {
  let offset = 2;
  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) return null;
    const marker = buffer[offset + 1];
    if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2) {
      return {
        height: buffer.readUInt16BE(offset + 5),
        width: buffer.readUInt16BE(offset + 7),
      };
    }
    const segmentLength = buffer.readUInt16BE(offset + 2);
    if (segmentLength < 2) return null;
    offset += 2 + segmentLength;
  }
  return null;
}

function readWebpDimensions(buffer: Buffer): CollectionImageDimensions | null {
  if (buffer.length < 30) return null;
  if (buffer.toString("ascii", 0, 4) !== "RIFF") return null;
  if (buffer.toString("ascii", 8, 12) !== "WEBP") return null;

  const chunk = buffer.toString("ascii", 12, 16);
  if (chunk === "VP8X" && buffer.length >= 30) {
    return {
      width: 1 + buffer.readUIntLE(24, 3),
      height: 1 + buffer.readUIntLE(27, 3),
    };
  }

  return null;
}

function readImageDimensions(buffer: Buffer): CollectionImageDimensions | null {
  if (buffer[0] === 0x89) return readPngDimensions(buffer);
  if (buffer[0] === 0xff && buffer[1] === 0xd8) return readJpegDimensions(buffer);
  if (buffer.toString("ascii", 0, 4) === "RIFF") return readWebpDimensions(buffer);
  return null;
}

/** Local image pixel dimensions for adaptive exhibit framing. */
export function getCollectionImageDimensions(
  publicPath?: string,
): CollectionImageDimensions | null {
  if (!publicPath) return null;

  const diskPath = path.join(
    PUBLIC_DIR,
    normalizePublicPath(publicPath).replace(/^\//, ""),
  );
  if (!fs.existsSync(diskPath)) return null;

  const buffer = fs.readFileSync(diskPath);
  const dimensions = readImageDimensions(buffer);
  if (!dimensions || dimensions.width <= 0 || dimensions.height <= 0) {
    return null;
  }

  return dimensions;
}

function normalizePublicPath(src: string): string {
  return src.startsWith("/") ? src : `/${src}`;
}

function fileExists(publicPath: string): boolean {
  const diskPath = path.join(PUBLIC_DIR, publicPath.replace(/^\//, ""));
  return fs.existsSync(diskPath);
}

function findLocalImageById(id: string): string | undefined {
  const entryDir = path.join(COLLECTION_IMAGE_DIR, id);
  if (fs.existsSync(entryDir)) {
    for (const name of ["primary.webp", "primary.jpg", "primary.png"]) {
      const publicPath = `/images/collection/${id}/${name}`;
      if (fileExists(publicPath)) return publicPath;
    }
  }

  if (!fs.existsSync(COLLECTION_IMAGE_DIR)) return undefined;
  for (const ext of IMAGE_EXTENSIONS) {
    const publicPath = `/images/collection/${id}${ext}`;
    if (fileExists(publicPath)) return publicPath;
  }

  return undefined;
}

/**
 * Cover resolution order:
 * 1. entry.coverImage (explicit local path)
 * 2. source.imageSnapshot (immutable first-sync provenance image)
 * 3. public/images/collection/{id}/primary.{webp,jpg,png}
 * 4. public/images/collection/{id}.{ext}
 */
export function resolveCollectionCover(
  record: Pick<CollectionArchiveRecord, "id" | "coverImage" | "source">,
): string | undefined {
  if (record.coverImage) {
    const normalized = normalizePublicPath(record.coverImage);
    if (fileExists(normalized)) return normalized;
  }

  if (record.source.imageSnapshot) {
    const normalized = normalizePublicPath(record.source.imageSnapshot);
    if (fileExists(normalized)) return normalized;
  }

  return findLocalImageById(record.id);
}
