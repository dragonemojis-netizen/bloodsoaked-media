import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type {
  CurrentlyExperiencing,
  FromTheEditor,
  FromTheEditorImage,
} from "@/types/editorial";

const EDITORIAL_DIR = path.join(process.cwd(), "content", "editorial");

export function getCurrentlyExperiencing(): CurrentlyExperiencing {
  const filePath = path.join(EDITORIAL_DIR, "currently-experiencing.json");
  if (!fs.existsSync(filePath)) return {};

  return JSON.parse(fs.readFileSync(filePath, "utf8")) as CurrentlyExperiencing;
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
