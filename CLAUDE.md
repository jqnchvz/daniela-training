# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project overview

HANS (Hypothyroid-Aware Nutritional Strength) is a personal training PWA for a single user (Daniela) managing hypothyroidism. It tracks workouts, wellness check-ins, progressive overload, and periodization across a 16-week training cycle. The app is bilingual (English/Spanish) and designed mobile-first (max 420px width).

## Commands

- `npm run dev` — start dev server (uses webpack; Serwist PWA disabled in dev)
- `npm run build` — production build (uses webpack)
- `npm run lint` — ESLint with Next.js core-web-vitals + TypeScript configs
- `npm test` — run all tests once (`vitest run`)
- `npm run test:watch` — run tests in watch mode
- `npx vitest run src/__tests__/progression.test.ts` — run a single test file
- `npm run db:push` — push Drizzle schema to Neon (requires `DATABASE_URL`)
- `npm run db:generate` — generate Drizzle migration files
- `npm run db:studio` — open Drizzle Studio GUI

## Architecture

### Data flow: DB-first with offline fallback

The database (Neon Postgres) is the single source of truth. On app load, `DbHydrator` fetches all user data from API routes and hydrates Zustand stores. Writes go through `enqueueWrite()` which POSTs to the API immediately but falls back to a localStorage queue when offline. The queue is flushed on reconnect.

```
Browser → Zustand stores (client state)
  ↑ hydrate on load         ↓ enqueueWrite on mutation
  API routes (src/app/api/) ↔ Neon Postgres (Drizzle ORM)
```

### Key layers

- **API routes** (`src/app/api/`): REST endpoints for sessions, checkins, cycle state, users, and exercise cache. All writes validate with Zod schemas from `src/lib/validations.ts`. Paginated reads via `?limit=&offset=`.
- **Zustand stores** (`src/store/`): Client state management. `history-store` holds sessions/checkins/measurements/lab results. `session-store` (persisted) tracks in-progress workout state. `auth-store` (persisted) handles multi-user selection. `cycle-store` and `cycle-phase-store` track periodization state.
- **Domain logic** (`src/lib/`): Pure functions with no React dependencies — testable in isolation:
  - `progression.ts` — progressive overload suggestions (5% increases, stall detection, deload logic)
  - `phases.ts` — 16-week 3-phase periodization (Stabilization → Strength Endurance → Muscular Development)
  - `exercises.ts` — exercise catalog and workout plans (3 days: Push/Pull/Legs), lite-mode filtering
  - `seasons.ts` — southern hemisphere seasonal awareness (hypothyroid winter adjustments)
  - `checkin.ts` — wellness red-flag detection from check-in data

### Auth model

Simple PIN-based multi-user selection (not security auth). Users pick a profile at `AuthGate`, optionally verify a PIN. `OnboardingGate` captures experience level on first use.

### PWA

Service worker via Serwist (`src/app/sw.ts`, `next.config.ts`). Disabled in development. Offline writes queue to localStorage.

## Tech stack

- Next.js 16 (App Router) with React 19, TypeScript, Tailwind CSS v4
- Neon Postgres via `@neondatabase/serverless` + Drizzle ORM
- Zustand for client state (some stores use `persist` middleware → localStorage)
- Zod for API validation
- Vitest + Testing Library + jsdom for tests
- Serwist for PWA/service worker
- Base UI (`@base-ui/react`) + shadcn components, Recharts for charts

## Conventions

- Path alias: `@/` maps to `./src/`
- Exercise and plan IDs use deterministic UUIDs (e.g., `a0000000-0000-4000-8000-000000000001`)
- Spanish translations: exercise names/notes live on the `Exercise` type (`nameEs`, `notesEs`), instructions in `exercise-translations-es.ts`, UI strings via `src/lib/i18n.ts`
- Weights in kg, rounded to nearest 2.5kg increments
- DB schema at `src/lib/db/schema.ts`, lazy-initialized singleton connection at `src/lib/db/index.ts`
- All tests in `src/__tests__/`, setup file at `src/__tests__/setup.ts`
