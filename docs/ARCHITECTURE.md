# Architecture

This document describes the actual repository as of Milestone 3B and separates implemented behavior from planned architecture.

## Current Stack

The app uses:

* Next.js App Router.
* React client components.
* TypeScript with strict checking.
* Tailwind CSS v4 import plus custom CSS in `app/globals.css`.
* Vitest for domain logic tests.
* Playwright for browser e2e tests.
* Browser `localStorage` for local-first progress.

The active route is `app/page.tsx`. It is a client component because it reads browser storage and manages the lesson flow in local state.

## Current UI

`app/page.tsx` currently renders the full local math adventure experience:

* Welcome screen.
* Companion selection.
* Grouped lesson map.
* Lesson screen.
* Results screen.

The app has three current companions: `moss`, `luna`, and `ember`. They are selectable display companions attached to the one local learner profile. Changing the selected companion updates `selectedCharacter` in saved progress and does not reset lesson progress or stars.

There are retained Milestone 1 UI modules in `components/adventure/*` and `components/characters/CharacterArt.tsx`. They are still present and tested indirectly through Milestone 1 logic, but they are not imported by the active `app/page.tsx` route.

## Lesson Definitions And Groups

Current lesson definitions live in `lib/lessons/definitions.ts`.

There are six registered lesson groups:

* `number-forest`.
* `market-town`.
* `clock-tower`.
* `fraction-kitchen`.
* `measurement-meadow`.
* `graph-garden`.

The grouped map is not a full world map yet. It is a data shape that future world navigation can consume.

There are thirteen ordered lessons:

1. `number-bonds-1`.
2. `addition-1`.
3. `missing-addends-1`.
4. `subtraction-1`.
5. `skip-counting-1`.
6. `forest-challenge-1`.
7. `money-1`.
8. `time-1`.
9. `fractions-1`.
10. `measurement-1`.
11. `graphs-1`.
12. `place-value-1`.
13. `word-problems-1`.

Each lesson belongs to a group, has ten questions, declares one or more `skillFocus` values, and declares supported difficulty bands. The deterministic session composer chooses an appropriate interaction from the lesson skill/template instead of hardcoding lesson logic in React.

## Curriculum Engine

Curriculum metadata lives in `lib/lessons/curriculum.ts`.

It defines:

* `SkillDefinition` records for number bonds, addition, subtraction, missing addends, skip counting, place value, number comparison, money, time, fractions, measurement, graphs, and word problems.
* `QuestionTemplate` records with reusable template IDs and estimated variety.
* Prerequisite metadata for later teaching and adaptive milestones.
* `review`, `core`, and `challenge` difficulty bands.
* Declared interaction modes for each skill.

Question generation lives in `lib/lessons/questions.ts`.

Generation is deterministic for a `(lessonId, seed, history)` input. It uses a local seeded random function derived from the seed string and lesson id. Each generated question includes:

* Stable id and question key.
* `kind`.
* `templateId`.
* `difficulty`.
* `prompt`.
* Explicit interaction data for number entry, multiple choice, matching, visual selection, sequence completion, or fraction coloring.
* Optional display labels for choices such as money amounts, clock times, comparison symbols, and fractions.
* Optional structured visuals for coins, clocks, fraction models, measurement pictures, graphs, and base-ten blocks.
* One `correctAnswer`.
* A short `hint`.
* An `explanation`.
* Context-aware companion encouragement messages.
* Operand keys for repeat protection.

Generated kinds include number bond, addition, subtraction, missing addend, skip counting, place value, number comparison, money, time, fraction, measurement, graph, and word problem. Subtraction generation avoids negative answers. The forest challenge cycles through its skill focuses and includes place value, comparison, and word-problem review.

The money generator uses a currency configuration with a currency code, symbols, minor-unit conversion, and denominations. The first configuration is US currency. Adding future currencies should be a configuration task unless a new interaction pattern is required.

The session composer reuses the Milestone 3A interaction engine. It uses number entry for calculations and word problems, multiple choice for clocks and comparisons, visual selection for measurement and graphs, sequence completion for some skip-counting prompts, matching for suitable arithmetic practice, and fraction coloring for early visual fractions.

Every generated question is validated before it is returned. Validation checks prompt, hint, explanation, encouragement, mode-specific choice, pair, visual, sequence, and fraction data, non-negative subtraction, valid time answers, valid money answers, valid fraction visuals, graph entries, and absence of multiplication or division symbols. Matching validation is deliberately strict: pair IDs and required answers must be unique, every pair prompt and label must be present, and the answer bank must contain exactly the complete set of required answers. The generator validates the final interaction-shaped question before returning it, so an invalid matching activity fails loudly rather than reaching the UI. The matching UI announces its selected-row count and labels a disabled Check button with the remaining number of choices, so a child can see why they cannot continue yet.

Recent-question tracking is framework-independent. `QuestionHistory` stores recent question keys and operand keys. The generator avoids exact recent repeats and recent operand patterns where practical, then falls back only as needed so lessons remain generatable. History is capped so older material can return for spaced review.

The repository also contains older Milestone 1 fixed-template generation in `lib/learning/questions.ts`. That module is no longer used by the active page but remains covered by tests.

## Scoring

In the active Number Forest flow, a lesson score is the number of correct first submitted answers in a ten-question lesson. All modes use the same framework-independent evaluation helpers. Incorrect submissions give a hint and permit a retry without a star; answers are not revealed after the first error.

Session stars and cumulative adventure stars are distinct:

* Session score is the score for the just-finished lesson attempt.
* Cumulative adventure stars are stored in progress and only increase when a lesson best score improves.

`lib/lessons/progress.ts` caps scores to the ten-question lesson maximum.

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

The first lesson is always unlocked. Completing a lesson unlocks the next ordered lesson, including across groups. Completion is recorded even when the first-attempt score is low, including zero. Replaying a lesson cannot relock later lessons or reduce prior best scores.

The recommended lesson is the first unlocked incomplete lesson. After all lessons are complete, the recommended lesson is the final lesson.

## Testing Strategy

Current tests focus on deterministic learning logic rather than browser rendering:

* `tests/lessons.test.ts` covers lesson definitions, unlocking, best-score star behavior, migration, generated question validity, and recent-repeat avoidance in lessons.
* `tests/curriculum-engine.test.ts` covers skill definitions, prerequisites, deterministic generation, variation, validation, difficulty bands, repeat history, and no multiplication/division.
* `tests/interaction-regressions.test.ts` runs 1,000 deterministic seeds through multiple-choice and matching generation and rejects malformed matching fixtures, including omitted answers, duplicate IDs, duplicate values, empty prompts, and unmappable answer-bank entries.
* `tests/real-world-math.test.ts` covers Milestone 3B money calculations, time validation, fraction visuals, measurement logic, graph interpretation, word problems, and registered lesson generation.
* `tests/e2e/learning-adventure.spec.ts` uses Playwright to run the app in a browser, select a companion, complete deterministic lessons through the UI, and verify grouped real-world lesson unlocking.
* `tests/question-generation.test.ts` covers retained Milestone 1 deterministic generation and answer validation.
* `tests/progress.test.ts` covers retained Milestone 1 best-score persistence logic and migration.
* `tests/scoring.test.ts` covers retained Milestone 1 scoring behavior.
* `tests/companion.test.ts` covers retained Milestone 1 companion state behavior.

Required validation commands are `npm run lint`, `npm run typecheck`, `npm run test`, `npm run test:e2e`, and `npm run build`.

## Planned Future Architecture

Future work should move toward:

* A teaching and mastery engine for worked examples, guided practice, hints, mastery checks, and adaptive recommendations.
* An optional server-side OpenAI enhancement layer for content enrichment after local systems are proven.
* Server-side validation and storage if API-generated content or remote persistence is introduced.

Client-side code must not contain API keys or secrets. External APIs, databases, and major dependencies require explicit milestone scope.
