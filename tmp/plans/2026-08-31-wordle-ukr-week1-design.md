# Wordle UA — Week 1: Project setup and basic grid UI

## Project goal

Wordle in Ukrainian — a real product, planned for release on the App Store and Google Play. The owner's main goal is to learn: go through the full flow from zero to shipping on both stores, with decisions explained at every step rather than just implemented.

Overall plan — 4 weeks (Setup → Game logic → Polish → Release). This document covers Week 1 only.

## Week 1 goal

Lay the foundation: a configured Expo project with navigation, a static UI for the 6×5 grid and keyboard, and tested (TDD) word comparison logic — no game state, animations, or progress saving yet (that's Week 2).

## Stack

- Expo + TypeScript
- Package manager: yarn
- Navigation: React Navigation (NativeStack) — a deliberate choice over Expo Router, to understand navigation without the file-based abstraction
- Styles: NativeWind (Tailwind for RN); all styles go into separate `*.styles.ts` files next to the component, no inline `className` in JSX
- Testing: Jest + React Native Testing Library (jest-expo preset), TDD from the start
- Linting: ESLint (eslint-config-expo) + Prettier from day one
- No backend — the daily word is computed locally from the date (Week 2)

## Project structure

```
wordle-ukr/
├── App.tsx
├── navigation/
│   └── AppNavigator.tsx
├── screens/
│   └── game/
│       ├── GameScreen.tsx
│       └── GameScreen.styles.ts
├── components/
│   ├── grid/
│   │   ├── Grid.tsx
│   │   ├── Grid.styles.ts
│   │   ├── Tile.tsx
│   │   └── Tile.styles.ts
│   └── keyboard/
│       ├── Keyboard.tsx
│       ├── Keyboard.styles.ts
│       ├── Key.tsx
│       └── Key.styles.ts
├── lib/
│   ├── word-comparison.ts
│   └── word-comparison.test.ts
├── data/
│   └── words.ts
├── types/
│   └── game.ts
├── .eslintrc.js
├── .prettierrc
└── CLAUDE.md
```

Naming: PascalCase for component files, kebab-case for everything else (lib, data, types).

## Word comparison logic (`lib/word-comparison.ts`)

```ts
type LetterState = 'correct' | 'present' | 'absent';

function compareWord(guess: string, answer: string): LetterState[]
```

Key nuance — correctly handling repeated letters: first pass over positions for `correct`, then a second pass for `present` that counts remaining letters in the answer (a frequency map), so a letter isn't marked `present` more times than it actually remains in the answer after accounting for `correct` matches.

## Implementation order (TDD)

1. `lib/word-comparison.ts` + `.test.ts` — tests first: simple cases (all correct, all absent) → the duplicate-letters case that exposes the naive implementation's bug → an implementation that passes all tests
2. `types/game.ts` — `LetterState`, `GuessResult`, and other types needed for Week 1
3. `data/words.ts` — a starter list of ~50-100 Ukrainian 5-letter words (hand-picked for the prototype, full dictionary later)
4. `components/grid/Tile.tsx` → `components/grid/Grid.tsx` — a static 6×5 grid, with render smoke tests
5. `components/keyboard/Key.tsx` → `components/keyboard/Keyboard.tsx` — static UI, no key-press handling yet (input logic is Week 2)
6. `screens/game/GameScreen.tsx` + `navigation/AppNavigator.tsx` — assembles everything into one screen

## Out of scope for Week 1

- Game state (current guess, guess history)
- Keyboard press handling
- Tile-flip animation
- Date-based daily word, AsyncStorage, stats
- Onboarding, dark theme, "Share result"
- Any release prep (EAS Build, store listings)

## Week 1 done criteria

- `yarn test` passes — tests for `word-comparison.ts` (including the duplicate-letters case) and smoke tests for `Grid`/`Tile`
- `yarn lint` passes with no errors
- The project runs in Expo Go / simulator, showing a static 6×5 grid and keyboard on screen
