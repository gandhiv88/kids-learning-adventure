import type { SessionResult } from "../../types";

export function createSessionResult(): SessionResult {
  return { starsEarned: 0, firstTryCorrect: 0, questionsCompleted: 0, totalAttempts: 0, questionCount: 8 };
}

export function recordAttempt(result: SessionResult, attemptNumber: number, correct: boolean): SessionResult {
  const totalAttempts = result.totalAttempts + 1;
  if (!correct) return { ...result, totalAttempts };
  const earnedStar = attemptNumber === 1 ? 1 : 0;
  return {
    ...result,
    totalAttempts,
    questionsCompleted: result.questionsCompleted + 1,
    starsEarned: result.starsEarned + earnedStar,
    firstTryCorrect: result.firstTryCorrect + earnedStar,
  };
}
