import fs from "fs";
import path from "path";

export type TimelineStatus =
  | "active"
  | "archived"
  | "active-era"
  | "dormant"
  | "ongoing";

export interface TimelineEvent {
  period: string;
  title: string;
  description: string;
  status: TimelineStatus;
  filingRef?: string;
  link?: string;
  linkLabel?: string;
}

interface TimelineData {
  introduction?: string;
  events: TimelineEvent[];
}

const TIMELINE_PATH = path.join(process.cwd(), "content", "timeline.json");

export const timelineStatusLabels: Record<TimelineStatus, string> = {
  active: "Active",
  archived: "Archived",
  "active-era": "Active Era",
  dormant: "Dormant",
  ongoing: "Ongoing",
};

export function getPublicationTimeline(): TimelineData {
  if (!fs.existsSync(TIMELINE_PATH)) {
    return { events: [] };
  }
  return JSON.parse(fs.readFileSync(TIMELINE_PATH, "utf8")) as TimelineData;
}
