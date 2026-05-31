import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { CurrentlyExperiencing, FromTheEditor } from "@/types/editorial";

const EDITORIAL_DIR = path.join(process.cwd(), "content", "editorial");

export function getCurrentlyExperiencing(): CurrentlyExperiencing {
  const filePath = path.join(EDITORIAL_DIR, "currently-experiencing.json");
  if (!fs.existsSync(filePath)) return {};

  return JSON.parse(fs.readFileSync(filePath, "utf8")) as CurrentlyExperiencing;
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

  return {
    introduction: data.introduction ?? "",
    body,
    monthlyUpdate: data.monthlyUpdate,
    monthlyClosing: data.monthlyClosing,
    updated: data.updated,
  };
}
