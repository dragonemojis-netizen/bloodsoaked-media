/**
 * Workbench curator state — starred holdings and quiet preferences.
 * Lives under content/workbench/; never part of the public archive schema.
 */

import fs from "fs";
import path from "path";

const WORKBENCH_DIR = path.join(process.cwd(), "content", "workbench");
const STATE_PATH = path.join(WORKBENCH_DIR, "state.json");

export interface WorkbenchState {
  schemaVersion: number;
  starredIds: string[];
  updatedAt: string | null;
}

const DEFAULT_STATE: WorkbenchState = {
  schemaVersion: 1,
  starredIds: [],
  updatedAt: null,
};

export function readWorkbenchState(): WorkbenchState {
  if (!fs.existsSync(STATE_PATH)) return { ...DEFAULT_STATE, starredIds: [] };
  const raw = JSON.parse(fs.readFileSync(STATE_PATH, "utf8")) as WorkbenchState;
  return {
    schemaVersion: 1,
    starredIds: Array.isArray(raw.starredIds) ? raw.starredIds : [],
    updatedAt: raw.updatedAt ?? null,
  };
}

export function writeWorkbenchState(
  state: WorkbenchState,
  { dryRun = false } = {},
): void {
  if (dryRun) return;
  fs.mkdirSync(WORKBENCH_DIR, { recursive: true });
  const next = {
    ...state,
    schemaVersion: 1,
    updatedAt: new Date().toISOString(),
  };
  const tmp = `${STATE_PATH}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, `${JSON.stringify(next, null, 2)}\n`, "utf8");
  fs.renameSync(tmp, STATE_PATH);
}

export function isStarred(collectionId: string): boolean {
  return readWorkbenchState().starredIds.includes(collectionId);
}

export function toggleStarred(collectionId: string): WorkbenchState {
  const state = readWorkbenchState();
  const set = new Set(state.starredIds);
  if (set.has(collectionId)) set.delete(collectionId);
  else set.add(collectionId);
  const next = { ...state, starredIds: [...set].sort() };
  writeWorkbenchState(next);
  return next;
}
