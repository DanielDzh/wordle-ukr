# Wordle UA — project conventions

## Working rules (important)

- **Never run `git commit` or `git push` without explicit permission every single time** — approval for the overall plan/task does not cover each individual commit.
- **Never run `git merge`** — only the project owner merges branches.
- When executing a multi-step plan — pause and explain after each task, don't silently run through the whole plan and report only at the end.
- Before declaring quickly-done work "complete" — double-check it again; speed is not a proxy for correctness.

Wordle in Ukrainian. Expo (React Native) + TypeScript. Decisions and approaches are explained step by step, not just implemented silently.

## Stack

- Expo + TypeScript
- Package manager: **yarn**
- Navigation: **React Navigation** (NativeStack), no Expo Router — a deliberate choice, to understand navigation bottom-up
- Styles: **NativeWind** (Tailwind for RN)
- Animations: Reanimated (`react-native-reanimated` + `react-native-worklets`) — already installed in Week 1 as a NativeWind dependency (css-interop needs them under the hood), will be used explicitly for the tile-flip animation in Week 2
- Testing: Jest + React Native Testing Library (jest-expo preset), **TDD from the start**
- Linting: ESLint + Prettier from day one (eslint-config-expo)
- No backend at launch — the daily word is derived locally from a date-based formula
- AsyncStorage — stats, streak

## Styling rule (NativeWind)

**All styles live in separate files, never inline `className` in JSX.**

Each component has a sibling file with its classes (e.g. an object of className strings), not string classes directly in the component markup. Goal: keep JSX free of layout detail, and let styles be refactored independently of logic.

## Git strategy

- `main` — production release only (what ships to the App Store / Google Play)
- `develop` — base development branch, features branch off it
- `feature/*` — branches for specific tasks/weeks, merged into `develop` via PR
- Never commit directly to `main` or `develop` — always through a branch + PR

## Testing (RNTL v14)

`render()` from `@testing-library/react-native` v14 is an async function (the new concurrent test renderer). Always `await render(...)` in tests, otherwise `screen.getByText` etc. throw `` `render` function has not been called ``. `renderHook()` is async too, for the same reason — always `await renderHook(...)`.

## Word list

Week 1: a small starter list of 5-letter Ukrainian words (~50-100 words), hand-picked, for the prototype. The full dictionary comes later.

## Overall plan (4 weeks)

- **Week 1** — Expo setup, grid (6x5) and keyboard UI, word comparison logic, starter word list
- **Week 2** — Win/lose states, tile-flip animation, date-based daily word, local stats
- **Week 3** — Onboarding, dark theme, "Share result", app icon/splash, testing on real devices
- **Week 4** — App Store Connect / Google Play submission prep, EAS Build, review submission
