import { MOODS, type Mood } from "@/types/content";

export function slugifyMood(mood: string): string {
  return mood.toLowerCase().replace(/\s+/g, "-");
}

export function moodFromSlug(slug: string): Mood | null {
  return MOODS.find((m) => slugifyMood(m) === slug) ?? null;
}

export function slugifyTag(tag: string): string {
  return tag.toLowerCase().replace(/\s+/g, "-");
}

export function tagFromSlug(slug: string): string {
  const normalized = slug.toLowerCase();
  return (
    MOODS.find((m) => slugifyTag(m) === normalized)?.toLowerCase() ??
    slug.replace(/-/g, " ")
  );
}
