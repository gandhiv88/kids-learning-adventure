import { QUESTION_TEMPLATES, templatesForSkill } from "./curriculum";
import { lessonById } from "./definitions";
import type { DifficultyBand, LessonId, Question, QuestionBase, QuestionHistory, QuestionTemplate, QuestionTemplateId, SkillId } from "./types";

type Random = () => number;
type DraftQuestion = Omit<QuestionBase, "id" | "questionKey" | "operandKeys"> & { choiceLabels?: Readonly<Record<number, string>>; operandKeys?: readonly string[] };
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
  if (templateId === "place-value-expanded") return { kind: "place-value", templateId, difficulty, prompt: `${tens} tens and ${ones} ones make ?`, correctAnswer: value, hint: "Tens count by 10. Ones count by 1.", operandKeys: [operandKey("place-value", [tens, ones])] };
  const askTens = random() < 0.5;
  return { kind: "place-value", templateId, difficulty, prompt: `In ${value}, what is the ${askTens ? "tens" : "ones"} digit?`, correctAnswer: askTens ? tens : ones, hint: "Look at the place where the digit sits.", operandKeys: [operandKey("place-value", [value, askTens ? "tens" : "ones"])] };
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

function generateClock(templateId: QuestionTemplateId, difficulty: DifficultyBand, random: Random): DraftQuestion {
  const minuteOptions = difficulty === "review" ? [0] : difficulty === "core" ? [0, 30] : [0, 15, 30, 45];
  const hour = integer(1, 12, random);
  const minute = pick(minuteOptions, random);
  if (templateId === "clock-elapsed") {
    const nextMinute = (minute + 30) % 60;
    const nextHour = minute + 30 >= 60 ? (hour % 12) + 1 : hour;
    return { kind: "clock-reading", templateId, difficulty, prompt: `It is ${timeLabel(timeAnswer(hour, minute))}. What time is 30 minutes later?`, correctAnswer: timeAnswer(nextHour, nextMinute), choiceLabels: clockLabels(timeAnswer(nextHour, nextMinute), random), hint: "Half an hour is 30 minutes.", operandKeys: [operandKey("clock-reading", [hour, minute, "plus30"])] };
  }
  const answer = timeAnswer(hour, minute);
  return { kind: "clock-reading", templateId, difficulty, prompt: `What time does the clock show? ${clockFace(hour, minute)}`, correctAnswer: answer, choiceLabels: clockLabels(answer, random), hint: minute === 0 ? "The minute hand points to 12 for a whole hour." : "Use the minute hand first, then the hour hand.", operandKeys: [operandKey("clock-reading", [hour, minute])] };
}

function clockLabels(answer: number, random: Random): Readonly<Record<number, string>> {
  const hour = Math.floor(answer / 60);
  const candidates = [answer, timeAnswer(hour, 0), timeAnswer(hour, 15), timeAnswer(hour, 30), timeAnswer(hour, 45), timeAnswer((hour % 12) + 1, answer % 60)];
  const choices = answerChoices(answer, random, { min: 60, max: 765, candidates });
  return Object.fromEntries(choices.map((choice) => [choice, timeLabel(choice)]));
}

function clockFace(hour: number, minute: number): string {
  const names: Record<number, string> = { 0: "minute hand at 12", 15: "minute hand at 3", 30: "minute hand at 6", 45: "minute hand at 9" };
  return `(${names[minute] ?? "minute hand on the clock"}, hour hand near ${hour})`;
}

function generateFraction(templateId: QuestionTemplateId, difficulty: DifficultyBand, random: Random): DraftQuestion {
  const denominators = difficulty === "review" ? [2] : difficulty === "core" ? [2, 4] : [2, 3, 4];
  const denominator = pick(denominators, random);
  const numerator = integer(1, denominator - 1, random);
  if (templateId === "fraction-compare") {
    const otherNumerator = integer(1, denominator - 1, random);
    const answer = numerator === otherNumerator ? 1 : numerator > otherNumerator ? 2 : 0;
    return { kind: "fraction", templateId, difficulty, prompt: `Compare ${fractionLabel(numerator, denominator)} and ${fractionLabel(otherNumerator, denominator)}.`, correctAnswer: answer, choiceLabels: { 0: "<", 1: "=", 2: ">", 3: "not sure" }, hint: "Same-sized parts are easier to compare.", operandKeys: [operandKey("fraction", [numerator, denominator, otherNumerator])] };
  }
  const answer = encodeAnswer(numerator, denominator);
  const labels = fractionLabels(answer, denominators, random);
  const shape = pick(["circle", "rectangle", "square", "hexagon", "garden bed", "paper strip"], random);
  return { kind: "fraction", templateId, difficulty, prompt: `A ${shape} has ${denominator} equal parts and ${numerator} shaded. What fraction is shaded?`, correctAnswer: answer, choiceLabels: labels, hint: "The bottom number is all equal parts. The top number is shaded parts.", operandKeys: [operandKey("fraction", [numerator, denominator, shape])] };
}

function fractionLabels(answer: number, denominators: readonly number[], random: Random): Readonly<Record<number, string>> {
  const candidates = denominators.flatMap((denominator) => Array.from({ length: denominator - 1 }, (_, index) => encodeAnswer(index + 1, denominator)));
  const choices = answerChoices(answer, random, { min: 102, max: 904, candidates });
  return Object.fromEntries(choices.map((choice) => [choice, fractionLabel(Math.floor(choice / 100), choice % 100)]));
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
  if (skillId === "clock-reading") return generateClock(templateId, difficulty, random);
  if (skillId === "fraction") return generateFraction(templateId, difficulty, random);
  return generateWordProblem(templateId, difficulty, random);
}

function choicesForQuestion(draft: DraftQuestion, random: Random): number[] {
  if (draft.choiceLabels) return shuffled(Object.keys(draft.choiceLabels).map(Number), random).slice(0, 4);
  return answerChoices(draft.correctAnswer, random, { min: 0, max: 200 });
}

export function validateQuestion(question: Question): boolean {
  if (!question.id || !question.prompt.trim() || !question.hint.trim()) return false;
  if (question.prompt.includes("×") || question.prompt.includes("÷")) return false;
  if (question.kind === "subtraction" && question.correctAnswer < 0) return false;
  if (question.kind === "clock-reading" && (question.correctAnswer < 60 || question.correctAnswer > 12 * 60 + 45 || question.correctAnswer % 15 !== 0)) return false;
  if (question.interactionMode === "multiple-choice") {
    if (question.choices.length !== 4 || new Set(question.choices).size !== 4 || question.choices.filter((choice) => choice === question.correctAnswer).length !== 1) return false;
    if (question.choiceLabels && question.choices.some((choice) => !question.choiceLabels?.[choice])) return false;
  }
  if (question.interactionMode === "matching" && (question.pairs.length < 3 || question.pairs.length > 4 || new Set(question.answerBank).size !== question.answerBank.length || !question.pairs.every((pair) => question.answerBank.includes(pair.answer)))) return false;
  if (question.interactionMode === "visual-selection" && (!question.visualOptions.some((option) => option.id === question.correctOptionId) || question.visualOptions.length < 3)) return false;
  if (question.interactionMode === "fraction-coloring" && (question.denominator < 2 || question.denominator > 4 || question.numerator < 1 || question.numerator >= question.denominator)) return false;
  return true;
}

function buildQuestion(draft: DraftQuestion): Question {
  const questionKey = `${draft.kind}:${draft.templateId}:${draft.difficulty}:${draft.prompt}:${draft.correctAnswer}`;
  return { ...draft, id: questionKey, questionKey, operandKeys: draft.operandKeys ?? [questionKey], interactionMode: "number-entry" };
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

function withInteraction(base: Question, mode: number, random: Random): Question {
  if (mode < 6) return base;
  if (mode === 6) return { ...base, interactionMode: "multiple-choice", choices: choicesForQuestion(base, random), ...(base.choiceLabels ? { choiceLabels: base.choiceLabels } : {}) };
  if (mode === 7) {
    const pairs = Array.from({ length: 3 }, (_, index) => ({ id: `pair-${index + 1}`, prompt: `${index + 2} + ${index + 3}`, answer: index + 5, label: String(index + 5) }));
    return { ...base, interactionMode: "matching", prompt: "Match each sum to its answer.", pairs, answerBank: shuffled(pairs.map((pair) => pair.answer), random), correctAnswer: 3 };
  }
  if (mode === 8) {
    const count = Math.max(3, Math.min(12, base.correctAnswer));
    const options = shuffled([count - 1, count, count + 1].map((objectCount, index) => ({ id: `group-${index + 1}`, label: `A group of ${objectCount} acorns`, objectCount })), random);
    return { ...base, interactionMode: "visual-selection", prompt: `Choose the group with ${count} acorns.`, visualOptions: options, correctOptionId: options.find((option) => option.objectCount === count)!.id, correctAnswer: count };
  }
  const denominator = pick([2, 3, 4] as const, random); const numerator = integer(1, denominator - 1, random);
  return { ...base, kind: "fraction", templateId: "fraction-shaded", interactionMode: "fraction-coloring", prompt: `Color ${numerator}/${denominator} of the shape.`, numerator, denominator, model: pick(["rectangle", "circle", "chocolate-bar"] as const, random), correctAnswer: numerator, hint: "The bottom number tells us how many equal parts there are. The top number tells us how many parts to color." };
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
