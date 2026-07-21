import type { CharacterId, SavedProgress } from "../../types";

const STORAGE_KEY = "kids-learning-adventure.progress.v1";
const characters: readonly CharacterId[] = ["unicorn", "robot", "dragon"];
export const MILESTONE_ONE_LESSON_ID = "math-foundations-1";
const MAX_LESSON_STARS = 8;

type LegacyProgress = { version: 1; selectedCharacter: CharacterId; totalStars: number };
export type LessonCommit = { progress: SavedProgress; addedStars: number; bestScore: number; isNewBest: boolean; alreadyCommitted: boolean };

function isCharacter(value: unknown): value is CharacterId { return typeof value === "string" && characters.includes(value as CharacterId); }
function validScore(value: unknown) { return typeof value === "number" && Number.isFinite(value) && value >= 0; }
function capScore(value: number) { return Math.min(MAX_LESSON_STARS, Math.max(0, Math.floor(value))); }

function isVersionTwo(value: unknown): value is SavedProgress {
  if (!value || typeof value !== "object") return false;
  const data = value as Partial<SavedProgress>;
  return data.version === 2 && isCharacter(data.selectedCharacter) && validScore(data.totalAdventureStars) && typeof data.lessonBestScores === "object" && data.lessonBestScores !== null && Array.isArray(data.committedSessionIds);
}

function isVersionOne(value: unknown): value is LegacyProgress {
  if (!value || typeof value !== "object") return false;
  const data = value as Partial<LegacyProgress>;
  return data.version === 1 && isCharacter(data.selectedCharacter) && validScore(data.totalStars);
}

/**
 * Version 1 had only a lifetime total, so it cannot reliably identify a lesson best.
 * We retain the earned total but start this lesson at 0; future completions build an
 * accurate best score without incorrectly treating old cross-session stars as one score.
 */
export function migrateProgress(value: unknown): SavedProgress | null {
  if (isVersionTwo(value)) {
    return { ...value, totalAdventureStars: Math.max(0, value.totalAdventureStars), lessonBestScores: Object.fromEntries(Object.entries(value.lessonBestScores).map(([id, score]) => [id, validScore(score) ? capScore(score) : 0])), committedSessionIds: value.committedSessionIds.filter((id): id is string => typeof id === "string") };
  }
  if (isVersionOne(value)) return { version: 2, selectedCharacter: value.selectedCharacter, totalAdventureStars: value.totalStars, lessonBestScores: { [MILESTONE_ONE_LESSON_ID]: 0 }, committedSessionIds: [] };
  return null;
}

export function loadProgress(): SavedProgress | null {
  if (typeof window === "undefined") return null;
  try { const raw = window.localStorage.getItem(STORAGE_KEY); return raw ? migrateProgress(JSON.parse(raw) as unknown) : null; } catch { return null; }
}

function write(progress: SavedProgress) { try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); } catch { /* local play still works */ } }

function freshProgress(selectedCharacter: CharacterId): SavedProgress { return { version: 2, selectedCharacter, totalAdventureStars: 0, lessonBestScores: {}, committedSessionIds: [] }; }

export function saveCharacter(selectedCharacter: CharacterId): SavedProgress {
  const current = loadProgress() ?? freshProgress(selectedCharacter);
  const progress = { ...current, selectedCharacter };
  write(progress);
  return progress;
}

/** Pure, idempotent completion operation: a session ID may improve a lesson only once. */
export function applyLessonCompletion(progress: SavedProgress, lessonId: string, sessionId: string, sessionStars: number): LessonCommit {
  const score = capScore(sessionStars);
  const currentBest = capScore(progress.lessonBestScores[lessonId] ?? 0);
  if (progress.committedSessionIds.includes(sessionId)) return { progress, addedStars: 0, bestScore: currentBest, isNewBest: false, alreadyCommitted: true };
  const addedStars = Math.max(0, score - currentBest);
  const bestScore = Math.max(currentBest, score);
  return { progress: { ...progress, totalAdventureStars: progress.totalAdventureStars + addedStars, lessonBestScores: { ...progress.lessonBestScores, [lessonId]: bestScore }, committedSessionIds: [...progress.committedSessionIds, sessionId] }, addedStars, bestScore, isNewBest: score > currentBest, alreadyCommitted: false };
}

export function commitLessonResult(selectedCharacter: CharacterId, lessonId: string, sessionId: string, sessionStars: number): LessonCommit {
  const current = loadProgress() ?? freshProgress(selectedCharacter);
  const completion = applyLessonCompletion({ ...current, selectedCharacter }, lessonId, sessionId, sessionStars);
  if (!completion.alreadyCommitted) write(completion.progress);
  return completion;
}
