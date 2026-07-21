export type CharacterId = "unicorn" | "robot" | "dragon";

export type CompanionPose = "idle" | "thinking" | "cheering" | "encouraging" | "surprised";
export type CompanionPlacement = "left" | "right" | "top-left" | "top-right" | "bottom-left" | "bottom-right";

export type QuestionKind =
  | "addition"
  | "subtraction"
  | "missing-addend"
  | "skip-counting"
  | "number-bond";

export type Question = {
  id: string;
  kind: QuestionKind;
  prompt: string;
  values: readonly number[];
  choices: readonly number[];
  correctAnswer: number;
};

export type SessionResult = {
  starsEarned: number;
  firstTryCorrect: number;
  questionsCompleted: number;
  totalAttempts: number;
  questionCount: 8;
};
