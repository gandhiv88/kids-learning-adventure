# Kids Learning Adventure

Kids Learning Adventure is a touch-friendly, local-first math journey for one child. The current implemented experience is Number Forest: choose an active companion, follow a six-lesson map, complete short eight-question lessons, earn session stars, and preserve cumulative adventure stars locally.

There are no accounts, ads, APIs, timers, penalties, remote databases, or OpenAI API calls in the current app.

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
* Check iPad portrait, iPad landscape, and narrow mobile widths.
* Enable reduced motion and confirm transitions are removed.
