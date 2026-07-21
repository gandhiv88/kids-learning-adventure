import type { Question } from "../../types";

const baseChoices = (correctAnswer: number, distractors: readonly number[]) => [
  correctAnswer,
  ...distractors,
] as const;

type QuestionTemplate = Omit<Question, "choices"> & { choices: readonly number[] };

const templates: readonly QuestionTemplate[] = [
  { id: "add-1", kind: "addition", prompt: "How many stars are there?", values: [4, 3], choices: baseChoices(7, [6, 8, 9]), correctAnswer: 7 },
  { id: "add-2", kind: "addition", prompt: "How many apples altogether?", values: [5, 4], choices: baseChoices(9, [8, 10, 7]), correctAnswer: 9 },
  { id: "subtract-1", kind: "subtraction", prompt: "How many are left?", values: [9, 3], choices: baseChoices(6, [5, 7, 4]), correctAnswer: 6 },
  { id: "missing-1", kind: "missing-addend", prompt: "What number fills the blank?", values: [6, 10], choices: baseChoices(4, [3, 5, 6]), correctAnswer: 4 },
  { id: "add-3", kind: "addition", prompt: "How many shells altogether?", values: [6, 5], choices: baseChoices(11, [10, 12, 9]), correctAnswer: 11 },
  { id: "skip-1", kind: "skip-counting", prompt: "What number comes next?", values: [2, 4, 6], choices: baseChoices(8, [7, 9, 10]), correctAnswer: 8 },
  { id: "subtract-2", kind: "subtraction", prompt: "How many are left?", values: [12, 5], choices: baseChoices(7, [6, 8, 5]), correctAnswer: 7 },
  { id: "bond-1", kind: "number-bond", prompt: "What part is missing?", values: [10, 6], choices: baseChoices(4, [3, 5, 6]), correctAnswer: 4 },
];

function seededValue(seed: number) { return (seed * 1664525 + 1013904223) >>> 0; }

function seededShuffle<T>(values: readonly T[], seed: number): T[] {
  const shuffled = [...values];
  let state = seed >>> 0;
  for (let index = shuffled.length - 1; index > 0; index -= 1) { state = seededValue(state); const target = state % (index + 1); [shuffled[index], shuffled[target]] = [shuffled[target], shuffled[index]]; }
  return shuffled;
}

/** Two appearances per button, then a seeded permutation. No uncontrolled randomness is used. */
function correctPositions(seed: number) {
  const round = seededShuffle([0, 1, 2, 3], seed);
  return [...round, ...round];
}

/** Returns deterministic question content with a controlled, session-specific answer order. */
export function generateSessionQuestions(seed = 1): readonly Question[] {
  const positions = correctPositions(seed);
  return templates.map((question, index) => {
    const distractors = seededShuffle(question.choices.filter((choice) => choice !== question.correctAnswer), seed + index + 1);
    const choices = [...distractors];
    choices.splice(positions[index], 0, question.correctAnswer);
    return { ...question, choices };
  });
}

export function isCorrectAnswer(question: Question, answer: number) {
  return question.correctAnswer === answer;
}
