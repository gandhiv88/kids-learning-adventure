import { describe, expect, test } from "vitest";
import { createSessionResult, recordAttempt } from "../lib/learning";

describe("session scoring", () => {
  test("awards one star for a correct first attempt", () => { expect(recordAttempt(createSessionResult(), 1, true)).toMatchObject({ starsEarned: 1, firstTryCorrect: 1, questionsCompleted: 1, totalAttempts: 1 }); });
  test("does not remove stars for a retry and awards none after an error", () => { const afterError = recordAttempt(createSessionResult(), 1, false); expect(afterError).toMatchObject({ starsEarned: 0, questionsCompleted: 0, totalAttempts: 1 }); expect(recordAttempt(afterError, 2, true)).toMatchObject({ starsEarned: 0, firstTryCorrect: 0, questionsCompleted: 1, totalAttempts: 2 }); });
});
