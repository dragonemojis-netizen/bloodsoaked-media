import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type {
  CurrentlyExperiencing,
  FromTheEditor,
  FromTheEditorImage,
  ListeningRoom,
  ListeningRoomPlaylist,
  RecentPhysicalAcquisition,
} from "@/types/editorial";
import {
  extractSpotifyId,
  toSpotifyPlaylistUrl,
} from "@/lib/spotify";

const EDITORIAL_DIR = path.join(process.cwd(), "content", "editorial");

export function getCurrentlyExperiencing(): CurrentlyExperiencing {
  const filePath = path.join(EDITORIAL_DIR, "currently-experiencing.json");
  if (!fs.existsSync(filePath)) return {};

  return JSON.parse(fs.readFileSync(filePath, "utf8")) as CurrentlyExperiencing;
}

export function getRecentPhysicalAcquisition(): RecentPhysicalAcquisition | null {
  const filePath = path.join(
    EDITORIAL_DIR,
    "recent-physical-acquisition.json",
  );
  if (!fs.existsSync(filePath)) return null;

  const raw = JSON.parse(
    fs.readFileSync(filePath, "utf8"),
  ) as Partial<RecentPhysicalAcquisition>;

  if (typeof raw.title !== "string" || raw.title.length === 0) return null;

  return {
    title: raw.title,
    href: typeof raw.href === "string" && raw.href.length > 0 ? raw.href : undefined,
    updated: raw.updated,
  };
}

function asOptionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function parseListeningRoomPlaylist(
  value: unknown,
  fallbackUpdated: string,
): ListeningRoomPlaylist | null {
  if (!value || typeof value !== "object") return null;

  const playlist = value as Record<string, unknown>;
  const spotifyPlaylistId =
    extractSpotifyId(asOptionalString(playlist.spotifyPlaylistId)) ??
    extractSpotifyId(asOptionalString(playlist.spotifyId)) ??
    extractSpotifyId(asOptionalString(playlist.spotifyUrl));

  if (!spotifyPlaylistId) return null;

  const title =
    asOptionalString(playlist.title) ??
    asOptionalString(playlist.label) ??
    "Untitled playlist";

  return {
    title,
    description: asOptionalString(playlist.description),
    spotifyPlaylistId,
    spotifyUrl:
      asOptionalString(playlist.spotifyUrl) ??
      toSpotifyPlaylistUrl(spotifyPlaylistId),
    createdAt:
      asOptionalString(playlist.createdAt) ??
      asOptionalString(playlist.created),
    updatedAt:
      asOptionalString(playlist.updatedAt) ??
      asOptionalString(playlist.updated) ??
      fallbackUpdated,
    coverImage: asOptionalString(playlist.coverImage),
    notes: asOptionalString(playlist.notes),
    archived: playlist.archived === true,
  };
}

function comparePlaylistRecency(
  a: ListeningRoomPlaylist,
  b: ListeningRoomPlaylist,
): number {
  const aKey = a.updatedAt ?? a.createdAt ?? "";
  const bKey = b.updatedAt ?? b.createdAt ?? "";
  return bKey.localeCompare(aKey);
}

export function getListeningRoom(): ListeningRoom | null {
  const filePath = path.join(EDITORIAL_DIR, "listening-room.json");
  if (!fs.existsSync(filePath)) return null;

  const raw = JSON.parse(fs.readFileSync(filePath, "utf8")) as {
    heading?: unknown;
    description?: unknown;
    metaLabel?: unknown;
    playlists?: unknown;
    current?: unknown;
    archive?: unknown;
    showArchive?: unknown;
    archiveHeading?: unknown;
    archiveHref?: unknown;
  };
  const fallbackUpdated = fs.statSync(filePath).mtime.toISOString().slice(0, 10);

  const fromCatalog = Array.isArray(raw.playlists)
    ? raw.playlists.flatMap((playlist) => {
        const parsed = parseListeningRoomPlaylist(playlist, fallbackUpdated);
        return parsed ? [parsed] : [];
      })
    : [];

  // Legacy shape: { current, archive } — still accepted so older configs keep working.
  const legacyCurrent = parseListeningRoomPlaylist(raw.current, fallbackUpdated);
  const legacyArchive = Array.isArray(raw.archive)
    ? raw.archive.flatMap((playlist) => {
        const parsed = parseListeningRoomPlaylist(playlist, fallbackUpdated);
        return parsed ? [{ ...parsed, archived: true }] : [];
      })
    : [];

  const playlists =
    fromCatalog.length > 0
      ? fromCatalog
      : [
          ...(legacyCurrent ? [{ ...legacyCurrent, archived: false }] : []),
          ...legacyArchive,
        ];

  if (playlists.length === 0) return null;

  const current =
    playlists.find((playlist) => !playlist.archived) ?? playlists[0];
  const archive = playlists
    .filter(
      (playlist) =>
        playlist.archived &&
        playlist.spotifyPlaylistId !== current.spotifyPlaylistId,
    )
    .sort(comparePlaylistRecency);

  return {
    heading:
      typeof raw.heading === "string" && raw.heading.length > 0
        ? raw.heading
        : "Current Rotation",
    description:
      typeof raw.description === "string" && raw.description.length > 0
        ? raw.description
        : undefined,
    metaLabel: asOptionalString(raw.metaLabel) ?? "Issue Playlist",
    playlists,
    current,
    archive,
    showArchive: raw.showArchive === true,
    archiveHeading:
      typeof raw.archiveHeading === "string" && raw.archiveHeading.length > 0
        ? raw.archiveHeading
        : "Previous Rotations",
    archiveHref: asOptionalString(raw.archiveHref),
  };
}

function parseFromTheEditorImages(raw: unknown): FromTheEditorImage[] {
  if (!Array.isArray(raw)) return [];

  return raw.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const src = "src" in entry ? entry.src : undefined;
    const alt = "alt" in entry ? entry.alt : undefined;
    if (typeof src !== "string" || src.length === 0) return [];
    if (typeof alt !== "string" || alt.length === 0) return [];
    return [{ src, alt }];
  });
}

export function getFromTheEditor(): FromTheEditor | null {
  const filePath = path.join(EDITORIAL_DIR, "from-the-editor.md");
  if (!fs.existsSync(filePath)) return null;

  const { data } = matter(fs.readFileSync(filePath, "utf8"));

  const legacyBody = [data.whatItIs, data.whyItExists].filter(
    (p): p is string => typeof p === "string" && p.length > 0,
  );
  const body = Array.isArray(data.body)
    ? data.body.filter((p): p is string => typeof p === "string" && p.length > 0)
    : legacyBody;

  const images = parseFromTheEditorImages(data.images);

  return {
    introduction: data.introduction ?? "",
    body,
    monthlyUpdate: data.monthlyUpdate,
    monthlyClosing: data.monthlyClosing,
    updated: data.updated,
    images: images.length > 0 ? images : undefined,
  };
}
