import type { CompanionPlacement, CompanionPose } from "../../types";

export type CompanionFeedback = "idle" | "correct" | "retry";

export type CompanionState = { placement: CompanionPlacement; pose: CompanionPose };

const placements: readonly CompanionPlacement[] = ["top-left", "right", "bottom-right", "left", "top-right", "bottom-left", "right", "left"];

/** Stable question-index mapping prevents rerender jitter while keeping the companion lively. */
export function getCompanionState(questionIndex: number, feedback: CompanionFeedback): CompanionState {
  const placement = placements[questionIndex % placements.length];
  if (feedback === "correct") return { placement, pose: "cheering" };
  if (feedback === "retry") return { placement, pose: "encouraging" };
  return { placement, pose: questionIndex % 2 === 0 ? "thinking" : "idle" };
}
