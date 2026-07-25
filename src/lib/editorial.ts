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

export function getListeningRoom(): ListeningRoom | null {
  const filePath = path.join(EDITORIAL_DIR, "listening-room.json");
  if (!fs.existsSync(filePath)) return null;

  const raw = JSON.parse(fs.readFileSync(filePath, "utf8")) as {
    heading?: unknown;
    description?: unknown;
    current?: unknown;
    archive?: unknown;
    showArchive?: unknown;
    archiveHeading?: unknown;
  };
  const fallbackUpdated = fs.statSync(filePath).mtime.toISOString().slice(0, 10);

  const parsePlaylist = (
    value: unknown,
    fallbackLabel?: string,
  ): ListeningRoomPlaylist | null => {
    if (!value || typeof value !== "object") return null;

    const playlist = value as Record<string, unknown>;
    if (
      typeof playlist.spotifyUrl !== "string" ||
      playlist.spotifyUrl.length === 0
    ) {
      return null;
    }

    return {
      label:
        typeof playlist.label === "string" && playlist.label.length > 0
          ? playlist.label
          : fallbackLabel ?? "Current playlist",
      spotifyUrl: playlist.spotifyUrl,
      updated:
        typeof playlist.updated === "string"
          ? playlist.updated
          : fallbackUpdated,
    };
  };

  const current = parsePlaylist(raw.current);
  if (!current) return null;

  const archive = Array.isArray(raw.archive)
    ? raw.archive.flatMap((playlist) => {
        const parsed = parsePlaylist(playlist);
        return parsed ? [parsed] : [];
      })
    : [];

  return {
    heading:
      typeof raw.heading === "string" && raw.heading.length > 0
        ? raw.heading
        : "Current Rotation",
    description:
      typeof raw.description === "string" && raw.description.length > 0
        ? raw.description
        : undefined,
    current,
    archive,
    showArchive: raw.showArchive === true,
    archiveHeading:
      typeof raw.archiveHeading === "string" && raw.archiveHeading.length > 0
        ? raw.archiveHeading
        : "Playlist Archive",
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
