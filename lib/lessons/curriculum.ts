import type { QuestionTemplate, SkillDefinition } from "./types";

export const QUESTION_TEMPLATES: readonly QuestionTemplate[] = [
  { id: "bond-missing-part", skillId: "number-bond", difficultyBands: ["review", "core", "challenge"], estimatedVariety: 110 },
  { id: "bond-two-parts", skillId: "number-bond", difficultyBands: ["review", "core", "challenge"], estimatedVariety: 80 },
  { id: "addition-sum", skillId: "addition", difficultyBands: ["review", "core", "challenge"], estimatedVariety: 520 },
  { id: "addition-make-ten", skillId: "addition", difficultyBands: ["review", "core", "challenge"], estimatedVariety: 120 },
  { id: "subtraction-difference", skillId: "subtraction", difficultyBands: ["review", "core", "challenge"], estimatedVariety: 430 },
  { id: "subtraction-missing-take", skillId: "subtraction", difficultyBands: ["core", "challenge"], estimatedVariety: 170 },
  { id: "missing-addend-first", skillId: "missing-addend", difficultyBands: ["review", "core", "challenge"], estimatedVariety: 170 },
  { id: "missing-addend-second", skillId: "missing-addend", difficultyBands: ["review", "core", "challenge"], estimatedVariety: 170 },
  { id: "skip-counting-next", skillId: "skip-counting", difficultyBands: ["review", "core", "challenge"], estimatedVariety: 150 },
  { id: "skip-counting-missing", skillId: "skip-counting", difficultyBands: ["core", "challenge"], estimatedVariety: 90 },
  { id: "place-value-value", skillId: "place-value", difficultyBands: ["review", "core", "challenge"], estimatedVariety: 130 },
  { id: "place-value-expanded", skillId: "place-value", difficultyBands: ["core", "challenge"], estimatedVariety: 120 },
  { id: "comparison-symbol", skillId: "number-comparison", difficultyBands: ["review", "core", "challenge"], estimatedVariety: 220 },
  { id: "comparison-greater-less", skillId: "number-comparison", difficultyBands: ["review", "core", "challenge"], estimatedVariety: 160 },
  { id: "clock-time", skillId: "clock-reading", difficultyBands: ["review", "core", "challenge"], estimatedVariety: 240 },
  { id: "clock-elapsed", skillId: "clock-reading", difficultyBands: ["core", "challenge"], estimatedVariety: 96 },
  { id: "fraction-shaded", skillId: "fraction", difficultyBands: ["review", "core", "challenge"], estimatedVariety: 210 },
  { id: "fraction-compare", skillId: "fraction", difficultyBands: ["challenge"], estimatedVariety: 90 },
  { id: "word-addition", skillId: "word-problem", difficultyBands: ["review", "core", "challenge"], estimatedVariety: 190 },
  { id: "word-subtraction", skillId: "word-problem", difficultyBands: ["review", "core", "challenge"], estimatedVariety: 190 },
  { id: "word-missing-addend", skillId: "word-problem", difficultyBands: ["core", "challenge"], estimatedVariety: 100 },
] as const;

export const SKILLS: readonly SkillDefinition[] = [
  { id: "number-bond", title: "Number Bonds", description: "Find parts that make a whole.", prerequisites: [], difficultyBands: ["review", "core", "challenge"], templateIds: ["bond-missing-part", "bond-two-parts"], estimatedVariety: 190 },
  { id: "addition", title: "Addition", description: "Add within 20 and within 100.", prerequisites: [{ skillId: "number-bond", difficulty: "review" }], difficultyBands: ["review", "core", "challenge"], templateIds: ["addition-sum", "addition-make-ten"], estimatedVariety: 640 },
  { id: "subtraction", title: "Subtraction", description: "Take away without negative answers.", prerequisites: [{ skillId: "number-bond", difficulty: "review" }], difficultyBands: ["review", "core", "challenge"], templateIds: ["subtraction-difference", "subtraction-missing-take"], estimatedVariety: 600 },
  { id: "missing-addend", title: "Missing Addends", description: "Find the hidden part in an addition equation.", prerequisites: [{ skillId: "number-bond", difficulty: "review" }, { skillId: "addition", difficulty: "review" }], difficultyBands: ["review", "core", "challenge"], templateIds: ["missing-addend-first", "missing-addend-second"], estimatedVariety: 340 },
  { id: "skip-counting", title: "Skip Counting", description: "Count by equal steps.", prerequisites: [], difficultyBands: ["review", "core", "challenge"], templateIds: ["skip-counting-next", "skip-counting-missing"], estimatedVariety: 240 },
  { id: "place-value", title: "Place Value", description: "Read tens and ones.", prerequisites: [{ skillId: "addition", difficulty: "review" }], difficultyBands: ["review", "core", "challenge"], templateIds: ["place-value-value", "place-value-expanded"], estimatedVariety: 250 },
  { id: "number-comparison", title: "Number Comparison", description: "Compare values using more, less, and equal.", prerequisites: [{ skillId: "place-value", difficulty: "review" }], difficultyBands: ["review", "core", "challenge"], templateIds: ["comparison-symbol", "comparison-greater-less"], estimatedVariety: 380 },
  { id: "clock-reading", title: "Analog Clocks", description: "Read whole-hour, half-hour, and quarter-hour times.", prerequisites: [{ skillId: "skip-counting", difficulty: "review" }], difficultyBands: ["review", "core", "challenge"], templateIds: ["clock-time", "clock-elapsed"], estimatedVariety: 336 },
  { id: "fraction", title: "Basic Fractions", description: "Name shaded equal parts and compare simple fractions.", prerequisites: [{ skillId: "number-bond", difficulty: "core" }], difficultyBands: ["review", "core", "challenge"], templateIds: ["fraction-shaded", "fraction-compare"], estimatedVariety: 300 },
  { id: "word-problem", title: "One-Step Word Problems", description: "Solve short addition, subtraction, and missing-part stories.", prerequisites: [{ skillId: "addition", difficulty: "review" }, { skillId: "subtraction", difficulty: "review" }], difficultyBands: ["review", "core", "challenge"], templateIds: ["word-addition", "word-subtraction", "word-missing-addend"], estimatedVariety: 480 },
] as const;

export const skillById = (id: SkillDefinition["id"]): SkillDefinition => SKILLS.find((skill) => skill.id === id)!;
export const templatesForSkill = (id: SkillDefinition["id"]): readonly QuestionTemplate[] => QUESTION_TEMPLATES.filter((template) => template.skillId === id);
