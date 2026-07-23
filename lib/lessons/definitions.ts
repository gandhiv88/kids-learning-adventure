import type { LessonDefinition, LessonGroup, LessonId } from "./types";
export const LESSON_GROUPS: readonly LessonGroup[] = [
  { id: "number-forest", title: "Number Forest", description: "Addition, subtraction, number bonds, skip counting, and place value.", order: 1 },
  { id: "market-town", title: "Market Town", description: "Money and shopping math.", order: 2 },
  { id: "clock-tower", title: "Clock Tower", description: "Analog clocks, digital times, and elapsed time.", order: 3 },
  { id: "fraction-kitchen", title: "Fraction Kitchen", description: "Halves, thirds, and quarters with food and shapes.", order: 4 },
  { id: "measurement-meadow", title: "Measurement Meadow", description: "Length, height, weight, capacity, and rulers.", order: 5 },
  { id: "graph-garden", title: "Graph Garden", description: "Picture graphs and bar charts.", order: 6 },
] as const;
export const LESSONS: readonly LessonDefinition[] = [
  { id: "number-bonds-1", worldId: "number-forest", title: "Number Bond Garden", shortTitle: "Bond Garden", description: "Find the two parts that make a whole.", skillFocus: ["number-bond"], difficultyBands: ["review", "core"], questionCount: 10, order: 1 },
  { id: "addition-1", worldId: "number-forest", title: "Addition Trail", shortTitle: "Addition Trail", description: "Add numbers along the forest trail.", skillFocus: ["addition"], difficultyBands: ["review", "core"], questionCount: 10, order: 2 },
  { id: "missing-addends-1", worldId: "number-forest", title: "Mystery Number Grove", shortTitle: "Mystery Grove", description: "Discover the hidden number.", skillFocus: ["missing-addend"], difficultyBands: ["review", "core"], questionCount: 10, order: 3 },
  { id: "subtraction-1", worldId: "number-forest", title: "Subtraction Cave", shortTitle: "Subtraction Cave", description: "Take away without going below zero.", skillFocus: ["subtraction"], difficultyBands: ["review", "core"], questionCount: 10, order: 4 },
  { id: "skip-counting-1", worldId: "number-forest", title: "Skip-Counting Bridge", shortTitle: "Counting Bridge", description: "Hop by twos, fives, and tens.", skillFocus: ["skip-counting"], difficultyBands: ["review", "core"], questionCount: 10, order: 5 },
  { id: "forest-challenge-1", worldId: "number-forest", title: "Forest Star Challenge", shortTitle: "Star Challenge", description: "A bright mixed review of the forest skills.", skillFocus: ["number-bond", "addition", "missing-addend", "subtraction", "skip-counting", "place-value", "number-comparison", "word-problem"], difficultyBands: ["review", "core"], questionCount: 10, order: 6 },
  { id: "money-1", worldId: "market-town", title: "Market Money", shortTitle: "Market Money", description: "Count coins, compare amounts, shop, and make exact money.", skillFocus: ["money"], difficultyBands: ["review", "core"], questionCount: 10, order: 7 },
  { id: "time-1", worldId: "clock-tower", title: "Clock Tower Times", shortTitle: "Clock Times", description: "Read clocks, match times, and think before and after.", skillFocus: ["time"], difficultyBands: ["review", "core"], questionCount: 10, order: 8 },
  { id: "fractions-1", worldId: "fraction-kitchen", title: "Fraction Kitchen", shortTitle: "Fractions", description: "Use pizzas, fruit, chocolate bars, and shapes for halves, thirds, and quarters.", skillFocus: ["fraction"], difficultyBands: ["review", "core"], questionCount: 10, order: 9 },
  { id: "measurement-1", worldId: "measurement-meadow", title: "Measurement Meadow", shortTitle: "Measurement", description: "Compare size, weight, height, capacity, and ruler marks.", skillFocus: ["measurement"], difficultyBands: ["review", "core"], questionCount: 10, order: 10 },
  { id: "graphs-1", worldId: "graph-garden", title: "Graph Garden", shortTitle: "Graphs", description: "Read picture graphs and bar charts.", skillFocus: ["graph"], difficultyBands: ["review", "core"], questionCount: 10, order: 11 },
  { id: "place-value-1", worldId: "number-forest", title: "Base-Ten Clearing", shortTitle: "Tens & Ones", description: "Build numbers from tens and ones.", skillFocus: ["place-value"], difficultyBands: ["review", "core"], questionCount: 10, order: 12 },
  { id: "word-problems-1", worldId: "number-forest", title: "Story Problem Path", shortTitle: "Story Problems", description: "Solve very short real-world math stories.", skillFocus: ["word-problem"], difficultyBands: ["review", "core"], questionCount: 10, order: 13 },
] as const;
export const lessonById = (id: LessonId) => LESSONS.find((lesson) => lesson.id === id)!;
