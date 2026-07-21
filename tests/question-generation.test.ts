import { describe, expect, test } from "vitest";
import { generateSessionQuestions, isCorrectAnswer } from "../lib/learning";

describe("Milestone 1 question generation", () => {
  test("creates the required fixed eight-question skill mix", () => {
    const questions = generateSessionQuestions();
    expect(questions).toHaveLength(8);
    expect(questions.map((question) => question.kind)).toEqual(["addition", "addition", "subtraction", "missing-addend", "addition", "skip-counting", "subtraction", "number-bond"]);
  });
  test("is deterministic and has valid choice sets", () => {
    const questions = generateSessionQuestions();
    expect(generateSessionQuestions()).toEqual(questions);
    for (const question of questions) { expect(new Set(question.choices).size).toBe(4); expect(question.choices).toContain(question.correctAnswer); expect(isCorrectAnswer(question, question.correctAnswer)).toBe(true); }
  });
  test("never introduces negative subtraction or multiplication", () => {
    for (const question of generateSessionQuestions()) { if (question.kind === "subtraction") expect(question.values[0] - question.values[1]).toBeGreaterThanOrEqual(0); expect(question.prompt).not.toContain("×"); }
  });
});
