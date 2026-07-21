import { LESSONS } from "./definitions";
import type { CharacterId, LessonId, LessonProgress, SavedProgress } from "./types";

export const emptyProgress = (): SavedProgress => ({ version: 3, selectedCharacter: "moss", totalAdventureStars: 0, lessonProgress: {} });
export const clampScore = (score: unknown): number => Math.max(0, Math.min(8, Number.isFinite(score) ? Math.floor(Number(score)) : 0));
export const isCharacter = (value: unknown): value is CharacterId => value === "moss" || value === "luna" || value === "ember";
export const normalizedLessonProgress = (value: unknown): LessonProgress | undefined => {
  if (!value || typeof value !== "object") return undefined;
  const item = value as { bestScore?: unknown; completed?: unknown };
  const bestScore = clampScore(item.bestScore);
  return { bestScore, completed: item.completed === true };
};

export function normalizeProgress(value: unknown): SavedProgress {
  const fallback = emptyProgress();
  if (!value || typeof value !== "object") return fallback;
  const raw = value as Record<string, unknown>;
  const rawLessons = raw.lessonProgress && typeof raw.lessonProgress === "object" ? raw.lessonProgress as Record<string, unknown> : {};
  const lessonProgress: SavedProgress["lessonProgress"] = {};
  for (const lesson of LESSONS) {
    const item = normalizedLessonProgress(rawLessons[lesson.id]);
    if (item) lessonProgress[lesson.id] = item;
  }
  return { version: 3, selectedCharacter: isCharacter(raw.selectedCharacter) ? raw.selectedCharacter : fallback.selectedCharacter, totalAdventureStars: Math.max(0, Number.isFinite(raw.totalAdventureStars) ? Math.floor(Number(raw.totalAdventureStars)) : 0), lessonProgress };
}

/** Accepts legacy M1 shapes as well as v3 records. */
export function migrateProgress(value: unknown): SavedProgress {
  const normalized = normalizeProgress(value);
  if (!value || typeof value !== "object") return normalized;
  const raw = value as Record<string, unknown>;
  if (!raw.lessonProgress) {
    const legacyBest = clampScore(raw.bestScore ?? raw.bestSessionScore ?? raw.stars);
    const completed = raw.completed === true || raw.sessionComplete === true || legacyBest > 0;
    if (legacyBest || completed) normalized.lessonProgress["number-bonds-1"] = { bestScore: legacyBest, completed };
  }
  const recordedStars = Object.values(normalized.lessonProgress).reduce((sum, item) => sum + (item?.bestScore ?? 0), 0);
  normalized.totalAdventureStars = Math.max(normalized.totalAdventureStars, recordedStars);
  return normalized;
}

export function commitLessonResult(progress: SavedProgress, lessonId: LessonId, score: number): { progress: SavedProgress; starsAdded: number; improved: boolean } {
  const safeScore = clampScore(score);
  const previous = progress.lessonProgress[lessonId] ?? { bestScore: 0, completed: false };
  const newBest = Math.max(previous.bestScore, safeScore);
  const starsAdded = newBest - previous.bestScore;
  return { progress: { ...progress, totalAdventureStars: Math.max(progress.totalAdventureStars, 0) + starsAdded, lessonProgress: { ...progress.lessonProgress, [lessonId]: { bestScore: newBest, completed: true } } }, starsAdded, improved: newBest > previous.bestScore };
}

export function unlockedLessonIds(progress: SavedProgress): LessonId[] {
  const unlocked: LessonId[] = [LESSONS[0].id];
  LESSONS.slice(0, -1).forEach((lesson, index) => { if (progress.lessonProgress[lesson.id]?.completed) unlocked.push(LESSONS[index + 1].id); });
  return unlocked;
}
export const recommendedLessonId = (progress: SavedProgress): LessonId => unlockedLessonIds(progress).find((id) => !progress.lessonProgress[id]?.completed) ?? LESSONS[LESSONS.length - 1].id;
export const lessonIsUnlocked = (progress: SavedProgress, id: LessonId) => unlockedLessonIds(progress).includes(id);
