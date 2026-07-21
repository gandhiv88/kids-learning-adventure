import type { CharacterId, SavedProgress } from "../../types";

const STORAGE_KEY = "kids-learning-adventure.progress.v1";
const characters: readonly CharacterId[] = ["unicorn", "robot", "dragon"];

function isProgress(value: unknown): value is SavedProgress {
  if (!value || typeof value !== "object") return false;
  const data = value as Partial<SavedProgress>;
  return data.version === 1 && characters.includes(data.selectedCharacter as CharacterId) && typeof data.totalStars === "number" && data.totalStars >= 0;
}

export function loadProgress(): SavedProgress | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data: unknown = JSON.parse(raw);
    return isProgress(data) ? data : null;
  } catch { return null; }
}

function write(progress: SavedProgress) {
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); } catch { /* local play still works */ }
}

export function saveCharacter(selectedCharacter: CharacterId): SavedProgress {
  const current = loadProgress();
  const progress = { version: 1 as const, selectedCharacter, totalStars: current?.totalStars ?? 0 };
  write(progress);
  return progress;
}

export function addSessionStars(selectedCharacter: CharacterId, starsEarned: number): SavedProgress {
  const current = loadProgress();
  const progress = { version: 1 as const, selectedCharacter, totalStars: (current?.totalStars ?? 0) + Math.max(0, starsEarned) };
  write(progress);
  return progress;
}
