import type { LessonDefinition, LessonId } from "./types";

export const LESSONS: readonly LessonDefinition[] = [
  { id: "number-bonds-1", worldId: "number-forest", title: "Number Bond Garden", shortTitle: "Bond Garden", description: "Find the two parts that make a whole.", skillFocus: ["number-bond"], questionCount: 8, order: 1 },
  { id: "addition-1", worldId: "number-forest", title: "Addition Trail", shortTitle: "Addition Trail", description: "Add numbers along the forest trail.", skillFocus: ["addition"], questionCount: 8, order: 2 },
  { id: "missing-addends-1", worldId: "number-forest", title: "Mystery Number Grove", shortTitle: "Mystery Grove", description: "Discover the hidden number.", skillFocus: ["missing-addend"], questionCount: 8, order: 3 },
  { id: "subtraction-1", worldId: "number-forest", title: "Subtraction Cave", shortTitle: "Subtraction Cave", description: "Take away without going below zero.", skillFocus: ["subtraction"], questionCount: 8, order: 4 },
  { id: "skip-counting-1", worldId: "number-forest", title: "Skip-Counting Bridge", shortTitle: "Counting Bridge", description: "Hop by twos, fives, and tens.", skillFocus: ["skip-counting"], questionCount: 8, order: 5 },
  { id: "forest-challenge-1", worldId: "number-forest", title: "Forest Star Challenge", shortTitle: "Star Challenge", description: "A bright mixed review of the forest skills.", skillFocus: ["number-bond", "addition", "missing-addend", "subtraction", "skip-counting"], questionCount: 8, order: 6 },
] as const;

export const lessonById = (id: LessonId) => LESSONS.find((lesson) => lesson.id === id)!;
