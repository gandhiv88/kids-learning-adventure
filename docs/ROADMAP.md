# Roadmap

## Completed

### Milestone 1: Single-Session Foundation

Delivered one local learner flow with companion selection, one short eight-question math session, stars, results, local progress, deterministic questions, and tests for learning logic.

### Milestone 1 Refinements

Delivered answer-position balancing, active companion behavior that preserves progress, and best-score-based cumulative adventure stars.

### Milestone 2: Number Forest Adventure Map

Delivered Number Forest, six ordered lessons, map-based lesson selection, sequential unlocking, version 3 progress storage, and tests for lessons, generation, migration, unlocking, and star behavior.

### Milestone 3A: Scalable Local Content Engine And Mixed Interactions

Delivered a deterministic local curriculum engine with reusable templates, difficulty bands, expanded skill support, question validation, prerequisite metadata, capped recent-question history, and tests. Completion audit added an intentional ten-question mixed interaction session: mostly number entry plus one multiple-choice, matching, visual selection, and reusable fraction-coloring activity.

### Milestone 3B: Real-World Math Expansion

Delivered grouped real-world math lessons for money, time, visual fractions, measurement, graphs, place value, and short word problems. Reused the interaction engine for number entry, multiple choice, matching, visual selection, sequence completion, and fraction coloring. Added structured visuals, context-aware encouragement, explanations, lesson group registration, and a configurable first currency model.

### Milestone 3C: Bug Fixes, Stability, And Polish

Delivered a stabilization pass for Milestone 3B. Fixed 12-hour time arithmetic around 12 o'clock, strengthened visual-selection validation, improved multiple-choice retry state, updated grouped-adventure copy, expanded browser e2e coverage across persistence and every real-world lesson group, and documented completed fixes in `BUGS.md`.

## Current

### Milestone 4: Adaptive Learning And Spaced Review

Use skill evidence to choose review and practice. Add spaced review that revisits foundations without over-practicing mastered skills.

## Planned

### Teaching, Guided Practice, Hints, And Mastery

Add teaching and guided practice on top of the local engine, without introducing AI, a backend, or broad adaptive progression before it is explicitly scoped.

### Milestone 5: Optional OpenAI Enhancement Layer

Add a server-side optional AI layer only after local curriculum and adaptation are proven. Candidate uses include stories, explanations, parent summaries, worksheets, and periodic content expansion.

### Later Milestones

Potential later work includes richer rewards, parent insights, additional subjects, additional worlds, stronger accessibility review, offline packaging improvements, and broader curriculum paths.
