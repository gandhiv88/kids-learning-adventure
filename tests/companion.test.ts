import { describe, expect, test } from "vitest";
import { getCompanionState } from "../lib/learning";

describe("companion state", () => {
  test("varies placement deterministically by question", () => {
    expect(getCompanionState(0, "idle")).toEqual(getCompanionState(0, "idle"));
    expect(new Set(Array.from({ length: 8 }, (_, index) => getCompanionState(index, "idle").placement)).size).toBeGreaterThan(3);
  });
  test("uses feedback-specific poses", () => {
    expect(getCompanionState(2, "correct").pose).toBe("cheering");
    expect(getCompanionState(2, "retry").pose).toBe("encouraging");
  });
});
