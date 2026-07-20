# Kids Learning Adventure

## Product goal

Build a touch-friendly adaptive mathematics learning web application for one six-to-seven-year-old child.

The application will initially run in Safari on an iPad. It does not require App Store distribution.

The first priority is getting a small, useful version into the child's hands quickly. Do not build a large platform before the first learning session works.

## Learner starting point

The child:

* Can complete many Grade 1 and some Grade 2 math worksheets
* Is comfortable with addition and subtraction
* Should not be treated as a complete beginner
* Still needs occasional review of foundational concepts
* Has not learned multiplication yet

Include occasional spaced review of:

* Skip counting
* Number bonds
* Number trees
* Making ten
* Doubles and near doubles
* Place value

Do not assess multiplication facts until multiplication has been explicitly taught.

## Multiplication sequence

Teach multiplication conceptually in this order:

1. Equal groups without showing the multiplication symbol
2. Repeated addition
3. Rows and columns in arrays
4. Skip counting
5. Connect equal groups to the multiplication symbol
6. Begin fact practice

Every new concept must begin with a short interactive Teacher Mode lesson before assessment.

## Initial MVP

Build only:

* One local learner profile
* Three original character choices
* One short learning session
* Addition
* Subtraction
* Missing addends
* Place value
* Skip counting
* Number bonds or number trees
* Stars as rewards
* A results screen
* Local progress storage
* A simple parent summary

Do not add:

* Accounts
* Payments
* Advertisements
* Multiplayer
* Social features
* Reading
* Tamil
* Science
* Geography
* OpenAI API calls
* A remote database
* Complex animation
* Copyrighted characters

## Technical requirements

* Next.js
* React
* TypeScript with strict typing
* Tailwind CSS
* App Router
* Mobile-first responsive design
* Good iPad Safari support
* Touch targets at least 44 by 44 pixels
* Local-first storage
* Deterministic arithmetic generation
* Deterministic answer validation
* Learning logic separated from presentation components
* Automated tests for learning logic
* No secrets in client-side code

## Child experience

* Use short instructions
* Use large controls
* Avoid countdown timers
* Never punish mistakes
* Never remove earned progress
* Give encouraging corrective feedback
* Avoid excessive sound or animation
* Avoid manipulative reward mechanics
* Do not collect unnecessary personal information

## Development workflow

Before modifying code:

1. Read this file.
2. Inspect the repository.
3. Summarize the requested feature.
4. Identify files that will change.
5. Make the smallest complete change.
6. Run linting, type checking, tests, and the production build.
7. Fix failures before reporting completion.
8. Summarize what changed and how to test it.

## Git rules

* Never work directly on `main` for a feature.
* Create one feature branch per task.
* Keep one clear purpose per pull request.
* Do not merge pull requests.
* Do not force-push.
* Do not modify unrelated files.

## Dependency rules

Do not add a dependency unless it is necessary.

Before adding one:

1. Explain why it is needed.
2. Confirm that existing platform capabilities are insufficient.
3. Prefer a small, maintained dependency.
4. Record the reason in the implementation summary.

## Required validation

Run:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

If a script does not exist yet, add it as part of the initial project setup.
