import { QUESTION_TEMPLATES, templatesForSkill } from "./curriculum";
import { lessonById } from "./definitions";
import type { DifficultyBand, LessonId, MoneyVisual, Question, QuestionBase, QuestionHistory, QuestionTemplate, QuestionTemplateId, SkillId } from "./types";

type Random = () => number;
type DraftQuestion = Omit<QuestionBase, "id" | "questionKey" | "operandKeys" | "explanation" | "encouragement"> & { choiceLabels?: Readonly<Record<number, string>>; operandKeys?: readonly string[]; explanation?: string; encouragement?: readonly string[] };
type GenerationOptions = { history?: QuestionHistory; maxRecentQuestions?: number; maxRecentOperands?: number };

const MAX_GENERATION_ATTEMPTS = 80;
const DEFAULT_RECENT_QUESTIONS = 48;
const DEFAULT_RECENT_OPERANDS = 36;

export const emptyQuestionHistory = (): QuestionHistory => ({ recentQuestionKeys: [], recentOperandKeys: [] });

export const seededRandom = (seed: string): Random => {
  let state = 2166136261;
  for (let index = 0; index < seed.length; index += 1) state = Math.imul(state ^ seed.charCodeAt(index), 16777619);
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
};

const pick = <T,>(values: readonly T[], random: Random): T => values[Math.floor(random() * values.length)]!;
const integer = (min: number, max: number, random: Random): number => min + Math.floor(random() * (max - min + 1));
const shuffled = <T,>(values: readonly T[], random: Random): T[] => {
  const copy = [...values];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex]!, copy[index]!];
  }
  return copy;
};

const templateById = (id: QuestionTemplateId): QuestionTemplate => QUESTION_TEMPLATES.find((template) => template.id === id)!;
const templatesFor = (skillId: SkillId, difficulty: DifficultyBand, random: Random): QuestionTemplate[] => shuffled(templatesForSkill(skillId).filter((template) => template.difficultyBands.includes(difficulty)), random);
const operandKey = (skillId: SkillId, values: readonly (number | string)[]): string => `${skillId}:${values.join(":")}`;
const encodeAnswer = (numerator: number, denominator: number): number => numerator * 100 + denominator;
const fractionLabel = (numerator: number, denominator: number): string => `${numerator}/${denominator}`;
const timeAnswer = (hour: number, minute: number): number => hour * 60 + minute;
const timeLabel = (value: number): string => {
  const hour = Math.floor(value / 60);
  const minute = value % 60;
  return `${hour}:${String(minute).padStart(2, "0")}`;
};
const US_CURRENCY = {
  code: "USD",
  symbol: "$",
  minorUnitSymbol: "¢",
  minorUnitsPerMajor: 100,
  denominations: [
    { id: "penny", label: "penny", value: 1 },
    { id: "nickel", label: "nickel", value: 5 },
    { id: "dime", label: "dime", value: 10 },
    { id: "quarter", label: "quarter", value: 25 },
  ],
} as const;

const moneyLabel = (minorUnits: number): string => minorUnits >= US_CURRENCY.minorUnitsPerMajor && minorUnits % US_CURRENCY.minorUnitsPerMajor === 0 ? `${US_CURRENCY.symbol}${minorUnits / US_CURRENCY.minorUnitsPerMajor}` : `${minorUnits}${US_CURRENCY.minorUnitSymbol}`;
const coinVisual = (coinIds: readonly string[]): MoneyVisual => ({ type: "money", currencyCode: US_CURRENCY.code, coins: coinIds });
const encouragementFor = (kind: SkillId): readonly string[] => {
  if (kind === "money") return ["You counted those coins perfectly!", "That was smart market math!", "You made exact money."];
  if (kind === "time") return ["You read that clock like a pro!", "Great clock thinking!", "You found the time."];
  if (kind === "fraction") return ["Pizza math is delicious!", "You spotted the equal parts!", "Nice fraction thinking."];
  if (kind === "measurement") return ["You compared carefully!", "Great measuring!", "You used the picture well."];
  if (kind === "graph") return ["You read that graph clearly!", "Great data detective work!", "You found it on the chart."];
  if (kind === "place-value") return ["Those tens and ones made sense!", "Great base-ten thinking!", "You built the number."];
  if (kind === "word-problem") return ["You solved the story!", "Great real-world thinking!", "You found what changed."];
  return ["Wonderful thinking!", "Nice math work!", "You figured it out."];
};

function answerChoices(answer: number, random: Random, options?: { min?: number; max?: number; candidates?: readonly number[] }): number[] {
  const choices = new Set<number>([answer]);
  for (const candidate of shuffled(options?.candidates ?? [], random)) if (choices.size < 4) choices.add(candidate);
  for (const offset of shuffled([-20, -10, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 10, 20], random)) {
    const candidate = answer + offset;
    if (choices.size < 4 && candidate >= (options?.min ?? 0) && candidate <= (options?.max ?? 200)) choices.add(candidate);
  }
  let fallback = options?.min ?? 0;
  while (choices.size < 4) {
    if (fallback !== answer && fallback <= (options?.max ?? 300)) choices.add(fallback);
    fallback += 1;
  }
  return shuffled([...choices], random);
}

function generateAddition(templateId: QuestionTemplateId, difficulty: DifficultyBand, random: Random): DraftQuestion {
  const max = difficulty === "review" ? 20 : 100;
  const a = difficulty === "challenge" ? integer(20, 49, random) : integer(2, difficulty === "review" ? 12 : 60, random);
  const b = difficulty === "challenge" ? integer(10, Math.min(49, 99 - a), random) : integer(1, Math.min(max - a, difficulty === "review" ? 12 : 50), random);
  if (templateId === "addition-make-ten") {
    const near = integer(6, 9, random);
    const rest = integer(2, difficulty === "review" ? 8 : 35, random);
    return { kind: "addition", templateId, difficulty, prompt: `${near} + ${rest} = ?`, correctAnswer: near + rest, hint: "Make ten first, then add what is left.", operandKeys: [operandKey("addition", [near, rest])] };
  }
  return { kind: "addition", templateId, difficulty, prompt: `${a} + ${b} = ?`, correctAnswer: a + b, hint: "Add the ones, then the tens if you need them.", operandKeys: [operandKey("addition", [a, b])] };
}

function generateSubtraction(templateId: QuestionTemplateId, difficulty: DifficultyBand, random: Random): DraftQuestion {
  const total = difficulty === "review" ? integer(5, 20, random) : difficulty === "core" ? integer(20, 99, random) : integer(30, 99, random);
  const take = difficulty === "challenge" ? integer(10, Math.min(49, total), random) : integer(1, Math.min(total, difficulty === "review" ? 12 : 50), random);
  if (templateId === "subtraction-missing-take") return { kind: "subtraction", templateId, difficulty, prompt: `${total} - ? = ${total - take}`, correctAnswer: take, hint: "Find the part that was taken away.", operandKeys: [operandKey("subtraction", [total, take])] };
  return { kind: "subtraction", templateId, difficulty, prompt: `${total} - ${take} = ?`, correctAnswer: total - take, hint: "Count back or use the related addition fact.", operandKeys: [operandKey("subtraction", [total, take])] };
}

function generateMissingAddend(templateId: QuestionTemplateId, difficulty: DifficultyBand, random: Random): DraftQuestion {
  const total = difficulty === "review" ? integer(6, 20, random) : difficulty === "core" ? integer(18, 80, random) : integer(30, 99, random);
  const part = integer(2, total - 2, random);
  const answer = total - part;
  const prompt = templateId === "missing-addend-first" ? `? + ${part} = ${total}` : `${part} + ? = ${total}`;
  return { kind: "missing-addend", templateId, difficulty, prompt, correctAnswer: answer, hint: "Count up from the known part to the total.", operandKeys: [operandKey("missing-addend", [part, total])] };
}

function generateNumberBond(templateId: QuestionTemplateId, difficulty: DifficultyBand, random: Random): DraftQuestion {
  const whole = difficulty === "review" ? integer(6, 10, random) : difficulty === "core" ? integer(10, 20, random) : integer(15, 30, random);
  const part = integer(1, whole - 1, random);
  if (templateId === "bond-two-parts") return { kind: "number-bond", templateId, difficulty, prompt: `Which part goes with ${part} to make ${whole}?`, correctAnswer: whole - part, hint: "The two parts should add to the whole.", operandKeys: [operandKey("number-bond", [whole, part])] };
  return { kind: "number-bond", templateId, difficulty, prompt: `${part} + ? = ${whole}`, correctAnswer: whole - part, hint: "Think about the missing part of the whole.", operandKeys: [operandKey("number-bond", [whole, part])] };
}

function generateSkipCounting(templateId: QuestionTemplateId, difficulty: DifficultyBand, random: Random): DraftQuestion {
  const step = pick(difficulty === "review" ? [2, 5, 10] : difficulty === "core" ? [2, 3, 5, 10] : [3, 4, 5, 10], random);
  const start = step * integer(1, difficulty === "review" ? 6 : 15, random);
  const missingIndex = templateId === "skip-counting-missing" ? integer(1, 2, random) : 3;
  const values = [start, start + step, start + step * 2, start + step * 3];
  const answer = values[missingIndex]!;
  const prompt = values.map((value, index) => index === missingIndex ? "?" : String(value)).join(", ");
  return { kind: "skip-counting", templateId, difficulty, prompt, correctAnswer: answer, hint: `Hop by ${step}s each time.`, operandKeys: [operandKey("skip-counting", [step, start, missingIndex])] };
}

function generatePlaceValue(templateId: QuestionTemplateId, difficulty: DifficultyBand, random: Random): DraftQuestion {
  const tens = integer(difficulty === "review" ? 1 : 2, difficulty === "challenge" ? 9 : 7, random);
  const ones = integer(0, 9, random);
  const value = tens * 10 + ones;
  if (templateId === "place-value-expanded") return { kind: "place-value", templateId, difficulty, prompt: `${tens} tens and ${ones} ones make ?`, correctAnswer: value, hint: "Tens count by 10. Ones count by 1.", visual: { type: "base-ten", tens, ones }, explanation: `${tens} tens are ${tens * 10}. Add ${ones} ones to make ${value}.`, operandKeys: [operandKey("place-value", [tens, ones])] };
  const askTens = random() < 0.5;
  return { kind: "place-value", templateId, difficulty, prompt: `In ${value}, what is the ${askTens ? "tens" : "ones"} digit?`, correctAnswer: askTens ? tens : ones, hint: "Look at the place where the digit sits.", visual: { type: "base-ten", tens, ones }, explanation: `${value} has ${tens} tens and ${ones} ones.`, operandKeys: [operandKey("place-value", [value, askTens ? "tens" : "ones"])] };
}

function generateComparison(templateId: QuestionTemplateId, difficulty: DifficultyBand, random: Random): DraftQuestion {
  const max = difficulty === "review" ? 30 : 99;
  let left = integer(0, max, random);
  let right = integer(0, max, random);
  if (difficulty !== "review" && random() < 0.3) right = left;
  if (left === right && random() < 0.7) left = Math.min(max, left + 1);
  const answer = left === right ? 1 : left > right ? 2 : 0;
  const labels = { 0: "<", 1: "=", 2: ">", 3: "not sure" };
  const prompt = templateId === "comparison-greater-less" ? `Which symbol makes this true? ${left} ? ${right}` : `Compare ${left} and ${right}.`;
  return { kind: "number-comparison", templateId, difficulty, prompt, correctAnswer: answer, choiceLabels: labels, hint: "Point to the bigger number first.", operandKeys: [operandKey("number-comparison", [left, right])] };
}

function generateMoney(templateId: QuestionTemplateId, difficulty: DifficultyBand, random: Random): DraftQuestion {
  const denominations = US_CURRENCY.denominations;
  if (templateId === "money-identify-coin") {
    const coin = pick(denominations, random);
    return { kind: "money", templateId, difficulty, prompt: `What is this coin worth?`, correctAnswer: coin.value, choiceLabels: Object.fromEntries(denominations.map((item) => [item.value, moneyLabel(item.value)])), hint: `A ${coin.label} is worth ${moneyLabel(coin.value)}.`, visual: coinVisual([coin.id]), explanation: `A ${coin.label} has a value of ${moneyLabel(coin.value)}.`, operandKeys: [operandKey("money", [templateId, coin.id])] };
  }
  if (templateId === "money-shopping-left" || templateId === "money-simple-change") {
    const price = templateId === "money-shopping-left" ? integer(2, difficulty === "review" ? 7 : 15, random) * 100 : pick([25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75], random);
    const paid = templateId === "money-shopping-left" ? price + integer(1, 8, random) * 100 : pick([100, 125, 150, 200], random);
    const object = pick(["apple", "book", "snack", "kite"], random);
    return { kind: "money", templateId, difficulty, prompt: `Buy a ${object} for ${moneyLabel(price)}. You have ${moneyLabel(paid)}. How much is left?`, correctAnswer: paid - price, hint: "Subtract the price from the money you have.", explanation: `${moneyLabel(paid)} - ${moneyLabel(price)} = ${moneyLabel(paid - price)}.`, operandKeys: [operandKey("money", [templateId, price, paid, object])] };
  }
  const coinIds = Array.from({ length: difficulty === "review" ? 3 : 4 }, () => pick(denominations, random).id);
  const total = coinIds.reduce((sum, id) => sum + denominations.find((coin) => coin.id === id)!.value, 0);
  if (templateId === "money-compare-amounts") {
    const otherTotal = Math.max(1, total + pick([-15, -10, -5, 5, 10, 15, 25], random));
    const answer = total === otherTotal ? 1 : total > otherTotal ? 2 : 0;
    return { kind: "money", templateId, difficulty, prompt: `Which amount is greater: the coins or ${moneyLabel(otherTotal)}?`, correctAnswer: answer, choiceLabels: { 0: moneyLabel(otherTotal), 1: "same", 2: "coins", 3: "not sure" }, hint: "Count the coins, then compare the totals.", visual: coinVisual(coinIds), explanation: `The coins make ${moneyLabel(total)}. Compare that with ${moneyLabel(otherTotal)}.`, operandKeys: [operandKey("money", [templateId, total, otherTotal, ...coinIds])] };
  }
  if (templateId === "money-exact-amount") {
    return { kind: "money", templateId, difficulty, prompt: `Choose the coins that make ${moneyLabel(total)}.`, correctAnswer: total, hint: "Add the coin values until they match the amount.", visual: coinVisual(coinIds), explanation: `These coins add to ${moneyLabel(total)}.`, operandKeys: [operandKey("money", [templateId, total, ...coinIds])] };
  }
  return { kind: "money", templateId, difficulty, prompt: "Count these coins.", correctAnswer: total, hint: "Add each coin value.", visual: coinVisual(coinIds), explanation: `The coins add to ${moneyLabel(total)}.`, operandKeys: [operandKey("money", [templateId, total, ...coinIds])] };
}

function generateTime(templateId: QuestionTemplateId, difficulty: DifficultyBand, random: Random): DraftQuestion {
  const minuteOptions = difficulty === "review" ? [0] : difficulty === "core" ? [0, 30] : [0, 15, 30, 45];
  const hour = integer(1, 12, random);
  const minute = pick(minuteOptions, random);
  if (templateId === "time-elapsed" || templateId === "time-before-after") {
    const delta = templateId === "time-before-after" && random() < 0.5 ? -30 : 30;
    const absolute = hour * 60 + minute + delta;
    const nextHour = ((Math.floor((absolute - 1) / 60) % 12) + 12) % 12 + 1;
    const nextMinute = ((absolute % 60) + 60) % 60;
    return { kind: "time", templateId, difficulty, prompt: `It is ${timeLabel(timeAnswer(hour, minute))}. What time is ${Math.abs(delta)} minutes ${delta > 0 ? "later" : "before"}?`, correctAnswer: timeAnswer(nextHour, nextMinute), choiceLabels: clockLabels(timeAnswer(nextHour, nextMinute), random), hint: "Half an hour is 30 minutes.", visual: { type: "clock", hour, minute }, explanation: `${Math.abs(delta)} minutes is half an hour.`, operandKeys: [operandKey("time", [hour, minute, delta])] };
  }
  const answer = timeAnswer(hour, minute);
  return { kind: "time", templateId, difficulty, prompt: templateId === "time-digital-read" ? `Which clock matches ${timeLabel(answer)}?` : "What time does the clock show?", correctAnswer: answer, choiceLabels: clockLabels(answer, random), hint: minute === 0 ? "The minute hand points to 12 for a whole hour." : "Use the minute hand first, then the hour hand.", visual: { type: "clock", hour, minute }, explanation: `The clock shows ${timeLabel(answer)}.`, operandKeys: [operandKey("time", [hour, minute, templateId])] };
}

function clockLabels(answer: number, random: Random): Readonly<Record<number, string>> {
  const hour = Math.floor(answer / 60);
  const candidates = [answer, timeAnswer(hour, 0), timeAnswer(hour, 15), timeAnswer(hour, 30), timeAnswer(hour, 45), timeAnswer((hour % 12) + 1, answer % 60)];
  const choices = answerChoices(answer, random, { min: 60, max: 765, candidates });
  return Object.fromEntries(choices.map((choice) => [choice, timeLabel(choice)]));
}

function generateFraction(templateId: QuestionTemplateId, difficulty: DifficultyBand, random: Random): DraftQuestion {
  const denominators = difficulty === "review" ? [2] : difficulty === "core" ? [2, 4] : [2, 3, 4];
  const denominator = pick(denominators, random);
  const numerator = integer(1, denominator - 1, random);
  const answer = encodeAnswer(numerator, denominator);
  const labels = fractionLabels(answer, denominators, random);
  const model = pick(["pizza", "chocolate-bar", "fruit", "shape"] as const, random);
  return { kind: "fraction", templateId, difficulty, prompt: `Which ${model} picture shows ${fractionLabel(numerator, denominator)}?`, correctAnswer: answer, choiceLabels: labels, visual: { type: "fraction", numerator, denominator: denominator as 2 | 3 | 4, model }, hint: "Count equal parts first. Then count shaded parts.", explanation: `${fractionLabel(numerator, denominator)} means ${numerator} of ${denominator} equal parts.`, operandKeys: [operandKey("fraction", [numerator, denominator, model])] };
}

function fractionLabels(answer: number, denominators: readonly number[], random: Random): Readonly<Record<number, string>> {
  const candidates = denominators.flatMap((denominator) => Array.from({ length: denominator - 1 }, (_, index) => encodeAnswer(index + 1, denominator)));
  const choices = answerChoices(answer, random, { min: 102, max: 904, candidates });
  return Object.fromEntries(choices.map((choice) => [choice, fractionLabel(Math.floor(choice / 100), choice % 100)]));
}

function generateMeasurement(templateId: QuestionTemplateId, difficulty: DifficultyBand, random: Random): DraftQuestion {
  if (templateId === "measurement-ruler") {
    const length = integer(2, difficulty === "review" ? 8 : 12, random);
    return { kind: "measurement", templateId, difficulty, prompt: "How many ruler marks long is the ribbon?", correctAnswer: length, hint: "Start at zero and count to the end of the ribbon.", visual: { type: "measurement", unit: "marks", items: [{ label: "ribbon", size: length, icon: "━" }] }, explanation: `The ribbon ends at ${length}.`, operandKeys: [operandKey("measurement", [templateId, length])] };
  }
  const itemSets = {
    "measurement-compare-length": { prompt: "Which object is longer?", labels: ["pencil", "crayon", "marker"], icon: "━" },
    "measurement-compare-weight": { prompt: "Which object is heavier?", labels: ["melon", "apple", "grape"], icon: "●" },
    "measurement-compare-height": { prompt: "Which object is taller?", labels: ["tower", "block stack", "cup"], icon: "▮" },
    "measurement-capacity": { prompt: "Which container holds more?", labels: ["jug", "cup", "bottle"], icon: "▰" },
  } as const;
  const set = itemSets[templateId as keyof typeof itemSets] ?? itemSets["measurement-compare-length"];
  const sizes = shuffled([integer(3, 5, random), integer(6, 8, random), integer(9, 12, random)], random);
  const items = set.labels.map((label, index) => ({ label, size: sizes[index]!, icon: set.icon }));
  const winner = items.reduce((best, item) => item.size > best.size ? item : best, items[0]!);
  return { kind: "measurement", templateId, difficulty, prompt: set.prompt, correctAnswer: winner.size, hint: "Compare the pictures side by side.", visual: { type: "measurement", items }, explanation: `The ${winner.label} is the greatest size.`, operandKeys: [operandKey("measurement", [templateId, ...sizes])] };
}

function generateGraph(templateId: QuestionTemplateId, difficulty: DifficultyBand, random: Random): DraftQuestion {
  const labels = shuffled(["apples", "bananas", "berries", "oranges"], random).slice(0, 3);
  const icons: Record<string, string> = { apples: "A", bananas: "B", berries: "R", oranges: "O" };
  const counts = shuffled([integer(2, 5, random), integer(6, 8, random), integer(9, difficulty === "review" ? 10 : 14, random)], random);
  const entries = labels.map((label, index) => ({ label, count: counts[index]!, icon: icons[label] ?? label[0]!.toUpperCase() }));
  if (templateId === "graph-most") {
    const winner = entries.reduce((best, entry) => entry.count > best.count ? entry : best, entries[0]!);
    return { kind: "graph", templateId, difficulty, prompt: "Which fruit is most popular?", correctAnswer: winner.count, hint: "Look for the longest row.", visual: { type: "graph", title: "Favorite Fruit", entries }, explanation: `${winner.label} has the most votes.`, operandKeys: [operandKey("graph", [templateId, ...counts])] };
  }
  const entry = pick(entries, random);
  return { kind: "graph", templateId, difficulty, prompt: `How many children chose ${entry.label}?`, correctAnswer: entry.count, hint: "Find the row, then count the pictures or bar length.", visual: { type: "graph", title: "Favorite Fruit", entries }, explanation: `${entry.label} has ${entry.count} votes.`, operandKeys: [operandKey("graph", [templateId, entry.label, entry.count, ...counts])] };
}

function generateWordProblem(templateId: QuestionTemplateId, difficulty: DifficultyBand, random: Random): DraftQuestion {
  const names = ["Moss", "Luna", "Ember", "Ari", "Nila"];
  const objects = ["acorns", "shells", "stars", "leaves", "berries"];
  const name = pick(names, random);
  const object = pick(objects, random);
  if (templateId === "word-subtraction") {
    const total = difficulty === "review" ? integer(6, 20, random) : integer(20, 80, random);
    const take = integer(1, Math.min(total, difficulty === "review" ? 10 : 35), random);
    return { kind: "word-problem", templateId, difficulty, prompt: `${name} had ${total} ${object} and used ${take}. How many are left?`, correctAnswer: total - take, hint: "This is a take-away story.", operandKeys: [operandKey("word-problem", [templateId, total, take, object])] };
  }
  if (templateId === "word-missing-addend") {
    const total = difficulty === "core" ? integer(12, 40, random) : integer(20, 90, random);
    const part = integer(2, total - 2, random);
    return { kind: "word-problem", templateId, difficulty, prompt: `${name} has ${part} ${object}. How many more make ${total}?`, correctAnswer: total - part, hint: "Count up to the total.", operandKeys: [operandKey("word-problem", [templateId, total, part, object])] };
  }
  const a = difficulty === "review" ? integer(2, 12, random) : integer(10, 50, random);
  const b = difficulty === "review" ? integer(1, 10, random) : integer(5, 40, random);
  return { kind: "word-problem", templateId, difficulty, prompt: `${name} found ${a} ${object}, then found ${b} more. How many ${object} now?`, correctAnswer: a + b, hint: "This is a put-together story.", operandKeys: [operandKey("word-problem", [templateId, a, b, object])] };
}

function generateDraft(skillId: SkillId, difficulty: DifficultyBand, templateId: QuestionTemplateId, random: Random): DraftQuestion {
  if (skillId === "addition") return generateAddition(templateId, difficulty, random);
  if (skillId === "subtraction") return generateSubtraction(templateId, difficulty, random);
  if (skillId === "missing-addend") return generateMissingAddend(templateId, difficulty, random);
  if (skillId === "number-bond") return generateNumberBond(templateId, difficulty, random);
  if (skillId === "skip-counting") return generateSkipCounting(templateId, difficulty, random);
  if (skillId === "place-value") return generatePlaceValue(templateId, difficulty, random);
  if (skillId === "number-comparison") return generateComparison(templateId, difficulty, random);
  if (skillId === "money") return generateMoney(templateId, difficulty, random);
  if (skillId === "time") return generateTime(templateId, difficulty, random);
  if (skillId === "fraction") return generateFraction(templateId, difficulty, random);
  if (skillId === "measurement") return generateMeasurement(templateId, difficulty, random);
  if (skillId === "graph") return generateGraph(templateId, difficulty, random);
  return generateWordProblem(templateId, difficulty, random);
}

function choicesForQuestion(draft: DraftQuestion, random: Random): number[] {
  if (draft.choiceLabels) return shuffled(Object.keys(draft.choiceLabels).map(Number), random).slice(0, 4);
  return answerChoices(draft.correctAnswer, random, { min: 0, max: 200 });
}

export function validateQuestion(question: Question): boolean {
  if (!question.id || !question.prompt.trim() || !question.hint.trim()) return false;
  if (typeof question.explanation !== "string" || !question.explanation.trim() || !Array.isArray(question.encouragement) || question.encouragement.length === 0) return false;
  if (question.prompt.includes("×") || question.prompt.includes("÷")) return false;
  if (question.kind === "subtraction" && question.correctAnswer < 0) return false;
  if (question.kind === "time" && (question.correctAnswer < 60 || question.correctAnswer > 12 * 60 + 45 || question.correctAnswer % 15 !== 0)) return false;
  if (question.kind === "money" && (question.correctAnswer < 0 || question.visual?.type === "money" && question.visual.currencyCode.length !== 3)) return false;
  if (question.visual?.type === "fraction" && (question.visual.denominator < 2 || question.visual.denominator > 4 || question.visual.numerator < 1 || question.visual.numerator >= question.visual.denominator)) return false;
  if (question.visual?.type === "graph" && question.visual.entries.length < 2) return false;
  if (question.interactionMode === "multiple-choice") {
    if (question.choices.length !== 4 || new Set(question.choices).size !== 4 || question.choices.filter((choice) => choice === question.correctAnswer).length !== 1) return false;
    if (question.choiceLabels && question.choices.some((choice) => !question.choiceLabels?.[choice])) return false;
  }
  if (question.interactionMode === "matching" && (question.pairs.length < 3 || question.pairs.length > 4 || new Set(question.answerBank).size !== question.answerBank.length || !question.pairs.every((pair) => question.answerBank.includes(pair.answer)))) return false;
  if (question.interactionMode === "matching") {
    const pairIds = new Set(question.pairs.map((pair) => pair.id));
    const requiredAnswers = new Set(question.pairs.map((pair) => pair.answer));
    if (
      pairIds.size !== question.pairs.length ||
      question.pairs.some((pair) => !pair.id.trim() || !pair.prompt.trim() || !pair.label.trim()) ||
      question.answerBank.length === 0 ||
      requiredAnswers.size !== question.pairs.length ||
      requiredAnswers.size !== question.answerBank.length ||
      !question.answerBank.every((answer) => requiredAnswers.has(answer))
    ) return false;
  }
  if (question.interactionMode === "visual-selection" && (!question.visualOptions.some((option) => option.id === question.correctOptionId) || question.visualOptions.length < 3)) return false;
  if (question.interactionMode === "fraction-coloring" && (question.denominator < 2 || question.denominator > 4 || question.numerator < 1 || question.numerator >= question.denominator)) return false;
  if (question.interactionMode === "sequence-completion" && (question.sequence.length < 3 || question.missingIndex < 0 || question.missingIndex >= question.sequence.length || question.sequence[question.missingIndex] !== question.correctAnswer)) return false;
  return true;
}

function buildQuestion(draft: DraftQuestion): Question {
  const questionKey = `${draft.kind}:${draft.templateId}:${draft.difficulty}:${draft.prompt}:${draft.correctAnswer}`;
  return { ...draft, id: questionKey, questionKey, operandKeys: draft.operandKeys ?? [questionKey], explanation: draft.explanation ?? "Use the clue and check the parts carefully.", encouragement: draft.encouragement ?? encouragementFor(draft.kind), interactionMode: "number-entry" };
}

function generationAllowed(question: Question, usedKeys: Set<string>, usedOperands: Set<string>, history: QuestionHistory, options: Required<Pick<GenerationOptions, "maxRecentQuestions" | "maxRecentOperands">>): boolean {
  if (usedKeys.has(question.questionKey)) return false;
  const recentQuestions = new Set(history.recentQuestionKeys.slice(-options.maxRecentQuestions));
  if (recentQuestions.has(question.questionKey)) return false;
  const recentOperands = new Set(history.recentOperandKeys.slice(-options.maxRecentOperands));
  const hasUsedOperand = question.operandKeys.some((key) => usedOperands.has(key));
  const hasRecentOperand = question.operandKeys.some((key) => recentOperands.has(key));
  return !hasUsedOperand && !hasRecentOperand;
}

export function generateSkillQuestion(skillId: SkillId, difficulty: DifficultyBand, seed: string, options: GenerationOptions = {}): Question {
  const random = seededRandom(`${skillId}:${difficulty}:${seed}`);
  const templates = templatesFor(skillId, difficulty, random);
  const history = options.history ?? emptyQuestionHistory();
  for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt += 1) {
    for (const template of templates) {
      const base = buildQuestion(generateDraft(skillId, difficulty, template.id, random));
      const question: Question = { ...base, interactionMode: "multiple-choice", choices: choicesForQuestion(base, random), ...(base.choiceLabels ? { choiceLabels: base.choiceLabels } : {}) };
      if (validateQuestion(question) && !history.recentQuestionKeys.includes(question.questionKey)) return question;
    }
  }
  throw new Error(`Could not generate valid ${skillId} question`);
}

function matchingFromSamples(base: Question, random: Random): Question {
  const pairs = Array.from({ length: 3 }, (_, index) => {
    const left = index + 2;
    const right = index + 3;
    const answer = left + right;
    return { id: `pair-${index + 1}`, prompt: `${left} + ${right}`, answer, label: String(answer) };
  });
  return { ...base, interactionMode: "matching", prompt: "Match each sum to its answer.", pairs, answerBank: shuffled(pairs.map((pair) => pair.answer), random), correctAnswer: 3 };
}

function visualSelectionFromBase(base: Question, random: Random): Question {
  if (base.visual?.type === "measurement") {
    const options = shuffled(base.visual.items.map((item, index) => ({ id: `item-${index + 1}`, label: item.label, objectCount: item.size })), random);
    return { ...base, interactionMode: "visual-selection", visualOptions: options, correctOptionId: options.find((option) => option.objectCount === base.correctAnswer)!.id };
  }
  if (base.visual?.type === "graph") {
    const options = shuffled(base.visual.entries.map((entry, index) => ({ id: `entry-${index + 1}`, label: entry.label, objectCount: entry.count })), random);
    return { ...base, interactionMode: "visual-selection", visualOptions: options, correctOptionId: options.find((option) => option.objectCount === base.correctAnswer)!.id };
  }
  if (base.visual?.type === "fraction") {
    const denominatorOptions = [2, 3, 4];
    const values = shuffled(Object.entries(fractionLabels(base.correctAnswer, denominatorOptions, random)).map(([value, label]) => [Number(value), label] as const), random);
    const options = values.map(([objectCount, label], index) => ({ id: `fraction-${index + 1}`, label, objectCount }));
    return { ...base, interactionMode: "visual-selection", visualOptions: options, correctOptionId: options.find((option) => option.objectCount === base.correctAnswer)!.id };
  }
  const correct = base.correctAnswer;
  const values = shuffled([Math.max(0, correct - 1), correct, correct + 1], random);
  const labelFor = (value: number): string => base.kind === "money" ? moneyLabel(value) : String(value);
  const options = values.map((objectCount, index) => ({ id: `option-${index + 1}`, label: labelFor(objectCount), objectCount }));
  return { ...base, interactionMode: "visual-selection", visualOptions: options, correctOptionId: options.find((option) => option.objectCount === correct)!.id };
}

function sequenceFromBase(base: Question): Question {
  const numbers = base.prompt.split(",").map((part) => part.trim());
  const missingIndex = numbers.findIndex((part) => part === "?");
  const sequence = numbers.map((part, index) => index === missingIndex ? base.correctAnswer : Number(part));
  return { ...base, interactionMode: "sequence-completion", sequence, missingIndex: Math.max(0, missingIndex) };
}

function fractionColoringFromBase(base: Question, random: Random): Question {
  const denominator = base.visual?.type === "fraction" ? base.visual.denominator : pick([2, 3, 4] as const, random);
  const numerator = base.visual?.type === "fraction" ? base.visual.numerator : integer(1, denominator - 1, random);
  const model = base.visual?.type === "fraction" && base.visual.model === "chocolate-bar" ? "chocolate-bar" : pick(["rectangle", "circle", "chocolate-bar"] as const, random);
  return { ...base, interactionMode: "fraction-coloring", prompt: `Color ${fractionLabel(numerator, denominator)} of the ${model === "chocolate-bar" ? "chocolate bar" : "shape"}.`, numerator, denominator, model, correctAnswer: numerator, hint: "The bottom number tells us how many equal parts there are. The top number tells us how many parts to color." };
}

function withInteraction(base: Question, index: number, random: Random): Question {
  if (base.kind === "word-problem") return base;
  if (base.kind === "time") return { ...base, interactionMode: "multiple-choice", choices: choicesForQuestion(base, random), ...(base.choiceLabels ? { choiceLabels: base.choiceLabels } : {}) };
  if (base.kind === "fraction") return index % 2 === 0 ? fractionColoringFromBase(base, random) : visualSelectionFromBase(base, random);
  if (base.kind === "measurement" && base.templateId === "measurement-ruler") return base;
  if (base.kind === "measurement" || base.kind === "graph" || base.kind === "place-value" && base.templateId === "place-value-expanded") return visualSelectionFromBase(base, random);
  if (base.kind === "number-comparison" || base.kind === "money" && (base.templateId === "money-identify-coin" || base.templateId === "money-compare-amounts")) return { ...base, interactionMode: "multiple-choice", choices: choicesForQuestion(base, random), ...(base.choiceLabels ? { choiceLabels: base.choiceLabels } : {}) };
  if (base.kind === "money" && base.templateId === "money-exact-amount") return visualSelectionFromBase(base, random);
  if (base.kind === "skip-counting" && base.templateId === "skip-counting-missing") return sequenceFromBase(base);
  if ((base.kind === "addition" || base.kind === "number-bond") && index % 7 === 0) return matchingFromSamples(base, random);
  if (index % 6 === 0) return { ...base, interactionMode: "multiple-choice", choices: choicesForQuestion(base, random), ...(base.choiceLabels ? { choiceLabels: base.choiceLabels } : {}) };
  return base;
}

/** A stable seed makes a session replayable in tests while changing values between attempts. */
export function generateLessonQuestions(lessonId: LessonId, seed: string, options: GenerationOptions = {}): Question[] {
  const lesson = lessonById(lessonId);
  const random = seededRandom(`${lessonId}:${seed}`);
  const history = options.history ?? emptyQuestionHistory();
  const strictOptions = { maxRecentQuestions: options.maxRecentQuestions ?? DEFAULT_RECENT_QUESTIONS, maxRecentOperands: options.maxRecentOperands ?? DEFAULT_RECENT_OPERANDS };
  const usedKeys = new Set<string>();
  const usedOperands = new Set<string>();
  const questions: Question[] = [];
  for (let index = 0; index < lesson.questionCount; index += 1) {
    const skillId = lesson.skillFocus[index % lesson.skillFocus.length]!;
    const difficulty = lesson.difficultyBands[index % lesson.difficultyBands.length]!;
    const templates = templatesFor(skillId, difficulty, random);
    let selected: Question | undefined;
    for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS && !selected; attempt += 1) {
      const template = templates[attempt % templates.length] ?? templateById(templatesForSkill(skillId)[0]!.id);
      const candidate = buildQuestion(generateDraft(skillId, difficulty, template.id, random));
      if (validateQuestion(candidate) && generationAllowed(candidate, usedKeys, usedOperands, history, strictOptions)) selected = candidate;
    }
    if (!selected) {
      for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS && !selected; attempt += 1) {
        const template = templates[attempt % templates.length] ?? templateById(templatesForSkill(skillId)[0]!.id);
        const candidate = buildQuestion(generateDraft(skillId, difficulty, template.id, random));
        if (validateQuestion(candidate) && !usedKeys.has(candidate.questionKey)) selected = candidate;
      }
    }
    if (!selected) throw new Error(`Could not generate valid ${skillId} question for ${lessonId}`);
    const question = selected;
    const positioned = withInteraction(question, index, random);
    usedKeys.add(positioned.questionKey);
    positioned.operandKeys.forEach((key) => usedOperands.add(key));
    if (!validateQuestion(positioned)) throw new Error(`Generated an invalid ${positioned.interactionMode} question for ${lessonId}`);
    questions.push(positioned);
  }
  return questions;
}

export function rememberQuestions(history: QuestionHistory, questions: readonly Question[], maxQuestions = DEFAULT_RECENT_QUESTIONS, maxOperands = DEFAULT_RECENT_OPERANDS): QuestionHistory {
  return {
    recentQuestionKeys: [...history.recentQuestionKeys, ...questions.map((question) => question.questionKey)].slice(-maxQuestions),
    recentOperandKeys: [...history.recentOperandKeys, ...questions.flatMap((question) => question.operandKeys)].slice(-maxOperands),
  };
}
