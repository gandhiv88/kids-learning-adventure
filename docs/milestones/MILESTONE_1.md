# Milestone 1

Status: Completed.

## User Flow

The Milestone 1 flow was:

Welcome -> choose a companion -> complete one eight-question math session -> see results -> replay or continue.

The original companion choices were `unicorn`, `robot`, and `dragon`. This Milestone 1 UI remains in `components/adventure/LearningAdventure.tsx`, but it is not the active rendered app after Milestone 2.

## Features Delivered

Milestone 1 delivered:

* One local learner profile.
* Three original companion choices.
* One short eight-question learning session.
* Addition, subtraction, missing addends, skip counting, and number bond questions.
* Deterministic fixed-template question generation with seeded answer ordering.
* Deterministic answer validation.
* Stars for first-try correct answers.
* Encouraging retry feedback.
* Results screen.
* Local progress storage.
* Basic parent-readable result information through the results screen.

## Persistence Changes

Milestone 1 used `localStorage` key `kids-learning-adventure.progress.v1` through `lib/persistence/progress.ts`.

The retained Milestone 1 storage model is version 2:

* `selectedCharacter`.
* `totalAdventureStars`.
* `lessonBestScores`.
* `committedSessionIds`.

The persistence logic preserves selected companion changes, caps lesson scores to 8, and prevents duplicate session commits from adding stars again.

## Important Decisions

* Companion choice is display state for one learner, not a separate profile.
* Correct-answer positions are seeded and balanced.
* Session score and cumulative adventure stars are distinct.
* Cumulative stars grow only through best-score improvements.
* Local deterministic arithmetic is the core question source.

## Tests

Milestone 1 behavior is covered by:

* `tests/question-generation.test.ts`.
* `tests/scoring.test.ts`.
* `tests/progress.test.ts`.
* `tests/companion.test.ts`.

## Intentionally Excluded

Milestone 1 excluded accounts, payments, ads, multiplayer, social features, remote databases, OpenAI API calls, complex animation, additional subjects, multiplication, and teaching mode.

## Known Limitations

The Milestone 1 UI is retained but no longer active in `app/page.tsx`. Its progress key differs from the active Milestone 2 Number Forest key. Milestone 1 questions are fixed templates with seeded answer ordering, not scalable procedural generation.
