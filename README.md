# Kids Learning Adventure — Milestone 2

Number Forest is a touch-friendly, local-first maths journey for one child. Choose Moss, Luna, or Ember, then travel through six short lessons. There are no accounts, ads, APIs, timers, or penalties.

## User flow

Welcome → choose or keep a companion → Number Forest map → select an unlocked eight-question lesson → see results → return to the map. Returning learners see their selected companion and adventure-star total, but no lesson starts automatically.

## Lessons

1. Number Bond Garden — part-whole number bonds
2. Addition Trail — addition
3. Mystery Number Grove — missing addends
4. Subtraction Cave — non-negative subtraction
5. Skip-Counting Bridge — 2s, 5s, and 10s
6. Forest Star Challenge — mixed review

Lesson 1 starts unlocked. Completing all eight questions unlocks the next lesson even when no first-try answers are correct. Replaying never relocks a path. Each lesson stores its best score; only an improved score adds the difference to the cumulative adventure-star total.

## Persistence

Progress is stored in `localStorage` as version 3. Older records are safely normalized, preserve a valid companion and cumulative stars, and map a legacy Milestone 1 best score to Number Bond Garden. Missing, malformed, or unavailable browser storage falls back safely to an in-memory new adventure.

## Development

```bash
npm run dev
npm run lint
npm run typecheck
npm run test
npm run build
```

## Manual checklist

- New and returning user flows; companion changes preserve progress.
- Locked nodes cannot be activated; completing a lesson reveals the next node.
- Replay lower/equal/improved scores and confirm stars only increase by improvements.
- Check map, lesson, and results in iPad portrait/landscape and narrow mobile widths.
- Enable reduced motion and confirm transitions are removed.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
