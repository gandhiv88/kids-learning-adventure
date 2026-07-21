# Product Vision

Kids Learning Adventure is a child-friendly learning journey for one six-to-seven-year-old learner. It is not intended to be a simple quiz bank. The experience should feel like progress through a gentle learning path with an active companion, short feedback, earned stars, and visible progression.

The product is inspired by broad engagement principles used by learning applications: journey paths, companions, immediate feedback, rewards, and progression. It must not copy proprietary branding, characters, artwork, lesson text, or UI from any existing product.

The current product is local-first and usable without AI or any API. It runs as a Next.js web app, initially targeting Safari on an iPad. It has no accounts, ads, payments, multiplayer, remote database, or OpenAI API calls.

The experience should encourage effort without pressure. Do not add lives, harsh penalties, countdown timers, lost stars, shame language, or mechanics that punish mistakes. Earned progress must remain safe.

The app has one local learner profile. The selected companion is an active companion only; it does not create or select a separate child profile. Changing companions must preserve all learning progress and stars.

The long-term product may expand beyond math. The current focus is math foundations and early arithmetic readiness.

## Long-Term Experience

Planned long-term experience areas:

* Themed worlds with visible learning paths.
* Lesson paths that unlock in a clear order.
* Varied question types, not only four-choice arithmetic.
* Explicit teaching of new concepts before assessment.
* Guided practice with hints and supportive retries.
* Independent mastery checks.
* Adaptive skill review and spaced practice.
* Parent insights that explain progress and support needs.
* Optional OpenAI-powered content enhancements later, after the local curriculum and adaptation systems are proven.

## Current Product Shape

Implemented behavior currently centers on Number Forest, a six-lesson local math path. A returning learner sees the selected companion, cumulative adventure stars, and the unlocked lesson map. Lessons are short, deterministic eight-question sessions. Results show session score, previous best, new best, stars added, and total adventure stars.

The implemented app is still intentionally small. It should remain easy to run locally, easy to inspect, and suitable for the first real learning sessions.
