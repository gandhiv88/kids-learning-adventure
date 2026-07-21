# Architecture

This document describes the actual repository as of Milestone 3A and separates implemented behavior from planned architecture.

## Current Stack

The app uses:

* Next.js App Router.
* React client components.
* TypeScript with strict checking.
* Tailwind CSS v4 import plus custom CSS in `app/globals.css`.
* Vitest for domain logic tests.
* Browser `localStorage` for local-first progress.

The active route is `app/page.tsx`. It is a client component because it reads browser storage and manages the lesson flow in local state.

## Current UI

`app/page.tsx` currently renders the full Number Forest experience:

* Welcome screen.
* Companion selection.
* Number Forest map.
* Lesson screen.
* Results screen.

The app has three current companions: `moss`, `luna`, and `ember`. They are selectable display companions attached to the one local learner profile. Changing the selected companion updates `selectedCharacter` in saved progress and does not reset lesson progress or stars.

There are retained Milestone 1 UI modules in `components/adventure/*` and `components/characters/CharacterArt.tsx`. They are still present and tested indirectly through Milestone 1 logic, but they are not imported by the active `app/page.tsx` route.

## Lesson Definitions

Current lesson definitions live in `lib/lessons/definitions.ts`.

There are six ordered Number Forest lessons:

1. `number-bonds-1`.
2. `addition-1`.
3. `missing-addends-1`.
4. `subtraction-1`.
5. `skip-counting-1`.
6. `forest-challenge-1`.

Each lesson belongs to `number-forest`, has ten questions, declares one or more `skillFocus` values, and declares supported difficulty bands. The deterministic session composer enforces six number-entry questions, then one multiple-choice, matching, visual-selection, and fraction-coloring activity.

## Curriculum Engine

Curriculum metadata lives in `lib/lessons/curriculum.ts`.

It defines:

* `SkillDefinition` records for number bonds, addition, subtraction, missing addends, skip counting, place value, number comparison, clock reading, fractions, and word problems.
* `QuestionTemplate` records with reusable template IDs and estimated variety.
* Prerequisite metadata for later teaching and adaptive milestones.
* `review`, `core`, and `challenge` difficulty bands.

Question generation lives in `lib/lessons/questions.ts`.

Generation is deterministic for a `(lessonId, seed, history)` input. It uses a local seeded random function derived from the seed string and lesson id. Each generated question includes:

* Stable id and question key.
* `kind`.
* `templateId`.
* `difficulty`.
* `prompt`.
* Explicit interaction data for number entry, multiple choice, matching, visual selection, or fraction coloring.
* Optional display labels for choices such as clock times, comparison symbols, and fractions.
* One `correctAnswer`.
* A short `hint`.
* Operand keys for repeat protection.

Generated kinds include number bond, addition, subtraction, missing addend, skip counting, place value, number comparison, clock reading, fraction, and word problem. Subtraction generation avoids negative answers. The forest challenge cycles through its skill focuses and now includes place value, comparison, and word-problem review.

The session composer intentionally fixes the interaction distribution rather than balancing answer positions across every question: number entry is the default, and the sole multiple-choice activity is never adjacent to another multiple-choice activity.

Every generated question is validated before it is returned. Validation checks prompt and hint presence, mode-specific choice, pair, visual, and fraction data, non-negative subtraction, valid clock answers, valid fraction answers, and absence of multiplication or division symbols.

Recent-question tracking is framework-independent. `QuestionHistory` stores recent question keys and operand keys. The generator avoids exact recent repeats and recent operand patterns where practical, then falls back only as needed so lessons remain generatable. History is capped so older material can return for spaced review.

The repository also contains older Milestone 1 fixed-template generation in `lib/learning/questions.ts`. That module is no longer used by the active page but remains covered by tests.

## Scoring

In the active Number Forest flow, a lesson score is the number of correct first submitted answers in a ten-question lesson. All modes use the same framework-independent evaluation helpers. Incorrect submissions give a hint and permit a retry without a star; answers are not revealed after the first error.

Session stars and cumulative adventure stars are distinct:

* Session score is the score for the just-finished lesson attempt.
* Cumulative adventure stars are stored in progress and only increase when a lesson best score improves.

`lib/lessons/progress.ts` caps scores to the eight-question lesson maximum.

## Persistence And Migration

Current Number Forest persistence uses `lib/lessons/storage.ts` with the key `number-forest-progress`. The saved shape is version 4:

* `version`.
* `selectedCharacter`.
* `totalAdventureStars`.
* `lessonProgress`, keyed by lesson id.
* `questionHistory`.

Each lesson progress record stores:

* `bestScore`.
* `completed`.

`migrateProgress` in `lib/lessons/progress.ts` normalizes malformed values, clamps scores, preserves valid companions, preserves non-negative total stars, preserves valid recent-question history, and maps legacy Milestone 1 best score fields into `number-bonds-1` when no `lessonProgress` exists.

Older Milestone 1 persistence remains in `lib/persistence/progress.ts` using key `kids-learning-adventure.progress.v1` and a version 2 shape. It is not used by the active route.

## Adventure Map And Unlocking

Unlocking logic lives in `lib/lessons/progress.ts`.

The first lesson is always unlocked. Completing a lesson unlocks the next lesson. Completion is recorded even when the first-attempt score is low, including zero. Replaying a lesson cannot relock later lessons or reduce prior best scores.

The recommended lesson is the first unlocked incomplete lesson. After all lessons are complete, the recommended lesson is the final lesson.

## Testing Strategy

Current tests focus on deterministic learning logic rather than browser rendering:

* `tests/lessons.test.ts` covers lesson definitions, unlocking, best-score star behavior, migration, generated question validity, and recent-repeat avoidance in lessons.
* `tests/curriculum-engine.test.ts` covers Milestone 3A skill definitions, prerequisites, deterministic generation, variation, validation, difficulty bands, clocks, fractions, repeat history, and no multiplication/division.
* `tests/question-generation.test.ts` covers retained Milestone 1 deterministic generation and answer validation.
* `tests/progress.test.ts` covers retained Milestone 1 best-score persistence logic and migration.
* `tests/scoring.test.ts` covers retained Milestone 1 scoring behavior.
* `tests/companion.test.ts` covers retained Milestone 1 companion state behavior.

Required validation commands are `npm run lint`, `npm run typecheck`, `npm run test`, and `npm run build`.

## Planned Future Architecture

Future work should move toward:

* A teaching and mastery engine for worked examples, guided practice, hints, mastery checks, and adaptive recommendations.
* An optional server-side OpenAI enhancement layer for content enrichment after local systems are proven.
* Server-side validation and storage if API-generated content or remote persistence is introduced.

Client-side code must not contain API keys or secrets. External APIs, databases, and major dependencies require explicit milestone scope.
