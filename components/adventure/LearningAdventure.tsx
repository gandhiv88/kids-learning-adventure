"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CharacterArt, characterName } from "@/components/characters/CharacterArt";
import { QuestionVisual } from "@/components/adventure/QuestionVisual";
import { createSessionResult, generateSessionQuestions, getCompanionState, isCorrectAnswer, recordAttempt } from "@/lib/learning";
import { commitLessonResult, loadProgress, MILESTONE_ONE_LESSON_ID, saveCharacter } from "@/lib/persistence";
import type { CharacterId, SavedProgress, SessionResult } from "@/types";

type Screen = "welcome" | "choose" | "session" | "results";
type Feedback = "idle" | "correct" | "retry";
type Completion = { addedStars: number; bestScore: number; isNewBest: boolean };
const characterIds: readonly CharacterId[] = ["unicorn", "robot", "dragon"];
const encouragements: Record<CharacterId, { correct: readonly string[]; retry: readonly string[]; result: readonly string[] }> = {
  unicorn: { correct: ["Sparkly work!", "You found it!", "That was brilliant!"], retry: ["Almost! Try another one.", "Keep looking—you can do it!", "A brave try. Pick again!"], result: ["Your adventure shines bright!", "What a sparkling session!", "You kept going—amazing!"] },
  robot: { correct: ["Beep! Correct!", "Great thinking!", "You solved it!"], retry: ["Try a new answer!", "Good try. Scan again!", "Keep going—you've got this!"], result: ["Mission complete!", "Your math power is growing!", "Excellent exploring, friend!"] },
  dragon: { correct: ["Roar! You got it!", "Dragon-level thinking!", "That was fiery smart!"], retry: ["A gentle retry!", "Look closely and try again.", "Keep your brave dragon brain going!"], result: ["A mighty math adventure!", "You soared through the session!", "Your dragon brain did great!"] },
};

export function LearningAdventure() {
  const [sessionSeed, setSessionSeed] = useState(1);
  const questions = useMemo(() => generateSessionQuestions(sessionSeed), [sessionSeed]);
  const [screen, setScreen] = useState<Screen>("welcome");
  const [saved, setSaved] = useState<SavedProgress | null>(null);
  const [character, setCharacter] = useState<CharacterId>("unicorn");
  const [index, setIndex] = useState(0);
  const [result, setResult] = useState<SessionResult>(createSessionResult);
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState<Feedback>("idle");
  const [disabledChoices, setDisabledChoices] = useState<readonly number[]>([]);
  const [messageIndex, setMessageIndex] = useState(0);
  const [completion, setCompletion] = useState<Completion | null>(null);
  const sessionNumber = useRef(0);
  const sessionToken = useRef("");
  const committedSessionId = useRef<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => { const progress = loadProgress(); if (progress) { setSaved(progress); setCharacter(progress.selectedCharacter); } }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const question = questions[index];
  const companion = getCompanionState(index, feedback);
  const message = feedback === "idle" ? "Choose your answer." : encouragements[character][feedback][messageIndex % encouragements[character][feedback].length];

  function beginSession() {
    const progress = saveCharacter(character);
    sessionNumber.current += 1;
    sessionToken.current = window.crypto.randomUUID();
    committedSessionId.current = null;
    setSaved(progress); setIndex(0); setResult(createSessionResult()); setAttempts(0); setFeedback("idle"); setDisabledChoices([]); setCompletion(null); setSessionSeed((seed) => seed + 1); setScreen("session");
  }

  function selectAnswer(answer: number) {
    if (feedback === "correct") return;
    const nextAttempts = attempts + 1;
    const correct = isCorrectAnswer(question, answer);
    setAttempts(nextAttempts); setMessageIndex((value) => value + 1);
    if (correct) { setResult((current) => recordAttempt(current, nextAttempts, true)); setFeedback("correct"); }
    else { setResult((current) => recordAttempt(current, nextAttempts, false)); setDisabledChoices((values) => [...values, answer]); setFeedback("retry"); }
  }

  function finishSession() {
    const id = `milestone-1-${sessionToken.current}-${sessionNumber.current}`;
    if (committedSessionId.current === id) return;
    committedSessionId.current = id;
    const committed = commitLessonResult(character, MILESTONE_ONE_LESSON_ID, id, result.starsEarned);
    setSaved(committed.progress);
    setCompletion({ addedStars: committed.addedStars, bestScore: committed.bestScore, isNewBest: committed.isNewBest });
    setScreen("results");
  }

  function nextQuestion() {
    if (index === questions.length - 1) { finishSession(); return; }
    setIndex((value) => value + 1); setAttempts(0); setFeedback("idle"); setDisabledChoices([]);
  }

  if (screen === "welcome") return <main className="adventure-shell welcome"><div className="hero-companions" aria-hidden="true">{characterIds.map((id) => <CharacterArt key={id} character={id} size="small" />)}</div><p className="eyebrow">Math Adventure</p><h1>Ready for a little math magic?</h1><p className="lead">Choose a companion and solve eight playful puzzles.</p>{saved && <p className="saved-stars">⭐ {saved.totalAdventureStars} adventure stars</p>}<button className="primary-button" onClick={() => setScreen("choose")}>Let&apos;s play <span aria-hidden="true">→</span></button></main>;
  if (screen === "choose") return <main className="adventure-shell"><p className="eyebrow">Choose a companion</p><h1>Who will explore with you?</h1><div className="character-grid" role="radiogroup" aria-label="Choose your adventure companion">{characterIds.map((id) => <button className={`character-choice ${character === id ? "selected" : ""}`} key={id} role="radio" aria-checked={character === id} onClick={() => setCharacter(id)}><CharacterArt character={id}/><span>{characterName(id)}</span></button>)}</div><button className="primary-button" onClick={beginSession}>Start adventure <span aria-hidden="true">→</span></button><button className="text-button" onClick={() => setScreen("welcome")}>Back</button></main>;
  if (screen === "results") return <main className="adventure-shell results"><CharacterArt character={character} pose="cheering"/><p className="eyebrow">Adventure complete</p><h1>{encouragements[character].result[result.starsEarned % encouragements[character].result.length]}</h1><div className="result-stars" aria-label={`${result.starsEarned} stars earned out of 8`}>{Array.from({ length: 8 }, (_, value) => <span className={value < result.starsEarned ? "earned" : "empty"} style={{ animationDelay: `${value * 100}ms` }} key={value}>★</span>)}</div><p className="lead">You earned <strong>{result.starsEarned} of 8 stars</strong> on first tries.</p>{completion?.isNewBest ? <p className="result-note new-best">New best score! You added {completion.addedStars} adventure {completion.addedStars === 1 ? "star" : "stars"}.</p> : <p className="result-note">Great practice! Your best score is still {completion?.bestScore ?? 0}.</p>}<p className="saved-stars">⭐ Adventure stars: {saved?.totalAdventureStars ?? 0}</p><button className="primary-button" onClick={() => setScreen("choose")}>Continue adventure <span aria-hidden="true">→</span></button><button className="text-button" onClick={beginSession}>Play this lesson again</button></main>;
  const progress = ((index + (feedback === "correct" ? 1 : 0)) / questions.length) * 100;
  return <main className="adventure-shell session"><header className="session-header"><button className="back-icon" aria-label="Leave session and choose another companion" onClick={() => setScreen("choose")}>×</button><div className="progress-wrap"><div className="progress-label">Question {index + 1} of 8</div><div className="progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={8} aria-valuenow={index + (feedback === "correct" ? 1 : 0)} aria-label="Session progress"><span style={{ width: `${progress}%` }}/></div></div><div className="session-stars" aria-label={`${result.starsEarned} stars earned`}>★ {result.starsEarned}</div></header><section className="question-area"><aside className={`companion ${companion.placement}`}><CharacterArt character={character} pose={companion.pose} size="small"/><span>{characterName(character)}</span></aside><p className="skill-label">{question.kind.replaceAll("-", " ")}</p><h1>{question.prompt}</h1><QuestionVisual question={question}/><div className={`feedback ${feedback}`} aria-live="polite" aria-atomic="true">{feedback !== "idle" && <><span aria-hidden="true">{feedback === "correct" ? "★" : "↻"}</span> {message}</>}</div><div className="answer-grid">{question.choices.map((answer) => <button key={answer} className={`answer-button ${feedback === "correct" && answer === question.correctAnswer ? "correct" : ""} ${disabledChoices.includes(answer) ? "incorrect" : ""}`} disabled={disabledChoices.includes(answer) || feedback === "correct"} onClick={() => selectAnswer(answer)}>{answer}<span className="answer-status" aria-hidden="true">{feedback === "correct" && answer === question.correctAnswer ? "✓" : disabledChoices.includes(answer) ? "×" : ""}</span></button>)}</div>{feedback === "correct" && <button className="primary-button next-button" onClick={nextQuestion}>{index === questions.length - 1 ? "See my results" : "Next question"} <span aria-hidden="true">→</span></button>}</section></main>;
}
