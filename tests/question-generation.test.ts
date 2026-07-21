import { describe, expect, test } from "vitest";
import { generateSessionQuestions, isCorrectAnswer } from "../lib/learning";

describe("Milestone 1 question generation", () => {
  test("creates the required fixed eight-question skill mix", () => {
    const questions = generateSessionQuestions();
    expect(questions).toHaveLength(8);
    expect(questions.map((question) => question.kind)).toEqual(["addition", "addition", "subtraction", "missing-addend", "addition", "skip-counting", "subtraction", "number-bond"]);
  });
  test("is deterministic and has valid choice sets", () => {
    const questions = generateSessionQuestions(12);
    expect(generateSessionQuestions(12)).toEqual(questions);
    for (const question of questions) { expect(new Set(question.choices).size).toBe(4); expect(question.choices).toContain(question.correctAnswer); expect(isCorrectAnswer(question, question.correctAnswer)).toBe(true); }
  });
  test("balances seeded correct-answer positions without long repeats", () => {
    const questions = generateSessionQuestions(4);
    const positions = questions.map((question) => question.choices.indexOf(question.correctAnswer));
    expect(positions).not.toEqual(Array(8).fill(0));
    expect([0, 1, 2, 3].map((position) => positions.filter((value) => value === position).length)).toEqual([2, 2, 2, 2]);
    for (let index = 2; index < positions.length; index += 1) expect([positions[index - 2], positions[index - 1], positions[index]]).not.toEqual([positions[index], positions[index], positions[index]]);
  });
  test("validates the numeric answer independently of its displayed position", () => {
    for (const question of generateSessionQuestions(99)) { expect(isCorrectAnswer(question, question.choices[question.choices.indexOf(question.correctAnswer)])).toBe(true); }
  });
  test("never introduces negative subtraction or multiplication", () => {
    for (const question of generateSessionQuestions()) { if (question.kind === "subtraction") expect(question.values[0] - question.values[1]).toBeGreaterThanOrEqual(0); expect(question.prompt).not.toContain("×"); }
  });
});
