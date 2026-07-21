import assert from "node:assert/strict";
import test from "node:test";
import { LESSONS } from "../lib/lessons/definitions";
import { commitLessonResult, emptyProgress, lessonIsUnlocked, migrateProgress, recommendedLessonId, unlockedLessonIds } from "../lib/lessons/progress";
import { generateLessonQuestions } from "../lib/lessons/questions";

test("six ordered lessons have the required eight questions and focuses", () => {
  assert.equal(LESSONS.length, 6); assert.equal(new Set(LESSONS.map((lesson) => lesson.id)).size, 6);
  assert.deepEqual(LESSONS.map((lesson) => lesson.order), [1, 2, 3, 4, 5, 6]);
  assert.ok(LESSONS.every((lesson) => lesson.questionCount === 8 && lesson.skillFocus.length > 0));
  assert.deepEqual(LESSONS.map((lesson) => lesson.skillFocus[0]), ["number-bond", "addition", "missing-addend", "subtraction", "skip-counting", "number-bond"]);
});

test("unlocking is sequential and completion is permanent", () => {
  let progress = emptyProgress(); assert.deepEqual(unlockedLessonIds(progress), ["number-bonds-1"]);
  progress = commitLessonResult(progress, "number-bonds-1", 0).progress;
  assert.deepEqual(unlockedLessonIds(progress), ["number-bonds-1", "addition-1"]);
  assert.equal(lessonIsUnlocked(progress, "forest-challenge-1"), false);
  for (const lesson of LESSONS.slice(1, 5)) progress = commitLessonResult(progress, lesson.id, 4).progress;
  assert.equal(lessonIsUnlocked(progress, "forest-challenge-1"), true);
  assert.equal(recommendedLessonId(progress), "forest-challenge-1");
  assert.equal(progress.lessonProgress["number-bonds-1"]?.completed, true);
});

test("best scores only add their improvement and results cannot reduce progress", () => {
  let progress = emptyProgress(); let result = commitLessonResult(progress, "number-bonds-1", 5); progress = result.progress;
  assert.equal(result.starsAdded, 5); result = commitLessonResult(progress, "number-bonds-1", 3); progress = result.progress;
  assert.equal(result.starsAdded, 0); assert.equal(progress.totalAdventureStars, 5);
  result = commitLessonResult(progress, "number-bonds-1", 8); assert.equal(result.starsAdded, 3); assert.equal(result.progress.totalAdventureStars, 8);
  assert.equal(commitLessonResult(result.progress, "number-bonds-1", 99).progress.lessonProgress["number-bonds-1"]?.bestScore, 8);
});

test("migration preserves character, stars, and safely maps legacy best score", () => {
  const migrated = migrateProgress({ version: 2, selectedCharacter: "luna", totalAdventureStars: 12, bestScore: 6, completed: true });
  assert.equal(migrated.version, 3); assert.equal(migrated.selectedCharacter, "luna"); assert.equal(migrated.totalAdventureStars, 12);
  assert.deepEqual(migrated.lessonProgress["number-bonds-1"], { bestScore: 6, completed: true });
  const malformed = migrateProgress({ selectedCharacter: "nope", totalAdventureStars: -4, lessonProgress: { "addition-1": { bestScore: 90, completed: "yes" } } });
  assert.equal(malformed.selectedCharacter, "moss"); assert.equal(malformed.totalAdventureStars, 8); assert.deepEqual(malformed.lessonProgress["addition-1"], { bestScore: 8, completed: false });
});

test("seeded questions are reproducible, varied, valid, and lesson-specific", () => {
  for (const lesson of LESSONS) {
    const first = generateLessonQuestions(lesson.id, "acorn"); const again = generateLessonQuestions(lesson.id, "acorn");
    assert.deepEqual(first, again); assert.equal(first.length, 8); assert.ok(first.every((question) => lesson.skillFocus.includes(question.kind)));
    assert.ok(first.every((question) => question.choices.length === 4 && new Set(question.choices).size === 4 && question.choices.filter((choice) => choice === question.correctAnswer).length === 1));
    assert.ok(first.every((question) => question.kind !== "subtraction" || question.correctAnswer >= 0));
    const positions = first.map((question) => question.choices.indexOf(question.correctAnswer));
    assert.deepEqual([...new Set(positions)].sort(), [0, 1, 2, 3]);
    assert.ok(positions.every((position, index) => index < 2 || !(positions[index - 2] === position && positions[index - 1] === position)));
    assert.notDeepEqual(first, generateLessonQuestions(lesson.id, "pinecone"));
  }
});
