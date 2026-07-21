export type CharacterId = "moss" | "luna" | "ember";

export type LessonId =
  | "number-bonds-1"
  | "addition-1"
  | "missing-addends-1"
  | "subtraction-1"
  | "skip-counting-1"
  | "forest-challenge-1";

export type DifficultyBand = "review" | "core" | "challenge";
export type SkillId =
  | "number-bond"
  | "addition"
  | "subtraction"
  | "missing-addend"
  | "skip-counting"
  | "place-value"
  | "number-comparison"
  | "clock-reading"
  | "fraction"
  | "word-problem";
export type QuestionKind = SkillId;
export type QuestionTemplateId =
  | "bond-missing-part"
  | "bond-two-parts"
  | "addition-sum"
  | "addition-make-ten"
  | "subtraction-difference"
  | "subtraction-missing-take"
  | "missing-addend-first"
  | "missing-addend-second"
  | "skip-counting-next"
  | "skip-counting-missing"
  | "place-value-value"
  | "place-value-expanded"
  | "comparison-symbol"
  | "comparison-greater-less"
  | "clock-time"
  | "clock-elapsed"
  | "fraction-shaded"
  | "fraction-compare"
  | "word-addition"
  | "word-subtraction"
  | "word-missing-addend";

export type Prerequisite = {
  skillId: SkillId;
  difficulty: DifficultyBand;
};

export type SkillDefinition = {
  id: SkillId;
  title: string;
  description: string;
  prerequisites: readonly Prerequisite[];
  difficultyBands: readonly DifficultyBand[];
  templateIds: readonly QuestionTemplateId[];
  estimatedVariety: number;
};

export type QuestionTemplate = {
  id: QuestionTemplateId;
  skillId: SkillId;
  difficultyBands: readonly DifficultyBand[];
  estimatedVariety: number;
};

export type LessonDefinition = {
  id: LessonId;
  worldId: "number-forest";
  title: string;
  shortTitle: string;
  description: string;
  skillFocus: readonly SkillId[];
  difficultyBands: readonly DifficultyBand[];
  questionCount: 8;
  order: number;
};

export type Question = {
  id: string;
  kind: QuestionKind;
  templateId: QuestionTemplateId;
  difficulty: DifficultyBand;
  prompt: string;
  choices: readonly number[];
  choiceLabels?: Readonly<Record<number, string>>;
  correctAnswer: number;
  hint: string;
  questionKey: string;
  operandKeys: readonly string[];
};

export type QuestionHistory = {
  recentQuestionKeys: readonly string[];
  recentOperandKeys: readonly string[];
};
export type LessonProgress = { bestScore: number; completed: boolean };
export type SavedProgress = {
  version: 4;
  selectedCharacter: CharacterId;
  totalAdventureStars: number;
  lessonProgress: Partial<Record<LessonId, LessonProgress>>;
  questionHistory: QuestionHistory;
};
