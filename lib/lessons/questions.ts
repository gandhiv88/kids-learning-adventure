import { lessonById } from "./definitions";
import type { LessonId, Question, QuestionKind } from "./types";

type Random = () => number;
const seededRandom = (seed: string): Random => {
  let state = 2166136261;
  for (let index = 0; index < seed.length; index++) state = Math.imul(state ^ seed.charCodeAt(index), 16777619);
  return () => { state += 0x6d2b79f5; let value = state; value = Math.imul(value ^ (value >>> 15), value | 1); value ^= value + Math.imul(value ^ (value >>> 7), value | 61); return ((value ^ (value >>> 14)) >>> 0) / 4294967296; };
};
const pick = <T,>(values: readonly T[], random: Random): T => values[Math.floor(random() * values.length)]!;
const shuffled = <T,>(values: readonly T[], random: Random): T[] => [...values].sort(() => random() - 0.5);

function createQuestion(kind: QuestionKind, random: Random): Omit<Question, "choices"> {
  if (kind === "number-bond") { const whole = pick([8, 9, 10, 11, 12, 14, 15, 16, 18, 20], random); const part = 1 + Math.floor(random() * (whole - 1)); return { kind, prompt: `${part} + ? = ${whole}`, correctAnswer: whole - part, hint: "Think: what part completes the whole?" }; }
  if (kind === "addition") { const a = 3 + Math.floor(random() * 12); const b = 2 + Math.floor(random() * 10); return { kind, prompt: `${a} + ${b} = ?`, correctAnswer: a + b, hint: "Try making ten, then add the rest." }; }
  if (kind === "missing-addend") { const total = 10 + Math.floor(random() * 11); const part = 3 + Math.floor(random() * Math.min(10, total - 2)); return { kind, prompt: `${part} + ? = ${total}`, correctAnswer: total - part, hint: "Count up from the first number to the total." }; }
  if (kind === "subtraction") { const total = 8 + Math.floor(random() * 15); const take = 1 + Math.floor(random() * Math.min(10, total)); return { kind, prompt: `${total} − ${take} = ?`, correctAnswer: total - take, hint: "Start at the first number and count back." }; }
  const step = pick([2, 5, 10], random); const start = step * (1 + Math.floor(random() * 4)); const answer = start + step; return { kind, prompt: `${start}, ?, ${answer + step}`, correctAnswer: answer, hint: `Hop by ${step}s each time.` };
}
function choicesFor(answer: number, random: Random): number[] {
  const choices = new Set<number>([answer]);
  const offsets = shuffled([-3, -2, -1, 1, 2, 3, 4, 5], random);
  for (const offset of offsets) { if (choices.size < 4 && answer + offset >= 0) choices.add(answer + offset); }
  let fallback = 0;
  while (choices.size < 4) { if (fallback !== answer) choices.add(fallback); fallback++; }
  return shuffled([...choices], random);
}

/** A stable seed makes a session replayable in tests while changing values between attempts. */
export function generateLessonQuestions(lessonId: LessonId, seed: string): Question[] {
  const lesson = lessonById(lessonId); const random = seededRandom(`${lessonId}:${seed}`);
  const kinds = lesson.skillFocus.length === 1 ? Array(8).fill(lesson.skillFocus[0]) : Array.from({ length: 8 }, (_, index) => lesson.skillFocus[index % lesson.skillFocus.length]);
  // Two shuffled permutations keep each answer position balanced and avoid three-in-a-row.
  const positions = [...shuffled([0, 1, 2, 3], random), ...shuffled([0, 1, 2, 3], random)];
  return kinds.map((kind, index) => {
    const base = createQuestion(kind, random); const remaining = choicesFor(base.correctAnswer, random).filter((choice) => choice !== base.correctAnswer);
    remaining.splice(positions[index], 0, base.correctAnswer);
    return { ...base, choices: remaining };
  });
}
