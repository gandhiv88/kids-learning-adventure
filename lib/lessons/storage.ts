import { emptyProgress, migrateProgress } from "./progress";
import type { SavedProgress } from "./types";

const KEY = "number-forest-progress";
export function loadProgress(): SavedProgress {
  try { return migrateProgress(JSON.parse(window.localStorage.getItem(KEY) ?? "null")); } catch { return emptyProgress(); }
}
export function saveProgress(progress: SavedProgress): void {
  try { window.localStorage.setItem(KEY, JSON.stringify(progress)); } catch { /* local mode remains usable */ }
}
