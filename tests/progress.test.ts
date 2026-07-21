import { describe, expect, test } from "vitest";
import { applyLessonCompletion, loadProgress, MILESTONE_ONE_LESSON_ID, migrateProgress } from "../lib/persistence";
import type { SavedProgress } from "../types";

const progress = (): SavedProgress => ({ version: 2, selectedCharacter: "robot", totalAdventureStars: 0, lessonBestScores: {}, committedSessionIds: [] });

describe("best-score progress", () => {
  test("adds a first completion and only later improvements", () => {
    const first = applyLessonCompletion(progress(), MILESTONE_ONE_LESSON_ID, "one", 6);
    expect(first).toMatchObject({ addedStars: 6, bestScore: 6, isNewBest: true });
    const lower = applyLessonCompletion(first.progress, MILESTONE_ONE_LESSON_ID, "two", 4);
    expect(lower).toMatchObject({ addedStars: 0, bestScore: 6, isNewBest: false });
    const equal = applyLessonCompletion(lower.progress, MILESTONE_ONE_LESSON_ID, "three", 6);
    expect(equal).toMatchObject({ addedStars: 0, bestScore: 6 });
    expect(applyLessonCompletion(equal.progress, MILESTONE_ONE_LESSON_ID, "four", 8)).toMatchObject({ addedStars: 2, bestScore: 8, isNewBest: true });
  });
  test("caps scores, never decreases totals, and ignores duplicate session commits", () => {
    const first = applyLessonCompletion(progress(), MILESTONE_ONE_LESSON_ID, "same", 12);
    expect(first).toMatchObject({ addedStars: 8, bestScore: 8 });
    const duplicate = applyLessonCompletion(first.progress, MILESTONE_ONE_LESSON_ID, "same", 8);
    expect(duplicate).toMatchObject({ alreadyCommitted: true, addedStars: 0, bestScore: 8 });
    expect(duplicate.progress.totalAdventureStars).toBe(8);
  });
});

describe("v1 progress migration", () => {
  test("preserves old stars and character while safely starting an accurate lesson best", () => {
    expect(migrateProgress({ version: 1, selectedCharacter: "dragon", totalStars: 23 })).toEqual({ version: 2, selectedCharacter: "dragon", totalAdventureStars: 23, lessonBestScores: { [MILESTONE_ONE_LESSON_ID]: 0 }, committedSessionIds: [] });
  });
  test("handles malformed saved values safely and caps existing v2 lesson scores", () => {
    expect(migrateProgress({ version: 1, selectedCharacter: "not-a-character", totalStars: 4 })).toBeNull();
    expect(migrateProgress({ version: 2, selectedCharacter: "unicorn", totalAdventureStars: 3, lessonBestScores: { [MILESTONE_ONE_LESSON_ID]: 19 }, committedSessionIds: [] })?.lessonBestScores[MILESTONE_ONE_LESSON_ID]).toBe(8);
  });
  test("does not crash when localStorage is unavailable", () => {
    Object.defineProperty(globalThis, "window", { configurable: true, value: { localStorage: { getItem: () => { throw new Error("blocked"); } } } });
    expect(loadProgress()).toBeNull();
    delete (globalThis as { window?: unknown }).window;
  });
});
