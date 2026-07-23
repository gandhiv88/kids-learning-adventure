# Decisions

This is a chronological product and architecture decision log. Dates use the repository commit dates where available.

## 2026-07-21 - Active Companion Only

Status: Accepted.

Context: Milestone 1 introduced character choice, and later refinement clarified that the app has one local learner profile.

Decision: Character selection changes only the active companion and never resets or separates progress.

Consequences: Progress storage keeps one selected companion value. Changing companions must preserve lesson progress, best scores, and cumulative stars.

## 2026-07-21 - Balanced Answer Positions

Status: Accepted.

Context: Early fixed choice ordering made correct answers too predictable.

Decision: Correct-answer positions are balanced and must not be predictable.

Consequences: Generated sessions use deterministic seeded shuffling. Tests assert balanced positions and avoid long same-position runs.

## 2026-07-21 - Session Stars And Adventure Stars

Status: Accepted.

Context: The app needs immediate lesson feedback while preserving long-term earned progress.

Decision: Session stars and cumulative adventure stars are distinct.

Consequences: Results can show both the current attempt score and the saved adventure-star total.

## 2026-07-21 - Best-Score Star Growth

Status: Accepted.

Context: Replays should encourage practice without allowing unlimited star farming or reducing earned progress.

Decision: Cumulative adventure stars increase only when a lesson best score improves.

Consequences: Lower or equal replays add zero cumulative stars. Improved replays add only the difference between old best and new best.

## 2026-07-21 - Completion Unlocks Next Lesson

Status: Accepted.

Context: The child should be able to keep moving through the early path without being blocked by a single low first-attempt score.

Decision: Lesson completion unlocks the next lesson even when the first-attempt star score is low.

Consequences: The current unlocking model is completion-based, not mastery-based. Mastery-based promotion is planned later.

## 2026-07-21 - Local Procedural Questions

Status: Accepted.

Context: The MVP must work locally without accounts, APIs, or databases.

Decision: Core questions are procedurally generated locally.

Consequences: Arithmetic generation, validation, and tests live in the repository. No OpenAI API is needed for current core sessions.

## 2026-07-21 - Recent Repeat Protection

Status: Accepted and implemented in Milestone 3A.

Context: Procedural sessions need variety without permanently banning useful review.

Decision: Exact recent questions should be avoided while allowing later spaced repetition.

Consequences: Progress stores capped `questionHistory` with recent question keys and operand keys. The local generator avoids exact repeats and recent operands where practical, then lets older material return after the history window rolls off.

## 2026-07-21 - Local Curriculum Templates

Status: Accepted.

Context: Fixed question lists do not provide enough variety for repeated local practice.

Decision: Skills use reusable procedural templates with deterministic seeded generation, difficulty metadata, and validation.

Consequences: Milestone 3A supports number bonds, addition, subtraction, missing addends, skip counting, place value, comparison, clocks, fractions, and word problems without external APIs.

## 2026-07-21 - Prerequisite Metadata Before Adaptation

Status: Accepted.

Context: Future teaching and adaptive progression need to know conceptual dependencies, but Milestone 3A must not implement adaptive promotion.

Decision: Skill definitions include prerequisites now, while progression remains the Milestone 2 completion-based lesson map.

Consequences: Later milestones can consume prerequisite metadata for teaching mode and mastery progression without changing the question model again.

## 2026-07-21 - Skill-Based Mastery

Status: Accepted for future implementation.

Context: A single global ability label would be misleading and unhelpful for parent support.

Decision: Learning mastery is tracked per skill, not as a general "smartness" score.

Consequences: Future progress models should record skill-level evidence. Parent-facing language should describe skills, not fixed ability.

## 2026-07-21 - Teach Before Assessing

Status: Accepted for future implementation.

Context: New concepts should not appear as cold assessments.

Decision: New concepts require teaching and guided practice before independent assessment.

Consequences: Milestone 3B should introduce worked examples, guided practice, hints, and mastery checks before promotion.

## 2026-07-21 - Defer OpenAI API

Status: Accepted.

Context: The local curriculum and adaptation systems should be proven before introducing cost, network dependency, secrets, or server concerns.

Decision: The OpenAI API is postponed until the local curriculum and adaptation systems are proven.

Consequences: Current and Milestone 3A core arithmetic remains local and deterministic.

## 2026-07-21 - Optional Future OpenAI Uses

Status: Accepted for future implementation.

Context: AI can help enrich the experience, but live generation of every arithmetic question would complicate validation and reliability.

Decision: Future OpenAI use should focus on optional stories, teaching explanations, parent summaries, worksheets, and periodic content enhancement, not live generation of every arithmetic question.

Consequences: Any future AI layer should be server-side, optional, validated, and outside the deterministic local core.

## 2026-07-21 - Multi-Digit Arithmetic Prerequisites

Status: Accepted for future implementation.

Context: Larger arithmetic should follow conceptual readiness, not milestone number.

Decision: Three- and four-digit arithmetic unlock through prerequisite mastery.

Consequences: Milestone 3A must not add three- or four-digit arithmetic. Later implementation should require place value, regrouping, and estimation prerequisites.

## 2026-07-21 - Grouped Real-World Lessons

Status: Accepted and implemented in Milestone 3B.

Context: The app needs to expand from arithmetic practice into practical math without building a large world-map system yet.

Decision: Lessons are organized into data-defined groups: Number Forest, Market Town, Clock Tower, Fraction Kitchen, Measurement Meadow, and Graph Garden.

Consequences: The active UI can show grouped lessons now, and future world-map work can consume lesson groups without moving lesson logic into React components.

## 2026-07-21 - Configurable Currency Model

Status: Accepted and implemented in Milestone 3B.

Context: Money lessons initially ship with US currency, but future currencies should not require rewriting the learning engine.

Decision: Money generation depends on a currency configuration with code, symbols, minor-unit conversion, and denominations.

Consequences: Future India, UK, Europe, or other currency support should be implemented as configuration unless a new visual or interaction mode is required.
