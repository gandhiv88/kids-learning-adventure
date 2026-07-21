import assert from "node:assert/strict";
import { test } from "vitest";
import { QUESTION_TEMPLATES, SKILLS, templatesForSkill } from "../lib/lessons/curriculum";
import { generateLessonQuestions, generateSkillQuestion, rememberQuestions, validateQuestion } from "../lib/lessons/questions";
import type { DifficultyBand, SkillId } from "../lib/lessons/types";

const skillIds: readonly SkillId[] = ["number-bond", "addition", "subtraction", "missing-addend", "skip-counting", "place-value", "number-comparison", "clock-reading", "fraction", "word-problem"];
const bands: readonly DifficultyBand[] = ["review", "core", "challenge"];

test("curriculum defines every Milestone 3A skill with templates and prerequisites", () => {
  assert.deepEqual(SKILLS.map((skill) => skill.id), skillIds);
  assert.ok(SKILLS.every((skill) => skill.difficultyBands.length === 3));
  assert.ok(SKILLS.every((skill) => skill.templateIds.length >= 2));
  assert.ok(SKILLS.every((skill) => skill.estimatedVariety >= 150));
  assert.deepEqual(SKILLS.find((skill) => skill.id === "clock-reading")?.prerequisites, [{ skillId: "skip-counting", difficulty: "review" }]);
  assert.deepEqual(SKILLS.find((skill) => skill.id === "number-comparison")?.prerequisites, [{ skillId: "place-value", difficulty: "review" }]);
  assert.ok(QUESTION_TEMPLATES.every((template) => templatesForSkill(template.skillId).some((entry) => entry.id === template.id)));
});

test("every skill and difficulty band generates deterministic valid questions", () => {
  for (const skillId of skillIds) {
    for (const difficulty of bands) {
      const question = generateSkillQuestion(skillId, difficulty, "sample");
      assert.deepEqual(generateSkillQuestion(skillId, difficulty, "sample"), question);
      assert.ok(validateQuestion(question), `${skillId} ${difficulty} should validate`);
      assert.equal(question.kind, skillId);
      assert.equal(question.difficulty, difficulty);
      assert.equal(question.choices.length, 4);
      assert.equal(new Set(question.choices).size, 4);
      assert.equal(question.choices.includes(question.correctAnswer), true);
      assert.equal(question.prompt.includes("×"), false);
      assert.equal(question.prompt.includes("÷"), false);
      assert.match(question.templateId, /-/);
    }
  }
});

test("different seeds produce varied generated questions", () => {
  for (const skillId of skillIds) {
    const samples = new Set(Array.from({ length: 18 }, (_, index) => generateSkillQuestion(skillId, "core", `seed-${index}`).questionKey));
    assert.ok(samples.size >= 10, `${skillId} should vary across seeds`);
  }
});

test("difficulty bands change arithmetic ranges without creating three-digit arithmetic", () => {
  const review = Array.from({ length: 30 }, (_, index) => generateSkillQuestion("addition", "review", `r-${index}`).correctAnswer);
  const core = Array.from({ length: 30 }, (_, index) => generateSkillQuestion("addition", "core", `c-${index}`).correctAnswer);
  const challenge = Array.from({ length: 30 }, (_, index) => generateSkillQuestion("subtraction", "challenge", `s-${index}`));
  assert.ok(review.every((answer) => answer <= 20));
  assert.ok(core.some((answer) => answer > 20));
  assert.ok(core.every((answer) => answer < 100));
  assert.ok(challenge.every((question) => question.correctAnswer >= 0 && !/\d{3,}/.test(question.prompt)));
});

test("clock generation uses whole, half, and quarter hour bands correctly", () => {
  const review = Array.from({ length: 12 }, (_, index) => generateSkillQuestion("clock-reading", "review", `h-${index}`));
  const core = Array.from({ length: 12 }, (_, index) => generateSkillQuestion("clock-reading", "core", `hh-${index}`));
  const challenge = Array.from({ length: 24 }, (_, index) => generateSkillQuestion("clock-reading", "challenge", `q-${index}`));
  assert.ok(review.every((question) => question.correctAnswer % 60 === 0));
  assert.ok(core.every((question) => question.correctAnswer % 30 === 0));
  assert.ok(challenge.every((question) => question.correctAnswer % 15 === 0));
  assert.ok(challenge.some((question) => question.correctAnswer % 30 !== 0));
  assert.ok(challenge.every((question) => question.choiceLabels && question.choices.every((choice) => /^\d{1,2}:\d{2}$/.test(question.choiceLabels?.[choice] ?? ""))));
});

test("fraction generation keeps numerators and denominators valid", () => {
  for (const difficulty of bands) {
    for (let index = 0; index < 24; index += 1) {
      const question = generateSkillQuestion("fraction", difficulty, `${difficulty}-${index}`);
      assert.ok(validateQuestion(question));
      if (question.templateId === "fraction-shaded") {
        const numerator = Math.floor(question.correctAnswer / 100);
        const denominator = question.correctAnswer % 100;
        assert.ok(numerator >= 1);
        assert.ok(numerator < denominator);
        assert.ok(difficulty === "review" ? denominator === 2 : denominator <= 4);
      }
    }
  }
});

test("lesson generation is reproducible, balanced, and records repeat history", () => {
  const questions = generateLessonQuestions("forest-challenge-1", "map-seed");
  assert.deepEqual(generateLessonQuestions("forest-challenge-1", "map-seed"), questions);
  assert.ok(questions.every(validateQuestion));
  assert.ok(questions.some((question) => question.kind === "place-value"));
  assert.ok(questions.some((question) => question.kind === "number-comparison"));
  assert.ok(questions.some((question) => question.kind === "word-problem"));
  const positions = questions.map((question) => question.choices.indexOf(question.correctAnswer));
  assert.deepEqual([0, 1, 2, 3].map((position) => positions.filter((value) => value === position).length), [2, 2, 2, 2]);
  const history = rememberQuestions({ recentQuestionKeys: [], recentOperandKeys: [] }, questions);
  assert.equal(history.recentQuestionKeys.length, 8);
  assert.ok(history.recentOperandKeys.length >= 8);
});

test("recent history rolls off so spaced review can return later", () => {
  const first = generateLessonQuestions("number-bonds-1", "rolloff");
  let history = rememberQuestions({ recentQuestionKeys: [], recentOperandKeys: [] }, first, 8, 8);
  const second = generateLessonQuestions("number-bonds-1", "rolloff", { history, maxRecentQuestions: 8, maxRecentOperands: 8 });
  assert.equal(first.some((question) => second.some((next) => next.questionKey === question.questionKey)), false);
  history = rememberQuestions(history, second, 8, 8);
  const oldAllowed = generateLessonQuestions("number-bonds-1", "rolloff", { history, maxRecentQuestions: 0, maxRecentOperands: 0 });
  assert.ok(oldAllowed.length === 8);
});
