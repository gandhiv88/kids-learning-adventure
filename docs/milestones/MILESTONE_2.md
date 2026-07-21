# Milestone 2

Status: Completed.

## User Flow

The active Milestone 2 flow is:

Welcome -> optionally choose a companion -> Number Forest map -> select an unlocked lesson -> answer eight questions -> results -> return to map or replay.

Returning learners see the selected companion and cumulative adventure stars. No lesson starts automatically.

## Features Delivered

Milestone 2 delivered:

* Number Forest adventure map.
* Six ordered lessons.
* Sequential lesson unlocking.
* Lesson best scores.
* Cumulative adventure stars.
* Results screen showing previous best, new best, stars added, and total stars.
* Active companion choices: `moss`, `luna`, and `ember`.
* Companion changes that preserve progress.
* Deterministic seeded question generation per lesson attempt.
* Balanced correct-answer positions.
* Local progress migration and normalization.

## Lessons Delivered

1. Number Bond Garden.
2. Addition Trail.
3. Mystery Number Grove.
4. Subtraction Cave.
5. Skip-Counting Bridge.
6. Forest Star Challenge.

Each lesson has eight generated questions.

## Persistence Changes

Milestone 2 introduced `localStorage` key `number-forest-progress` and progress version 3 in `lib/lessons/*`.

The active saved shape stores:

* `selectedCharacter`.
* `totalAdventureStars`.
* Per-lesson `bestScore`.
* Per-lesson `completed`.

Migration normalizes malformed data, clamps scores to 0 through 8, preserves valid selected companions, preserves non-negative total stars, and maps legacy best score fields to `number-bonds-1` when needed.

## Important Decisions

* Lesson 1 starts unlocked.
* Completing a lesson unlocks the next lesson even when the score is low.
* Replaying a lesson never relocks progress.
* Cumulative adventure stars increase only when a best score improves.
* Generated lessons are deterministic for a seed.
* Correct-answer positions are balanced and tested.

## Tests

Milestone 2 behavior is covered primarily by `tests/lessons.test.ts`, including:

* Lesson definitions and order.
* Sequential unlocking.
* Best-score star behavior.
* Migration.
* Generated question validity.
* Deterministic seeded generation.
* Correct-answer position balancing.

## Intentionally Excluded

Milestone 2 excluded adaptive selection, mastery-based promotion, teaching mode, OpenAI API calls, databases, parent dashboard, achievements, additional worlds, multiplication, and larger multi-digit arithmetic.

## Known Limitations

The current lesson screen accepts one answer per question. An incorrect choice reveals feedback and the correct answer, then the learner continues; there is no guided retry inside the same question.

The active Milestone 2 UI is implemented directly in `app/page.tsx`, so presentation and flow orchestration are not yet split into smaller components.

The repository still contains retained Milestone 1 modules and tests alongside the active Milestone 2 implementation. Future cleanup should be deliberate because those modules document and test prior behavior.
