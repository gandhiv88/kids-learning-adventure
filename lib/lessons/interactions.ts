import type { MatchingQuestion, Question } from "./types";

export type AttemptResult = { complete: boolean; correct: boolean; earnedStar: boolean; hint?: string };
export const normalizeNumberEntry = (value: string): number | undefined => /^\d+$/.test(value) ? Number(value) : undefined;
export const evaluateAnswer = (question: Question, answer: number, attemptedBefore = false): AttemptResult => {
  const correct = answer === question.correctAnswer;
  return { complete: correct, correct, earnedStar: correct && !attemptedBefore, ...(correct ? {} : { hint: question.hint }) };
};
export const evaluateMatching = (question: MatchingQuestion, matches: Readonly<Record<string, number>>, attemptedBefore = false): AttemptResult => {
  const correct = question.pairs.every((pair) => matches[pair.id] === pair.answer);
  return { complete: correct, correct, earnedStar: correct && !attemptedBefore, ...(correct ? {} : { hint: "Some pairs need another look. You can change any match." }) };
};
export const evaluateFractionColoring = (numerator: number, selectedSections: ReadonlySet<number>, attemptedBefore = false): AttemptResult => {
  const correct = selectedSections.size === numerator;
  return { complete: correct, correct, earnedStar: correct && !attemptedBefore, ...(correct ? {} : { hint: "The top number tells us how many parts to color." }) };
};
