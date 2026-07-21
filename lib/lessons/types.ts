export type CharacterId = "moss" | "luna" | "ember";

export type LessonId =
  | "number-bonds-1"
  | "addition-1"
  | "missing-addends-1"
  | "subtraction-1"
  | "skip-counting-1"
  | "forest-challenge-1";

export type QuestionKind = "number-bond" | "addition" | "missing-addend" | "subtraction" | "skip-counting";

export type LessonDefinition = {
  id: LessonId;
  worldId: "number-forest";
  title: string;
  shortTitle: string;
  description: string;
  skillFocus: readonly QuestionKind[];
  questionCount: 8;
  order: number;
};

export type Question = {
  kind: QuestionKind;
  prompt: string;
  choices: readonly number[];
  correctAnswer: number;
  hint: string;
};

export type LessonProgress = { bestScore: number; completed: boolean };
export type SavedProgress = {
  version: 3;
  selectedCharacter: CharacterId;
  totalAdventureStars: number;
  lessonProgress: Partial<Record<LessonId, LessonProgress>>;
};
