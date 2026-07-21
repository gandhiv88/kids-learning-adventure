# Milestone 3A

Status: Completed after mixed-interaction audit.

## Mixed Interaction Completion

Each generated question has an explicit `interactionMode` and mode-specific data; the React UI switches only on that field, never on prompt text. A normal session is now ten questions: six number-entry questions, one multiple-choice question, one three-pair matching activity, one visual group-selection activity, and one fraction-coloring activity. This makes conventional multiple choice 10% of a session and prevents adjacent multiple-choice questions by construction.

`lib/lessons/interactions.ts` owns mode-neutral submitted-attempt evaluation. A correct first submission earns one star; an incorrect submission allows a retry but cannot earn that question's first-attempt star. Matching validates all pairs together, and fraction coloring validates the selected-section count, so selection changes before Check are not attempts.

Fraction coloring carries `numerator`, denominator `2 | 3 | 4`, and `rectangle`, `circle`, or `chocolate-bar` model data. Sections are toggle buttons with labels that state part number and colored state. It deliberately validates a count rather than positions. Later fraction work may add contiguous-region rules only through an explicit question field.

To add an interaction mode, add its discriminated question type in `lib/lessons/types.ts`, create deterministic generator data in `lib/lessons/questions.ts`, validate it in `validateQuestion`, add its evaluation rule to `lib/lessons/interactions.ts`, render it in `app/page.tsx`, and cover it in tests. All controls meet the existing 44px touch-target baseline, have visible keyboard focus, and fraction sections have meaningful accessible names. The matching UI currently uses selects rather than drawn connection lines; richer drag connections and more visual models are deferred.

Milestone 3A prepares the app for more curriculum content by building a scalable local content engine. It should remain deterministic, local-first, and testable.

## Implemented Summary

Milestone 3A adds:

* Skill metadata for number bonds, addition, subtraction, missing addends, skip counting, place value, number comparison, clock reading, fractions, and word problems.
* Reusable procedural question templates with estimated variety counts.
* `review`, `core`, and `challenge` difficulty bands.
* Deterministic seeded lesson and skill generation.
* Programmatic validation for generated questions.
* Capped framework-independent recent-question and recent-operand history.
* Prerequisite definitions for future teaching and adaptive milestones.
* Local progress migration to version 4 with `questionHistory`.

The active Number Forest app still uses the six Milestone 2 lessons and completion-based unlocking. Milestone 3A does not add adaptive progression or teaching mode.

## Approved Scope

Milestone 3A is limited to:

* Scalable procedural local question generation.
* Additional skills such as clocks, fractions, place value, comparison, and word problems.
* Difficulty metadata.
* Deterministic seeded sessions.
* Repeat protection.
* Question validation.
* Prerequisite definitions.
* Tests and documentation.

## Explicitly Excluded

Milestone 3A must not implement:

* Adaptive selection.
* Mastery-based promotion.
* Teaching mode.
* OpenAI API.
* Database.
* Parent dashboard.
* Achievements.
* Multiple new worlds.
* Multiplication.
* Three- or four-digit arithmetic.

## Product Constraints

New questions should still be suitable for the current learner: not a complete beginner, comfortable with addition and subtraction, and ready for broader foundations. Foundational review should remain present through number bonds, making ten, doubles or near doubles, skip counting, and place value.

Any new concept added to the content model should be marked with prerequisites. If the concept is genuinely new to the learner, Milestone 3A may define metadata and sample generation, but it should not present that concept as an independent assessment without the future Milestone 3B teaching flow.

## Architecture Expectations

Milestone 3A should move toward a local curriculum engine with:

* Structured skill definitions.
* Structured question specs.
* Generator functions by skill or question type.
* Seeded randomness that is reproducible in tests.
* Programmatic validation for every generated question.
* Repeat protection that avoids exact recent repeats while allowing later spaced review.
* Difficulty metadata that future adaptive logic can consume.
* Prerequisite metadata that future unlocking and teaching logic can consume.

Domain logic should stay separate from persistence and React UI.

## Testing Expectations

Tests should cover:

* Determinism for identical seeds.
* Variation for different seeds.
* Valid answer sets.
* Valid prompts and metadata.
* No impossible arithmetic.
* No multiplication.
* No three- or four-digit arithmetic.
* Repeat protection behavior.
* Prerequisite definitions.

## Documentation Expectations

Update relevant docs when Milestone 3A changes curriculum, architecture, persistence, or product behavior.
