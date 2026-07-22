import assert from "node:assert/strict";
import { test } from "vitest";
import { generateLessonQuestions, generateSkillQuestion, validateQuestion } from "../lib/lessons/questions";
import type { MatchingQuestion } from "../lib/lessons/types";

test("multiple-choice options are unique, complete, and deterministic across 1,000 seeds", () => {
  for (let seed = 0; seed < 1_000; seed += 1) {
    const question = generateSkillQuestion("addition", "core", `choice-${seed}`);
    assert.equal(question.interactionMode, "multiple-choice");
    assert.equal(question.choices.length, 4);
    assert.equal(new Set(question.choices).size, 4);
    assert.equal(question.choices.filter((choice) => choice === question.correctAnswer).length, 1);
    assert.equal(new Set(question.choices.map((choice) => `choice-${choice}`)).size, question.choices.length);
    assert.deepEqual(question, generateSkillQuestion("addition", "core", `choice-${seed}`));
  }
});

test("matching activities remain solvable and retain every required answer across 1,000 deterministic seeds", () => {
  for (let seed = 0; seed < 1_000; seed += 1) {
    const question = generateLessonQuestions("addition-1", `matching-${seed}`)[7]!;
    assert.equal(question.interactionMode, "matching");
    assert.ok(validateQuestion(question));
    assert.ok(question.answerBank.length > 0);
    assert.equal(new Set(question.answerBank).size, question.answerBank.length);
    assert.equal(new Set(question.pairs.map((pair) => pair.id)).size, question.pairs.length);
    assert.equal(new Set(question.pairs.map((pair) => pair.answer)).size, question.pairs.length);
    assert.deepEqual(new Set(question.answerBank), new Set(question.pairs.map((pair) => pair.answer)), "the answer bank must be exactly the required answers");
    for (const pair of question.pairs) assert.ok(question.answerBank.includes(pair.answer), `${pair.prompt} must have ${pair.answer}`);
  }
});

test("the displayed matching sums keep their arithmetic answers in the answer bank", () => {
  const question = generateLessonQuestions("number-bonds-1", "visible-matching")[7]!;
  assert.equal(question.interactionMode, "matching");
  assert.deepEqual(question.pairs.map((pair) => [pair.prompt, pair.answer]), [["2 + 3", 5], ["3 + 4", 7], ["4 + 5", 9]]);
  assert.deepEqual(new Set(question.answerBank), new Set([5, 7, 9]));
});

const matchingFixture = (overrides: Partial<MatchingQuestion>): MatchingQuestion => ({
  id: "matching-fixture", questionKey: "matching-fixture", operandKeys: ["matching-fixture"], kind: "addition", templateId: "addition-sum", difficulty: "review", prompt: "Match each sum.", correctAnswer: 3, hint: "Try again.", interactionMode: "matching",
  explanation: "Each sum has one answer.", encouragement: ["Nice matching."], pairs: [{ id: "one", prompt: "1 + 1", answer: 2, label: "2" }, { id: "two", prompt: "1 + 2", answer: 3, label: "3" }, { id: "three", prompt: "2 + 2", answer: 4, label: "4" }], answerBank: [2, 3, 4], ...overrides,
});

test("matching validation rejects malformed or impossible activities", () => {
  assert.equal(validateQuestion(matchingFixture({ answerBank: [2, 3] })), false, "missing required answer");
  assert.equal(validateQuestion(matchingFixture({ answerBank: [] })), false, "empty answer bank");
  assert.equal(validateQuestion(matchingFixture({ answerBank: [2, 3, 3] })), false, "duplicate bank option");
  assert.equal(validateQuestion(matchingFixture({ pairs: [{ id: "one", prompt: "1 + 1", answer: 2, label: "2" }, { id: "one", prompt: "1 + 2", answer: 3, label: "3" }, { id: "three", prompt: "2 + 2", answer: 4, label: "4" }] })), false, "duplicate pair id");
  assert.equal(validateQuestion(matchingFixture({ pairs: [{ id: "one", prompt: "", answer: 2, label: "2" }, { id: "two", prompt: "1 + 2", answer: 3, label: "3" }, { id: "three", prompt: "2 + 2", answer: 4, label: "4" }] })), false, "empty pair prompt");
  assert.equal(validateQuestion(matchingFixture({ answerBank: [2, 3, 4, 5] })), false, "unmapped extra answer");
  assert.equal(validateQuestion(matchingFixture({ pairs: [{ id: "one", prompt: "1 + 1", answer: 2, label: "2" }, { id: "two", prompt: "1 + 2", answer: 2, label: "2" }, { id: "three", prompt: "2 + 2", answer: 4, label: "4" }], answerBank: [2, 4] })), false, "ambiguous duplicate answers");
});
