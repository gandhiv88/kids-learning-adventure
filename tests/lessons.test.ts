import assert from "node:assert/strict";
import { test } from "vitest";
import { LESSON_GROUPS, LESSONS } from "../lib/lessons/definitions";
import { generateLessonQuestions, validateQuestion } from "../lib/lessons/questions";
import { commitLessonResult, emptyProgress } from "../lib/lessons/progress";

test("ten-question sessions use valid skill-aware interactions", () => {
  for (const lesson of LESSONS) {
    const questions = generateLessonQuestions(lesson.id, "acorn");
    assert.equal(questions.length, 10);
    assert.ok(questions.every(validateQuestion));
    assert.ok(questions.every((question) => lesson.skillFocus.includes(question.kind)));
    assert.ok(questions.every((question) => question.explanation.length > 0 && question.encouragement.length > 0));
  }
});
test("real-world lesson groups are registered for future worlds", () => {
  assert.deepEqual(LESSON_GROUPS.map((group) => group.id), ["number-forest", "market-town", "clock-tower", "fraction-kitchen", "measurement-meadow", "graph-garden"]);
  for (const group of LESSON_GROUPS) assert.ok(LESSONS.some((lesson) => lesson.worldId === group.id), `${group.id} needs a lesson`);
});
test("sessions are deterministic and allow a skill in multiple suitable interactions", () => {
  const first = generateLessonQuestions("addition-1", "seed");
  assert.deepEqual(first, generateLessonQuestions("addition-1", "seed"));
  assert.equal(first[0]?.kind, "addition"); assert.equal(first[6]?.kind, "addition");
  assert.notEqual(first[0]?.interactionMode, first[6]?.interactionMode);
});
test("lesson stars cap at ten and never decrease", () => {
  let progress = commitLessonResult(emptyProgress(), "number-bonds-1", 10).progress;
  progress = commitLessonResult(progress, "number-bonds-1", 2).progress;
  assert.equal(progress.totalAdventureStars, 10);
});
