import type { Question } from "../../types";

const choices = (correctAnswer: number, distractors: readonly number[]) => [
  correctAnswer,
  ...distractors,
] as const;

/** Returns the fixed Milestone 1 question set. Kept isolated for future seeded variants. */
export function generateSessionQuestions(): readonly Question[] {
  return [
    { id: "add-1", kind: "addition", prompt: "How many stars are there?", values: [4, 3], choices: choices(7, [6, 8, 9]), correctAnswer: 7 },
    { id: "add-2", kind: "addition", prompt: "How many apples altogether?", values: [5, 4], choices: choices(9, [8, 10, 7]), correctAnswer: 9 },
    { id: "subtract-1", kind: "subtraction", prompt: "How many are left?", values: [9, 3], choices: choices(6, [5, 7, 4]), correctAnswer: 6 },
    { id: "missing-1", kind: "missing-addend", prompt: "What number fills the blank?", values: [6, 10], choices: choices(4, [3, 5, 6]), correctAnswer: 4 },
    { id: "add-3", kind: "addition", prompt: "How many shells altogether?", values: [6, 5], choices: choices(11, [10, 12, 9]), correctAnswer: 11 },
    { id: "skip-1", kind: "skip-counting", prompt: "What number comes next?", values: [2, 4, 6], choices: choices(8, [7, 9, 10]), correctAnswer: 8 },
    { id: "subtract-2", kind: "subtraction", prompt: "How many are left?", values: [12, 5], choices: choices(7, [6, 8, 5]), correctAnswer: 7 },
    { id: "bond-1", kind: "number-bond", prompt: "What part is missing?", values: [10, 6], choices: choices(4, [3, 5, 6]), correctAnswer: 4 },
  ];
}

export function isCorrectAnswer(question: Question, answer: number) {
  return question.correctAnswer === answer;
}
