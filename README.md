# Kids Learning Adventure

Kids Learning Adventure is a touch-friendly, local-first math journey for one child. The current implemented experience is a grouped math adventure: choose an active companion, follow unlocked lessons across Number Forest and real-world math areas, complete short ten-question lessons, earn session stars, and preserve cumulative adventure stars locally.

There are no accounts, ads, APIs, timers, penalties, remote databases, or OpenAI API calls in the current app.

## Local Curriculum Engine

Milestone 3B expands the deterministic local learning engine under `lib/lessons/`.

Supported procedural skills:

* Number bonds.
* Addition.
* Subtraction.
* Missing addends.
* Skip counting.
* Place value.
* Number comparison.
* Money with a configurable currency model.
* Time with analog and digital clock questions.
* Visual fractions for halves, thirds, and quarters.
* Measurement.
* Picture graphs and bar charts.
* Simple one-step word problems.

Each skill has `review`, `core`, and `challenge` difficulty bands plus reusable question templates, declared interaction modes, hints, explanations, and context-aware encouragement. Lesson definitions are organized into groups so future world-map work can consume `Number Forest`, `Market Town`, `Clock Tower`, `Fraction Kitchen`, `Measurement Meadow`, and `Graph Garden` without rewriting the generator.

Estimated procedural variety:

* Addition: 640+
* Subtraction: 600+
* Missing addends: 340+
* Number bonds: 190+
* Skip counting: 240+
* Money: 1,160+
* Time: 790+
* Fractions: 390+
* Measurement: 580+
* Graphs: 280+
* Place value: 250+
* Number comparison: 380+
* Word problems: 480+

Generation is seeded, so a `(lesson, seed, history)` input reproduces the same session. The engine rejects malformed questions, verifies four distinct choices when choices are used, confirms the correct answer appears once, prevents negative subtraction, validates money, time, fraction, measurement, and graph answers, and blocks multiplication and division symbols.

The first shipped currency configuration is US currency, but the money generator uses a currency model with code, labels, minor-unit symbols, and denominations rather than hardcoded React logic. Future currencies should be added by configuration.

Recent-question tracking is stored locally in progress as framework-independent `questionHistory`. It avoids exact recent repeats and recently used operands where practical, then allows older material to return later for spaced review.

Prerequisites are defined in skill metadata for future teaching and adaptive milestones. Milestone 3A records relationships such as number comparison requiring place value review, clock reading requiring skip-counting review, and word problems requiring addition and subtraction review. The app does not yet perform adaptive progression or mastery promotion.

## Documentation

Read these files before planning milestone work:

* [Product Vision](docs/PRODUCT_VISION.md)
* [Curriculum](docs/CURRICULUM.md)
* [Architecture](docs/ARCHITECTURE.md)
* [Decisions](docs/DECISIONS.md)
* [Roadmap](docs/ROADMAP.md)
* [Milestone 1](docs/milestones/MILESTONE_1.md)
* [Milestone 2](docs/milestones/MILESTONE_2.md)
* [Milestone 3A](docs/milestones/MILESTONE_3A.md)
* [Milestone 3B](docs/milestones/MILESTONE_3B.md)

## Development

```bash
npm run dev
npm run lint
npm run typecheck
npm run test
npm run build
```

Open [http://localhost:3000](http://localhost:3000) after starting the development server.

## Manual Checklist

* New and returning user flows.
* Companion changes preserve progress.
* Locked lessons cannot be started.
* Completing a lesson unlocks the next lesson.
* Replay lower, equal, and improved scores; confirm cumulative stars only increase on improved best scores.
* Replay the same lesson several times and confirm questions vary while the lesson theme stays the same.
* Check iPad portrait, iPad landscape, and narrow mobile widths.
* Enable reduced motion and confirm transitions are removed.
