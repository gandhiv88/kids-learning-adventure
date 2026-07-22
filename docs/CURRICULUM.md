# Curriculum

The learner already performs above a basic beginner level for early elementary math. The app should not treat the child as starting from zero. Foundational concepts should still appear through spaced review because they support later arithmetic fluency.

Mastery should be tracked per skill rather than assigning a general intelligence label. The app should describe support needs in terms of skills and practice patterns, not fixed ability.

## Current Implemented Skills

The current math adventure includes ordered lesson groups. Number Forest keeps the original arithmetic path, and Milestone 3B adds real-world groups for money, time, fractions, measurement, graphs, place value, and short word problems.

The local engine now supports:

* Number bonds.
* Addition.
* Subtraction.
* Missing addends.
* Skip counting.
* Place value.
* Number comparison.
* Money.
* Time.
* Visual fractions.
* Measurement.
* Graphs.
* Simple one-step word problems.

The active app does not currently implement mastery tracking, adaptive review, or an entire world map. Lessons are grouped so later world-map work can consume the same definitions.

## Real-World Math

Milestone 3B adds these lesson groups:

* Number Forest: number bonds, addition, missing addends, subtraction, skip counting, place value, comparison, and word problems.
* Market Town: identify coins, count coins, compare amounts, simple shopping, simple change, and making exact amounts.
* Clock Tower: analog clocks, digital times, matching times, before/after, and simple elapsed time.
* Fraction Kitchen: halves, thirds, and quarters using pizza, chocolate bar, fruit, and shape models.
* Measurement Meadow: longer/shorter, heavier/lighter, taller/shorter, capacity, and simple ruler reading.
* Graph Garden: picture graphs and bar charts.

Money uses a configurable currency model. The current configuration ships US denominations, but lesson logic depends on denomination configuration rather than React components or hardcoded prompts.

## Near-Term And Planned Skills

Planned curriculum areas include:

* Number bonds.
* Addition.
* Subtraction.
* Missing addends.
* Skip counting.
* Place value.
* Number comparison.
* Money.
* Time.
* Visual fractions.
* Measurement.
* Graphs.
* Simple word problems.

Each skill has `review`, `core`, and `challenge` difficulty metadata. Examples:

* Addition review stays within 20, core reaches within 100, and challenge prepares two-digit work without full regrouping.
* Clock review uses whole hours, core adds half hours, and challenge adds quarter hours.
* Fraction review uses halves, core adds fourths, and challenge adds thirds and comparison.

## Learning Sequence For New Concepts

New concepts should require prerequisite skills and should follow this structure:

1. Worked examples.
2. Guided practice with hints.
3. Independent practice.
4. Mastery check.

Persistent difficulty should recommend parent support using encouraging language. Example tone: "This skill may need a little grown-up practice together" rather than "failed" or "behind."

## Arithmetic Progression

Planned arithmetic progression:

1. Addition and subtraction within 20.
2. Addition and subtraction within 100, with place value.
3. Two-digit regrouping.
4. Three-digit addition and subtraction after mastery of place value, two-digit regrouping, and estimation.
5. Multiplication and division concepts.
6. Four-digit addition and subtraction after mastery of thousands place value and three-digit operations.

Three- and four-digit arithmetic are not being added in Milestone 3A. They should unlock based on prerequisite mastery, not age or milestone number.

## Multiplication

Do not assess multiplication facts until multiplication has been explicitly taught. The planned multiplication sequence is:

1. Equal groups without showing the multiplication symbol.
2. Repeated addition.
3. Rows and columns in arrays.
4. Skip counting.
5. Connect equal groups to the multiplication symbol.
6. Begin fact practice.
