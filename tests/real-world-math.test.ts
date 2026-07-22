import assert from "node:assert/strict";
import { test } from "vitest";
import { LESSONS } from "../lib/lessons/definitions";
import { generateLessonQuestions, generateSkillQuestion, validateQuestion } from "../lib/lessons/questions";

test("money questions use a configurable currency visual and valid cent calculations", () => {
  const questions = generateLessonQuestions("money-1", "market");
  assert.ok(questions.every(validateQuestion));
  assert.ok(questions.some((question) => question.visual?.type === "money" && question.visual.currencyCode === "USD"));
  assert.ok(questions.every((question) => question.kind === "money" && question.correctAnswer >= 0));
  assert.ok(questions.some((question) => question.templateId === "money-shopping-left" && question.explanation.includes("-")));
});

test("time questions validate analog and digital answers on allowed minute marks", () => {
  for (let seed = 0; seed < 100; seed += 1) {
    const question = generateSkillQuestion("time", seed % 2 === 0 ? "review" : "core", `clock-${seed}`);
    assert.equal(question.kind, "time");
    assert.equal(question.interactionMode, "multiple-choice");
    assert.ok(validateQuestion(question));
    assert.equal(question.correctAnswer % 15, 0);
    assert.equal(question.visual?.type, "clock");
  }
});

test("fractions stay visual for halves thirds and quarters", () => {
  const questions = generateLessonQuestions("fractions-1", "kitchen");
  assert.ok(questions.every(validateQuestion));
  assert.ok(questions.every((question) => question.kind === "fraction"));
  assert.ok(questions.every((question) => question.interactionMode === "fraction-coloring" || question.interactionMode === "visual-selection"));
  assert.ok(questions.every((question) => question.visual?.type === "fraction"));
});

test("measurement and graph lessons use pictures and deterministic answers", () => {
  const measurement = generateLessonQuestions("measurement-1", "meadow");
  const graphs = generateLessonQuestions("graphs-1", "garden");
  assert.deepEqual(measurement, generateLessonQuestions("measurement-1", "meadow"));
  assert.deepEqual(graphs, generateLessonQuestions("graphs-1", "garden"));
  assert.ok(measurement.every((question) => question.visual?.type === "measurement" && validateQuestion(question)));
  assert.ok(graphs.every((question) => question.visual?.type === "graph" && validateQuestion(question)));
});

test("word problems remain short one-step stories without multiplication or division", () => {
  const questions = generateLessonQuestions("word-problems-1", "story");
  assert.ok(questions.every(validateQuestion));
  assert.ok(questions.every((question) => question.kind === "word-problem" && question.interactionMode === "number-entry"));
  assert.ok(questions.every((question) => question.prompt.split(" ").length <= 16));
  assert.ok(questions.every((question) => !/[×÷*/]/.test(question.prompt)));
});

test("all registered lesson ids generate valid ten-question sessions", () => {
  for (const lesson of LESSONS) assert.equal(generateLessonQuestions(lesson.id, "all").length, lesson.questionCount);
});
