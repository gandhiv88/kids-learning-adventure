import assert from "node:assert/strict";
import { test } from "vitest";
import { LESSONS } from "../lib/lessons/definitions";
import { generateLessonQuestions, validateQuestion } from "../lib/lessons/questions";
import { commitLessonResult, emptyProgress } from "../lib/lessons/progress";

test("ten-question sessions have an intentional mixed interaction distribution", () => {
  for (const lesson of LESSONS) {
    const questions = generateLessonQuestions(lesson.id, "acorn");
    assert.equal(questions.length, 10);
    assert.deepEqual(questions.map((question) => question.interactionMode), ["number-entry", "number-entry", "number-entry", "number-entry", "number-entry", "number-entry", "multiple-choice", "matching", "visual-selection", "fraction-coloring"]);
    assert.ok(questions.every(validateQuestion));
    assert.equal(questions.filter((question) => question.interactionMode === "multiple-choice").length, 1);
  }
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
