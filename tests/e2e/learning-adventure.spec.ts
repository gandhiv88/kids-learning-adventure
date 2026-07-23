import { expect, test, type Page } from "@playwright/test";
import { LESSONS } from "../../lib/lessons/definitions";
import { generateLessonQuestions } from "../../lib/lessons/questions";
import type { LessonId, Question } from "../../lib/lessons/types";

const STORAGE_KEY = "number-forest-progress";

function completedProgressThrough(lessonId: LessonId) {
  const lessonProgress: Record<string, { bestScore: number; completed: boolean }> = {};
  for (const lesson of LESSONS) {
    lessonProgress[lesson.id] = { bestScore: 10, completed: true };
    if (lesson.id === lessonId) break;
  }
  return {
    version: 4,
    selectedCharacter: "luna",
    totalAdventureStars: Object.keys(lessonProgress).length * 10,
    lessonProgress,
    questionHistory: { recentQuestionKeys: [], recentOperandKeys: [] },
  };
}

function unlockedProgressFor(lessonId: LessonId) {
  const lessonIndex = LESSONS.findIndex((lesson) => lesson.id === lessonId);
  if (lessonIndex < 0) throw new Error(`Unknown lesson ${lessonId}`);
  if (lessonIndex === 0) {
    return {
      version: 4,
      selectedCharacter: "moss",
      totalAdventureStars: 0,
      lessonProgress: {},
      questionHistory: { recentQuestionKeys: [], recentOperandKeys: [] },
    };
  }
  return completedProgressThrough(LESSONS[lessonIndex - 1]!.id);
}

async function clearProgress(page: Page) {
  await page.addInitScript((key) => window.localStorage.removeItem(key), STORAGE_KEY);
}

async function seedProgress(page: Page, progress: unknown) {
  await page.addInitScript(
    ({ key, value }) => window.localStorage.setItem(key, JSON.stringify(value)),
    { key: STORAGE_KEY, value: progress },
  );
}

async function typeNumber(page: Page, answer: number) {
  for (const digit of String(answer)) await page.getByRole("button", { name: digit }).click();
}

async function answerQuestion(page: Page, question: Question) {
  if (question.interactionMode === "matching") {
    for (const pair of question.pairs) {
      await page.getByLabel(`${pair.prompt}: choose its answer`).selectOption(String(pair.answer));
    }
  } else if (question.interactionMode === "multiple-choice") {
    await page.locator(`[data-choice-id="choice-${question.correctAnswer}"]`).click();
  } else if (question.interactionMode === "visual-selection") {
    const option = question.visualOptions.find((item) => item.id === question.correctOptionId);
    if (!option) throw new Error(`Missing correct visual option for ${question.id}`);
    await page.getByRole("button", { name: option.label, exact: true }).click();
  } else if (question.interactionMode === "fraction-coloring") {
    for (let part = 1; part <= question.numerator; part += 1) {
      await page.getByRole("button", { name: new RegExp(`Part ${part} of ${question.denominator}`) }).click();
    }
  } else {
    await typeNumber(page, question.correctAnswer);
  }

  await page.getByRole("button", { name: "Check" }).click();
}

async function completeLesson(page: Page, lessonId: LessonId, seed: string) {
  const questions = generateLessonQuestions(lessonId, seed);
  for (const [index, question] of questions.entries()) {
    await expect(page.getByText(`${index + 1}/${questions.length}`)).toBeVisible();
    await answerQuestion(page, question);
    await expect(page.getByRole("button", { name: index === questions.length - 1 ? "See my results" : "Next question" })).toBeVisible();
    await page.getByRole("button", { name: index === questions.length - 1 ? "See my results" : "Next question" }).click();
  }
}

test("new learner can choose a companion and complete the first lesson", async ({ page }) => {
  await clearProgress(page);
  await page.goto("/?testSeed=e2e-bonds");

  await expect(page.getByRole("heading", { name: "Ready for a little math adventure?" })).toBeVisible();
  await page.getByRole("button", { name: "Choose companion" }).click();
  await page.getByRole("button", { name: /Luna/ }).click();

  await expect(page.getByRole("heading", { name: "Math Adventure" })).toBeVisible();
  await page.getByRole("button", { name: /1\. Bond Garden/ }).click();

  await completeLesson(page, "number-bonds-1", "e2e-bonds");

  await expect(page.getByRole("heading", { name: "Number Bond Garden" })).toBeVisible();
  await expect(page.getByText("⭐ 10 / 10")).toBeVisible();
  await expect(page.getByText("You grew your best score by 10 stars!")).toBeVisible();
});

test("multiple-choice retry requires choosing a different answer", async ({ page }) => {
  const seed = "e2e-choice-retry";
  const questions = generateLessonQuestions("addition-1", seed);
  const choiceIndex = questions.findIndex((question) => question.interactionMode === "multiple-choice");
  if (choiceIndex < 0) throw new Error("Expected addition lesson to include a multiple-choice question");

  await seedProgress(page, completedProgressThrough("number-bonds-1"));
  await page.goto(`/?testSeed=${seed}`);
  await page.getByRole("button", { name: "Enter Math Adventure" }).click();
  await page.getByRole("button", { name: /2\. Addition Trail/ }).click();

  for (let index = 0; index < choiceIndex; index += 1) {
    await answerQuestion(page, questions[index]!);
    await page.getByRole("button", { name: "Next question" }).click();
  }

  const question = questions[choiceIndex]!;
  if (question.interactionMode !== "multiple-choice") throw new Error("Expected multiple-choice question");
  const wrongChoice = question.choices.find((choice) => choice !== question.correctAnswer);
  if (wrongChoice === undefined) throw new Error("Expected a wrong choice");

  await page.locator(`[data-choice-id="choice-${wrongChoice}"]`).click();
  await page.getByRole("button", { name: "Check" }).click();
  await expect(page.getByRole("button", { name: "Check" })).toBeDisabled();
  await page.locator(`[data-choice-id="choice-${question.correctAnswer}"]`).click();
  await expect(page.getByRole("button", { name: "Check" })).toBeEnabled();
});

test("character switching preserves stars and lesson progress after refresh", async ({ page }) => {
  await seedProgress(page, completedProgressThrough("number-bonds-1"));
  await page.goto("/?testSeed=e2e-character");
  await page.getByRole("button", { name: "Enter Math Adventure" }).click();

  await expect(page.getByText("⭐ 10")).toBeVisible();
  await page.getByRole("button", { name: "Change companion" }).click();
  await page.getByRole("button", { name: /Ember/ }).click();
  await expect(page.getByRole("button", { name: /1\. Bond Garden/ })).toContainText("Best: 10/10 stars");
  await expect(page.getByText("⭐ 10")).toBeVisible();

  await page.reload();
  await page.getByRole("button", { name: "Enter Math Adventure" }).click();
  await expect(page.getByRole("button", { name: /1\. Bond Garden/ })).toContainText("Best: 10/10 stars");
  await expect(page.getByText("⭐ 10")).toBeVisible();
});

test("malformed older saved progress is normalized without crashing", async ({ page }) => {
  await seedProgress(page, {
    version: 1,
    selectedCharacter: "not-a-companion",
    totalAdventureStars: -20,
    lessonProgress: { "number-bonds-1": { bestScore: 99, completed: true }, "ghost-lesson": { bestScore: 5, completed: true } },
    questionHistory: { recentQuestionKeys: ["ok", 7], recentOperandKeys: [false, "operand"] },
  });

  await page.goto("/?testSeed=e2e-malformed");
  await expect(page.getByRole("heading", { name: "Ready for a little math adventure?" })).toBeVisible();
  await page.getByRole("button", { name: "Enter Math Adventure" }).click();
  await expect(page.getByRole("button", { name: /1\. Bond Garden/ })).toContainText("Best: 10/10 stars");
  await expect(page.getByRole("button", { name: /2\. Addition Trail/ })).toBeEnabled();
});

test("grouped map exposes real-world lessons and locks future lessons", async ({ page }) => {
  await seedProgress(page, completedProgressThrough("forest-challenge-1"));
  await page.goto("/?testSeed=e2e-map");
  await page.getByRole("button", { name: "Enter Math Adventure" }).click();

  await expect(page.getByText("Market Town")).toBeVisible();
  await expect(page.getByText("Clock Tower")).toBeVisible();
  await expect(page.getByText("Fraction Kitchen")).toBeVisible();
  await expect(page.getByText("Measurement Meadow")).toBeVisible();
  await expect(page.getByText("Graph Garden")).toBeVisible();
  await expect(page.getByRole("button", { name: /7\. Market Money/ })).toBeEnabled();
  await expect(page.getByRole("button", { name: /8\. Clock Times/ })).toBeDisabled();
});

test("unlocked money lesson can be completed with deterministic real-world questions", async ({ page }) => {
  await seedProgress(page, completedProgressThrough("forest-challenge-1"));
  await page.goto("/?testSeed=e2e-money");
  await page.getByRole("button", { name: "Enter Math Adventure" }).click();
  await page.getByRole("button", { name: /7\. Market Money/ }).click();

  await expect(page.getByText("Market Money")).toBeVisible();
  await completeLesson(page, "money-1", "e2e-money");

  await expect(page.getByRole("heading", { name: "Market Money" })).toBeVisible();
  await expect(page.getByText("⭐ 10 / 10")).toBeVisible();
});

for (const lessonId of ["time-1", "fractions-1", "measurement-1", "graphs-1", "place-value-1", "word-problems-1"] as const) {
  test(`${lessonId} can be completed through the browser UI`, async ({ page }) => {
    const seed = `e2e-${lessonId}`;
    const lesson = LESSONS.find((item) => item.id === lessonId)!;
    await seedProgress(page, unlockedProgressFor(lessonId));
    await page.goto(`/?testSeed=${seed}`);
    await page.getByRole("button", { name: "Enter Math Adventure" }).click();
    await page.getByRole("button", { name: new RegExp(`${lesson.order}\\. ${lesson.shortTitle}`) }).click();

    await completeLesson(page, lessonId, seed);

    await expect(page.getByRole("heading", { name: lesson.title })).toBeVisible();
    await expect(page.getByText("⭐ 10 / 10")).toBeVisible();
  });
}
