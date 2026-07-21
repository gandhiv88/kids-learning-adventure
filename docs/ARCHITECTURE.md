# Architecture

This document describes the actual repository as of Milestone 2 and separates implemented behavior from planned architecture.

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

Each lesson belongs to `number-forest`, has eight questions, and declares one or more `skillFocus` values.

## Question Generation

Current Number Forest generation lives in `lib/lessons/questions.ts`.

Generation is deterministic for a `(lessonId, seed)` pair. It uses a local seeded random function derived from the seed string and lesson id. Each generated question includes:

* `kind`.
* `prompt`.
* Four numeric choices.
* One `correctAnswer`.
* A short `hint`.

Current generated kinds are number bond, addition, missing addend, subtraction, and skip counting. Subtraction generation avoids negative answers. The forest challenge cycles through its skill focuses.

Correct-answer positions are balanced across each eight-question lesson by combining two shuffled permutations of positions 0 through 3. Tests assert that all four positions are used and that long same-position runs are avoided.

The repository also contains older Milestone 1 fixed-template generation in `lib/learning/questions.ts`. That module is no longer used by the active page but remains covered by tests.

## Scoring

In the active Number Forest flow, a lesson score is the number of correct first selections in an eight-question lesson. After a choice is selected, the current UI disables the answer choices and shows the next button. Incorrect answers reveal the correct answer and provide a hint; they do not allow retry within the same question.

Session stars and cumulative adventure stars are distinct:

* Session score is the score for the just-finished lesson attempt.
* Cumulative adventure stars are stored in progress and only increase when a lesson best score improves.

`lib/lessons/progress.ts` caps scores to the eight-question lesson maximum.

## Persistence And Migration

Current Number Forest persistence uses `lib/lessons/storage.ts` with the key `number-forest-progress`. The saved shape is version 3:

* `version`.
* `selectedCharacter`.
* `totalAdventureStars`.
* `lessonProgress`, keyed by lesson id.

Each lesson progress record stores:

* `bestScore`.
* `completed`.

`migrateProgress` in `lib/lessons/progress.ts` normalizes malformed values, clamps scores, preserves valid companions, preserves non-negative total stars, and maps legacy Milestone 1 best score fields into `number-bonds-1` when no `lessonProgress` exists.

Older Milestone 1 persistence remains in `lib/persistence/progress.ts` using key `kids-learning-adventure.progress.v1` and a version 2 shape. It is not used by the active route.

## Adventure Map And Unlocking

Unlocking logic lives in `lib/lessons/progress.ts`.

The first lesson is always unlocked. Completing a lesson unlocks the next lesson. Completion is recorded even when the first-attempt score is low, including zero. Replaying a lesson cannot relock later lessons or reduce prior best scores.

The recommended lesson is the first unlocked incomplete lesson. After all lessons are complete, the recommended lesson is the final lesson.

## Testing Strategy

Current tests focus on deterministic learning logic rather than browser rendering:

* `tests/lessons.test.ts` covers Milestone 2 lesson definitions, unlocking, best-score star behavior, migration, and generated question validity.
* `tests/question-generation.test.ts` covers retained Milestone 1 deterministic generation and answer validation.
* `tests/progress.test.ts` covers retained Milestone 1 best-score persistence logic and migration.
* `tests/scoring.test.ts` covers retained Milestone 1 scoring behavior.
* `tests/companion.test.ts` covers retained Milestone 1 companion state behavior.

Required validation commands are `npm run lint`, `npm run typecheck`, `npm run test`, and `npm run build`.

## Planned Future Architecture

Future work should move toward clearer separation:

* A deterministic local curriculum engine for skill definitions, prerequisites, question generation, repeat protection, and validation.
* A teaching and mastery engine for worked examples, guided practice, hints, mastery checks, and adaptive recommendations.
* An optional server-side OpenAI enhancement layer for content enrichment after local systems are proven.
* Server-side validation and storage if API-generated content or remote persistence is introduced.

Client-side code must not contain API keys or secrets. External APIs, databases, and major dependencies require explicit milestone scope.
