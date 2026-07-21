import assert from "node:assert/strict";
import { test } from "vitest";
import { evaluateAnswer, evaluateFractionColoring, evaluateMatching, normalizeNumberEntry } from "../lib/lessons/interactions";
import { generateLessonQuestions } from "../lib/lessons/questions";

const session = generateLessonQuestions("addition-1", "interactions");
test("number entry normalizes leading zeros and scores retry only once", () => {
  const question = session[0]!; assert.equal(normalizeNumberEntry("007"), 7); assert.equal(normalizeNumberEntry(""), undefined);
  assert.equal(evaluateAnswer(question, -1).correct, false);
  assert.equal(evaluateAnswer(question, question.correctAnswer, true).earnedStar, false);
});
test("matching requires every pair and may be changed before a submission", () => {
  const question = session[7]!; if (question.interactionMode !== "matching") throw new Error("expected matching");
  const partial = { [question.pairs[0]!.id]: question.pairs[0]!.answer };
  assert.equal(evaluateMatching(question, partial).earnedStar, false);
  const all = Object.fromEntries(question.pairs.map((pair) => [pair.id, pair.answer]));
  assert.equal(evaluateMatching(question, all).earnedStar, true);
  assert.equal(evaluateMatching(question, all, true).earnedStar, false);
});
test("fraction coloring supports halves thirds quarters, deselection, and retry scoring", () => {
  for (const numerator of [1, 2, 3]) { const selected = new Set(Array.from({ length: numerator }, (_, index) => index)); assert.equal(evaluateFractionColoring(numerator, selected).correct, true); selected.delete(0); assert.equal(evaluateFractionColoring(numerator, selected).correct, numerator === 0); }
  assert.equal(evaluateFractionColoring(2, new Set([0]), false).earnedStar, false);
  assert.equal(evaluateFractionColoring(2, new Set([0, 1]), true).earnedStar, false);
});
