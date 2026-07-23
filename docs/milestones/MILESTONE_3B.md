# Milestone 3B

Status: Implemented.

Milestone 3B expands the app from a pure arithmetic path into a real-world math adventure while keeping the local deterministic engine and interaction system.

## Implemented Summary

Milestone 3B adds:

* Lesson groups for Number Forest, Market Town, Clock Tower, Fraction Kitchen, Measurement Meadow, and Graph Garden.
* Money, time, visual fractions, measurement, graph, place-value, and word-problem lessons.
* Structured question visuals for coins, clocks, fraction models, measurement pictures, graphs, and base-ten blocks.
* Context-aware encouragement and short explanations on generated questions.
* Skill/template-level interaction declarations.
* Skill-aware interaction selection that reuses number entry, multiple choice, matching, visual selection, sequence completion, and fraction coloring.
* A first currency configuration for US currency, with money generation depending on a currency model rather than React component logic.
* Automated tests for money calculations, time validation, fraction visuals, measurement logic, graph interpretation, word-problem validation, and registered lesson generation.

## Lesson Registration

Lessons are registered in `lib/lessons/definitions.ts`.

Each lesson declares:

* `worldId`, which points to a lesson group.
* `skillFocus`.
* `difficultyBands`.
* `questionCount`.
* `order`.

The UI reads these definitions directly. Future world-map work should consume the same lesson and group definitions rather than duplicating lesson ordering in React.

## Interaction Reuse

Question generation lives in `lib/lessons/questions.ts`.

The generator chooses an interaction based on skill and template:

* Money counting, shopping, change, ruler reading, and word problems use number entry.
* Time and comparison questions use multiple choice with display labels.
* Measurement comparisons and graphs use visual selection.
* Skip-counting missing terms can use sequence completion.
* Suitable arithmetic review can use matching.
* Early fraction practice uses fraction coloring or visual selection.

React renders interaction data but does not decide lesson logic.

## Currency Abstraction

The current money implementation ships with US currency enabled. The currency model includes:

* Currency code.
* Major and minor symbols.
* Minor units per major unit.
* Denominations with ids, labels, and values.

Future currencies should be added by configuration unless they require a genuinely new visual or interaction pattern.

## Explicitly Excluded

Milestone 3B does not add:

* Multiplication.
* Division.
* Adaptive AI.
* Parent dashboard.
* Cloud sync.
* Accounts.
* Backend.
* Multiplayer.
* Premium features.
* Full world-map navigation.
