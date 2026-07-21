# Milestone 3A

Status: Approved scope, not implemented.

Milestone 3A prepares the app for more curriculum content by building a scalable local content engine. It should remain deterministic, local-first, and testable.

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
