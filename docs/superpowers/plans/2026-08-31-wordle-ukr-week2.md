# Wordle UA — Week 2 Implementation Plan

> **For implementers:** Follow this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the static Week 1 screen into a playable daily-word game: guess input, win/lose detection with a stats+share modal, a date-based daily word, keyboard letter coloring, tile-flip animation, and local persistence via AsyncStorage.

**Architecture:** Pure, TDD-first logic in `lib/` (daily word selection, game reducer, stats, share text, a thin AsyncStorage wrapper) composed by a `useGameState` hook that owns side effects (loading/saving). `GameScreen` wires the hook to `Grid`, `Keyboard`, and a new `ResultModal`. `Tile` and `Key` gain visual states; `Tile` additionally gets a Reanimated flip.

**Tech Stack:** Same as Week 1, plus `@react-native-async-storage/async-storage`.

**Spec:** `docs/superpowers/specs/2026-08-31-wordle-ukr-week2-design.md`

## Global Constraints

- All styles in separate `*.styles.ts` files next to the component — never inline `className` in JSX (a dynamic numeric `style={{ width: ... }}` for the guess-distribution bar in `ResultModal` is the one unavoidable exception — it's a computed layout value, not a static class)
- TDD: a test before the implementation for everything in `lib/`
- User-facing UI text (labels shown in the app) is in Ukrainian — this is a Ukrainian-language game. Only code comments, identifiers, and docs are English.
- Typed guesses are uppercase Cyrillic (matches the existing `Keyboard` labels); `data/words.ts` words are lowercase — lowercase the guess before comparing
- No guess validation against the word list this week — any 5-letter guess is accepted on ENTER
- Every task ends with a commit

---

### Task 1: Install AsyncStorage and configure its Jest mock

**Files:**
- Modify: `package.json` (dependency + jest `moduleNameMapper`)

**Interfaces:**
- Produces: `@react-native-async-storage/async-storage` available at runtime and mocked (in-memory) during tests

- [ ] **Step 1: Install the dependency**

```bash
npx expo install @react-native-async-storage/async-storage
```

- [ ] **Step 2: Wire its Jest mock**

The package ships a mock module (`.../jest/async-storage-mock.js`) that just exports an in-memory implementation — it does not call `jest.mock()` itself. Adding it to `setupFiles` (a common but wrong first instinct) does nothing useful, and worse: `setupFiles` is array-valued, so specifying it in `package.json` **replaces** `jest-expo`'s own `setupFiles` (which mocks native modules generally) instead of merging with it, breaking every other native-module-dependent test.

The correct wiring is `moduleNameMapper`, which — unlike array-valued keys — is an object that Jest merges with the preset's own `moduleNameMapper` key by key:

```json
{
  "jest": {
    "preset": "jest-expo",
    "moduleNameMapper": {
      "^@react-native-async-storage/async-storage$": "<rootDir>/node_modules/@react-native-async-storage/async-storage/jest/async-storage-mock.js"
    }
  }
}
```

This redirects every import of the package to the mock object directly, so `lib/storage.ts` never touches the real native module.

- [ ] **Step 3: Verify the existing test suite still passes**

```bash
yarn test
```

Expected: all existing tests still pass (this step only adds config, no behavior change yet).

- [ ] **Step 4: Commit**

```bash
git add package.json yarn.lock
git commit -m "chore: add async-storage dependency and jest mock"
```

---

### Task 2: Extend shared game types

**Files:**
- Modify: `types/game.ts`

**Interfaces:**
- Produces: `GameStatus`, `Guess`, `GameState`, `GameAction`, `Stats` — used by every task below

- [ ] **Step 1: Add the new types**

```ts
// types/game.ts
export type LetterState = 'correct' | 'present' | 'absent';

export type GuessResult = LetterState[];

export type GameStatus = 'playing' | 'won' | 'lost';

export type Guess = {
  letters: string[];
  states: LetterState[];
};

export type GameState = {
  status: GameStatus;
  answer: string;
  currentGuess: string;
  guesses: Guess[];
};

export type GameAction = { type: 'KEY_PRESS'; key: string } | { type: 'HYDRATE'; state: GameState };

export type Stats = {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: [number, number, number, number, number, number];
};
```

- [ ] **Step 2: Check the TypeScript build**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add types/game.ts
git commit -m "feat: add game state and stats types"
```

---

### Task 3: Daily word selection (TDD)

**Files:**
- Create: `lib/daily-word.ts`
- Test: `lib/daily-word.test.ts`

**Interfaces:**
- Produces: `EPOCH_DATE`, `getDailyWordIndex(today, epoch, wordCount): number`, `getTodayWord(words, today?): string` — used by Task 12 (`useGameState`)

- [ ] **Step 1: Write the first test — same day as epoch is index 0**

Create `lib/daily-word.test.ts`:

```ts
import { getDailyWordIndex } from './daily-word';

describe('getDailyWordIndex', () => {
  it('returns 0 when today is the same calendar day as the epoch', () => {
    const epoch = new Date(2026, 7, 31);
    const today = new Date(2026, 7, 31, 23, 59);
    expect(getDailyWordIndex(today, epoch, 33)).toBe(0);
  });
});
```

- [ ] **Step 2: Run the test, confirm it fails**

```bash
yarn test daily-word
```

Expected: FAIL — `Cannot find module './daily-word'`.

- [ ] **Step 3: Minimal implementation**

Create `lib/daily-word.ts`:

```ts
function toLocalDayNumber(date: Date): number {
  const local = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.floor(local.getTime() / 86_400_000);
}

export function getDailyWordIndex(today: Date, epoch: Date, wordCount: number): number {
  const diffDays = toLocalDayNumber(today) - toLocalDayNumber(epoch);
  return ((diffDays % wordCount) + wordCount) % wordCount;
}
```

- [ ] **Step 4: Run the test, confirm it passes**

```bash
yarn test daily-word
```

Expected: PASS.

- [ ] **Step 5: Add a test for the next day and for wraparound**

Add to `lib/daily-word.test.ts`:

```ts
  it('returns 1 the day after the epoch', () => {
    const epoch = new Date(2026, 7, 31);
    const today = new Date(2026, 8, 1);
    expect(getDailyWordIndex(today, epoch, 33)).toBe(1);
  });

  it('wraps around using modulo when the day count exceeds the word count', () => {
    const epoch = new Date(2026, 7, 31);
    const today = new Date(2026, 8, 3); // 3 days after epoch
    expect(getDailyWordIndex(today, epoch, 3)).toBe(0);
  });
```

Run `yarn test daily-word` — Expected: PASS (the modulo formula already handles both cases).

- [ ] **Step 6: Add `EPOCH_DATE` and `getTodayWord`, with a test**

Add to `lib/daily-word.test.ts`:

```ts
import { EPOCH_DATE, getTodayWord } from './daily-word';

describe('getTodayWord', () => {
  it('returns the first word on the epoch date', () => {
    expect(getTodayWord(['а', 'б', 'в'], EPOCH_DATE)).toBe('а');
  });
});
```

Add to `lib/daily-word.ts`:

```ts
export const EPOCH_DATE = new Date(2026, 7, 31);

export function getTodayWord(words: string[], today: Date = new Date()): string {
  const index = getDailyWordIndex(today, EPOCH_DATE, words.length);
  return words[index];
}
```

- [ ] **Step 7: Run all tests, confirm they pass**

```bash
yarn test daily-word
```

Expected: PASS, 4 tests.

- [ ] **Step 8: Commit**

```bash
git add lib/daily-word.ts lib/daily-word.test.ts
git commit -m "feat: add daily word selection logic"
```

---

### Task 4: Keyboard letter-state aggregation (TDD)

**Files:**
- Create: `lib/keyboard-letter-states.ts`
- Test: `lib/keyboard-letter-states.test.ts`

**Interfaces:**
- Consumes: `LetterState`, `Guess` from `types/game.ts`
- Produces: `mergeLetterStates(guesses: Guess[]): Record<string, LetterState>` — used by Task 12 (`useGameState`)

- [ ] **Step 1: Write the first test — empty guesses produce no entries**

Create `lib/keyboard-letter-states.test.ts`:

```ts
import { mergeLetterStates } from './keyboard-letter-states';

describe('mergeLetterStates', () => {
  it('returns an empty object for no guesses', () => {
    expect(mergeLetterStates([])).toEqual({});
  });
});
```

- [ ] **Step 2: Run the test, confirm it fails**

```bash
yarn test keyboard-letter-states
```

Expected: FAIL — `Cannot find module './keyboard-letter-states'`.

- [ ] **Step 3: Minimal implementation**

Create `lib/keyboard-letter-states.ts`:

```ts
import type { Guess, LetterState } from '../types/game';

export function mergeLetterStates(guesses: Guess[]): Record<string, LetterState> {
  return {};
}
```

- [ ] **Step 4: Run the test, confirm it passes**

```bash
yarn test keyboard-letter-states
```

Expected: PASS.

- [ ] **Step 5: Add a test for a single guess**

Add to `lib/keyboard-letter-states.test.ts`:

```ts
  it('records the state of each letter from a single guess', () => {
    const guesses = [{ letters: ['А', 'Б'], states: ['correct', 'absent'] as const }];
    expect(mergeLetterStates(guesses)).toEqual({ А: 'correct', Б: 'absent' });
  });
```

Run `yarn test keyboard-letter-states` — Expected: FAIL (current implementation always returns `{}`).

- [ ] **Step 6: Add a test for priority — correct beats present beats absent**

Add to `lib/keyboard-letter-states.test.ts`:

```ts
  it('keeps the highest-priority state when a letter appears in multiple guesses', () => {
    const guesses = [
      { letters: ['А'], states: ['absent'] as const },
      { letters: ['А'], states: ['present'] as const },
      { letters: ['А'], states: ['correct'] as const },
    ];
    expect(mergeLetterStates(guesses)).toEqual({ А: 'correct' });
  });

  it('does not downgrade a letter already marked correct', () => {
    const guesses = [
      { letters: ['А'], states: ['correct'] as const },
      { letters: ['А'], states: ['present'] as const },
    ];
    expect(mergeLetterStates(guesses)).toEqual({ А: 'correct' });
  });
```

- [ ] **Step 7: Write the full implementation**

```ts
import type { Guess, LetterState } from '../types/game';

const PRIORITY: Record<LetterState, number> = { absent: 0, present: 1, correct: 2 };

export function mergeLetterStates(guesses: Guess[]): Record<string, LetterState> {
  const result: Record<string, LetterState> = {};

  guesses.forEach((guess) => {
    guess.letters.forEach((letter, i) => {
      const state = guess.states[i];
      const existing = result[letter];
      if (!existing || PRIORITY[state] > PRIORITY[existing]) {
        result[letter] = state;
      }
    });
  });

  return result;
}
```

- [ ] **Step 8: Run all tests, confirm they pass**

```bash
yarn test keyboard-letter-states
```

Expected: PASS, 4 tests.

- [ ] **Step 9: Commit**

```bash
git add lib/keyboard-letter-states.ts lib/keyboard-letter-states.test.ts
git commit -m "feat: add keyboard letter-state aggregation"
```

---

### Task 5: Game reducer (TDD)

**Files:**
- Create: `lib/game-reducer.ts`
- Test: `lib/game-reducer.test.ts`

**Interfaces:**
- Consumes: `compareWord` from `lib/word-comparison.ts` (Task 5 of Week 1), `GameState`/`GameAction` from `types/game.ts`
- Produces: `createInitialGameState(answer): GameState`, `gameReducer(state, action): GameState` — used by Task 12 (`useGameState`)

- [ ] **Step 1: Write the first test — typing a letter appends to currentGuess**

Create `lib/game-reducer.test.ts`:

```ts
import { createInitialGameState, gameReducer } from './game-reducer';

describe('gameReducer', () => {
  it('appends a typed letter to currentGuess', () => {
    const state = createInitialGameState('зебра');
    const next = gameReducer(state, { type: 'KEY_PRESS', key: 'З' });
    expect(next.currentGuess).toBe('З');
  });
});
```

- [ ] **Step 2: Run the test, confirm it fails**

```bash
yarn test game-reducer
```

Expected: FAIL — `Cannot find module './game-reducer'`.

- [ ] **Step 3: Minimal implementation**

Create `lib/game-reducer.ts`:

```ts
import type { GameAction, GameState } from '../types/game';

export function createInitialGameState(answer: string): GameState {
  return { status: 'playing', answer, currentGuess: '', guesses: [] };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  if (action.type === 'KEY_PRESS' && action.key !== 'ENTER' && action.key !== 'DELETE') {
    return { ...state, currentGuess: state.currentGuess + action.key };
  }
  return state;
}
```

- [ ] **Step 4: Run the test, confirm it passes**

```bash
yarn test game-reducer
```

Expected: PASS.

- [ ] **Step 5: Add tests for DELETE, ignoring extra letters, and ENTER-too-short**

Add to `lib/game-reducer.test.ts`:

```ts
  it('removes the last letter on DELETE', () => {
    let state = createInitialGameState('зебра');
    state = gameReducer(state, { type: 'KEY_PRESS', key: 'З' });
    state = gameReducer(state, { type: 'KEY_PRESS', key: 'Е' });
    state = gameReducer(state, { type: 'KEY_PRESS', key: 'DELETE' });
    expect(state.currentGuess).toBe('З');
  });

  it('ignores letters once currentGuess already has 5 characters', () => {
    let state = createInitialGameState('зебра');
    'ЗЕБРА'.split('').forEach((letter) => {
      state = gameReducer(state, { type: 'KEY_PRESS', key: letter });
    });
    state = gameReducer(state, { type: 'KEY_PRESS', key: 'Х' });
    expect(state.currentGuess).toBe('ЗЕБРА');
  });

  it('does nothing on ENTER when currentGuess is shorter than 5 letters', () => {
    let state = createInitialGameState('зебра');
    state = gameReducer(state, { type: 'KEY_PRESS', key: 'З' });
    state = gameReducer(state, { type: 'KEY_PRESS', key: 'ENTER' });
    expect(state.currentGuess).toBe('З');
    expect(state.guesses).toHaveLength(0);
  });
```

Run `yarn test game-reducer` — Expected: two failures (DELETE and the 5-char cap aren't implemented yet; the too-short ENTER test already passes since ENTER is currently a no-op).

- [ ] **Step 6: Implement DELETE and the 5-char cap**

Replace the implementation in `lib/game-reducer.ts`:

```ts
import type { GameAction, GameState } from '../types/game';

const WORD_LENGTH = 5;

export function createInitialGameState(answer: string): GameState {
  return { status: 'playing', answer, currentGuess: '', guesses: [] };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  if (action.type === 'HYDRATE') {
    return action.state;
  }

  if (state.status !== 'playing') {
    return state;
  }

  if (action.key === 'DELETE') {
    return { ...state, currentGuess: state.currentGuess.slice(0, -1) };
  }

  if (action.key === 'ENTER') {
    return state;
  }

  if (state.currentGuess.length >= WORD_LENGTH) {
    return state;
  }

  return { ...state, currentGuess: state.currentGuess + action.key };
}
```

- [ ] **Step 7: Run all tests, confirm they pass**

```bash
yarn test game-reducer
```

Expected: PASS, 4 tests.

- [ ] **Step 8: Add a test for a winning ENTER**

Add to `lib/game-reducer.test.ts`:

```ts
  it('marks the game won when a 5-letter guess matches the answer', () => {
    let state = createInitialGameState('зебра');
    'ЗЕБРА'.split('').forEach((letter) => {
      state = gameReducer(state, { type: 'KEY_PRESS', key: letter });
    });
    state = gameReducer(state, { type: 'KEY_PRESS', key: 'ENTER' });
    expect(state.status).toBe('won');
    expect(state.currentGuess).toBe('');
    expect(state.guesses).toEqual([
      { letters: ['З', 'Е', 'Б', 'Р', 'А'], states: ['correct', 'correct', 'correct', 'correct', 'correct'] },
    ]);
  });
```

Run `yarn test game-reducer` — Expected: FAIL (ENTER is still a no-op).

- [ ] **Step 9: Implement ENTER**

Replace the ENTER branch in `lib/game-reducer.ts`:

```ts
import { compareWord } from './word-comparison';
import type { GameAction, GameState } from '../types/game';

const WORD_LENGTH = 5;
const MAX_GUESSES = 6;

export function createInitialGameState(answer: string): GameState {
  return { status: 'playing', answer, currentGuess: '', guesses: [] };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  if (action.type === 'HYDRATE') {
    return action.state;
  }

  if (state.status !== 'playing') {
    return state;
  }

  if (action.key === 'DELETE') {
    return { ...state, currentGuess: state.currentGuess.slice(0, -1) };
  }

  if (action.key === 'ENTER') {
    if (state.currentGuess.length !== WORD_LENGTH) {
      return state;
    }

    const letters = state.currentGuess.split('');
    const guessStates = compareWord(state.currentGuess.toLowerCase(), state.answer);
    const guesses = [...state.guesses, { letters, states: guessStates }];
    const won = guessStates.every((letterState) => letterState === 'correct');
    const lost = !won && guesses.length >= MAX_GUESSES;

    return {
      ...state,
      guesses,
      currentGuess: '',
      status: won ? 'won' : lost ? 'lost' : 'playing',
    };
  }

  if (state.currentGuess.length >= WORD_LENGTH) {
    return state;
  }

  return { ...state, currentGuess: state.currentGuess + action.key };
}
```

- [ ] **Step 10: Run all tests, confirm they pass**

```bash
yarn test game-reducer
```

Expected: PASS, 5 tests.

- [ ] **Step 11: Add tests for losing and for post-game no-ops**

Add to `lib/game-reducer.test.ts`:

```ts
  it('marks the game lost after 6 wrong guesses', () => {
    let state = createInitialGameState('зебра');
    for (let i = 0; i < 6; i++) {
      'ЛИМОН'.split('').forEach((letter) => {
        state = gameReducer(state, { type: 'KEY_PRESS', key: letter });
      });
      state = gameReducer(state, { type: 'KEY_PRESS', key: 'ENTER' });
    }
    expect(state.status).toBe('lost');
    expect(state.guesses).toHaveLength(6);
  });

  it('ignores further key presses once the game is won', () => {
    let state = createInitialGameState('зебра');
    'ЗЕБРА'.split('').forEach((letter) => {
      state = gameReducer(state, { type: 'KEY_PRESS', key: letter });
    });
    state = gameReducer(state, { type: 'KEY_PRESS', key: 'ENTER' });
    const afterWin = state;
    state = gameReducer(state, { type: 'KEY_PRESS', key: 'А' });
    expect(state).toBe(afterWin);
  });
```

- [ ] **Step 12: Run all tests, confirm they pass**

```bash
yarn test game-reducer
```

Expected: PASS, 7 tests.

- [ ] **Step 13: Commit**

```bash
git add lib/game-reducer.ts lib/game-reducer.test.ts
git commit -m "feat: add game reducer with win/lose detection"
```

---

### Task 6: Stats (TDD)

**Files:**
- Create: `lib/stats.ts`
- Test: `lib/stats.test.ts`

**Interfaces:**
- Consumes: `Stats` from `types/game.ts`
- Produces: `createInitialStats(): Stats`, `updateStats(prev, won, guessCount): Stats` — used by Task 12 (`useGameState`)

- [ ] **Step 1: Write the first test — a win updates every field**

Create `lib/stats.test.ts`:

```ts
import { createInitialStats, updateStats } from './stats';

describe('updateStats', () => {
  it('records a win in 3 guesses', () => {
    const next = updateStats(createInitialStats(), true, 3);
    expect(next).toEqual({
      gamesPlayed: 1,
      gamesWon: 1,
      currentStreak: 1,
      maxStreak: 1,
      guessDistribution: [0, 0, 1, 0, 0, 0],
    });
  });
});
```

- [ ] **Step 2: Run the test, confirm it fails**

```bash
yarn test stats
```

Expected: FAIL — `Cannot find module './stats'`.

- [ ] **Step 3: Implementation**

Create `lib/stats.ts`:

```ts
import type { Stats } from '../types/game';

export function createInitialStats(): Stats {
  return {
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak: 0,
    maxStreak: 0,
    guessDistribution: [0, 0, 0, 0, 0, 0],
  };
}

export function updateStats(prev: Stats, won: boolean, guessCount: number): Stats {
  const gamesPlayed = prev.gamesPlayed + 1;

  if (!won) {
    return { ...prev, gamesPlayed, currentStreak: 0 };
  }

  const currentStreak = prev.currentStreak + 1;
  const guessDistribution = [...prev.guessDistribution] as Stats['guessDistribution'];
  guessDistribution[guessCount - 1] += 1;

  return {
    gamesPlayed,
    gamesWon: prev.gamesWon + 1,
    currentStreak,
    maxStreak: Math.max(prev.maxStreak, currentStreak),
    guessDistribution,
  };
}
```

- [ ] **Step 4: Run the test, confirm it passes**

```bash
yarn test stats
```

Expected: PASS.

- [ ] **Step 5: Add tests for a loss and for maxStreak surviving a later loss**

Add to `lib/stats.test.ts`:

```ts
  it('resets currentStreak on a loss without touching guessDistribution', () => {
    const afterWin = updateStats(createInitialStats(), true, 2);
    const afterLoss = updateStats(afterWin, false, 6);
    expect(afterLoss).toEqual({
      gamesPlayed: 2,
      gamesWon: 1,
      currentStreak: 0,
      maxStreak: 1,
      guessDistribution: [0, 1, 0, 0, 0, 0],
    });
  });

  it('keeps maxStreak after currentStreak drops', () => {
    let stats = createInitialStats();
    stats = updateStats(stats, true, 1);
    stats = updateStats(stats, true, 1);
    stats = updateStats(stats, false, 6);
    expect(stats.maxStreak).toBe(2);
    expect(stats.currentStreak).toBe(0);
  });
```

- [ ] **Step 6: Run all tests, confirm they pass**

```bash
yarn test stats
```

Expected: PASS, 3 tests.

- [ ] **Step 7: Commit**

```bash
git add lib/stats.ts lib/stats.test.ts
git commit -m "feat: add stats tracking"
```

---

### Task 7: Share text (TDD)

**Files:**
- Create: `lib/share-text.ts`
- Test: `lib/share-text.test.ts`

**Interfaces:**
- Consumes: `LetterState` from `types/game.ts`
- Produces: `buildShareText(guesses, dayIndex, won): string` — used by Task 13 (`GameScreen`)

- [ ] **Step 1: Write the first test — a win header and emoji grid**

Create `lib/share-text.test.ts`:

```ts
import { buildShareText } from './share-text';

describe('buildShareText', () => {
  it('builds a win header with the guess count and an emoji grid', () => {
    const guesses = [
      { states: ['absent', 'present', 'absent', 'absent', 'absent'] as const },
      { states: ['correct', 'correct', 'correct', 'correct', 'correct'] as const },
    ];
    expect(buildShareText(guesses, 1, true)).toBe('Wordle UA #1 2/6\n\n⬛🟨⬛⬛⬛\n🟩🟩🟩🟩🟩');
  });
});
```

- [ ] **Step 2: Run the test, confirm it fails**

```bash
yarn test share-text
```

Expected: FAIL — `Cannot find module './share-text'`.

- [ ] **Step 3: Implementation**

Create `lib/share-text.ts`:

```ts
import type { LetterState } from '../types/game';

const EMOJI: Record<LetterState, string> = {
  correct: '🟩',
  present: '🟨',
  absent: '⬛',
};

export function buildShareText(
  guesses: { states: LetterState[] }[],
  dayIndex: number,
  won: boolean,
): string {
  const header = `Wordle UA #${dayIndex} ${won ? guesses.length : 'X'}/6`;
  const grid = guesses.map((guess) => guess.states.map((state) => EMOJI[state]).join('')).join('\n');
  return `${header}\n\n${grid}`;
}
```

- [ ] **Step 4: Run the test, confirm it passes**

```bash
yarn test share-text
```

Expected: PASS.

- [ ] **Step 5: Add a test for a loss header**

Add to `lib/share-text.test.ts`:

```ts
  it('builds an X/6 header on a loss', () => {
    const guesses = [{ states: ['absent', 'absent', 'absent', 'absent', 'absent'] as const }];
    expect(buildShareText(guesses, 5, false)).toBe('Wordle UA #5 X/6\n\n⬛⬛⬛⬛⬛');
  });
```

- [ ] **Step 6: Run all tests, confirm they pass**

```bash
yarn test share-text
```

Expected: PASS, 2 tests.

- [ ] **Step 7: Commit**

```bash
git add lib/share-text.ts lib/share-text.test.ts
git commit -m "feat: add share text generation"
```

---

### Task 8: Storage wrapper (TDD against the AsyncStorage mock)

**Files:**
- Create: `lib/storage.ts`
- Test: `lib/storage.test.ts`

**Interfaces:**
- Consumes: `@react-native-async-storage/async-storage`, `GameState`/`Stats` from `types/game.ts`
- Produces: `loadStats`, `saveStats`, `loadDailyGame`, `saveDailyGame` — used by Task 12 (`useGameState`)

- [ ] **Step 1: Write the first test — no stats saved yet**

Create `lib/storage.test.ts`:

```ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadStats, saveStats } from './storage';

describe('storage', () => {
  afterEach(async () => {
    await AsyncStorage.clear();
  });

  it('returns null when no stats have been saved', async () => {
    expect(await loadStats()).toBeNull();
  });
});
```

- [ ] **Step 2: Run the test, confirm it fails**

```bash
yarn test storage
```

Expected: FAIL — `Cannot find module './storage'`.

- [ ] **Step 3: Implementation**

Create `lib/storage.ts`:

```ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { GameState, Stats } from '../types/game';

const STATS_KEY = 'wordle-ukr:stats';
const DAILY_GAME_KEY = 'wordle-ukr:daily-game';

export async function loadStats(): Promise<Stats | null> {
  const raw = await AsyncStorage.getItem(STATS_KEY);
  return raw ? (JSON.parse(raw) as Stats) : null;
}

export async function saveStats(stats: Stats): Promise<void> {
  await AsyncStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

export async function loadDailyGame(): Promise<{ date: string; state: GameState } | null> {
  const raw = await AsyncStorage.getItem(DAILY_GAME_KEY);
  return raw ? (JSON.parse(raw) as { date: string; state: GameState }) : null;
}

export async function saveDailyGame(date: string, state: GameState): Promise<void> {
  await AsyncStorage.setItem(DAILY_GAME_KEY, JSON.stringify({ date, state }));
}
```

- [ ] **Step 4: Run the test, confirm it passes**

```bash
yarn test storage
```

Expected: PASS.

- [ ] **Step 5: Add round-trip tests for stats and the daily game**

Add to `lib/storage.test.ts`:

```ts
import { loadDailyGame, saveDailyGame } from './storage';
import { createInitialGameState } from './game-reducer';

  it('saves and loads stats', async () => {
    const stats = {
      gamesPlayed: 1,
      gamesWon: 1,
      currentStreak: 1,
      maxStreak: 1,
      guessDistribution: [0, 1, 0, 0, 0, 0] as const,
    };
    await saveStats(stats);
    expect(await loadStats()).toEqual(stats);
  });

  it('saves and loads the daily game keyed by date', async () => {
    const state = createInitialGameState('зебра');
    await saveDailyGame('2026-08-31', state);
    expect(await loadDailyGame()).toEqual({ date: '2026-08-31', state });
  });

  it('returns null when no daily game has been saved', async () => {
    expect(await loadDailyGame()).toBeNull();
  });
```

- [ ] **Step 6: Run all tests, confirm they pass**

```bash
yarn test storage
```

Expected: PASS, 4 tests.

- [ ] **Step 7: Commit**

```bash
git add lib/storage.ts lib/storage.test.ts
git commit -m "feat: add AsyncStorage wrapper for stats and daily game"
```

---

### Task 9: Tile flip animation

**Files:**
- Modify: `components/grid/Tile.tsx`
- Modify: `components/grid/Grid.tsx`
- Modify: `components/grid/Tile.test.tsx`

**Interfaces:**
- Produces: `<Tile letter state revealDelay?: number>` — `revealDelay` used by `Grid` (stagger per column)

- [ ] **Step 1: Add a test for the no-animation case (unchanged behavior)**

`components/grid/Tile.test.tsx` already covers static rendering — confirm it still passes after the changes below, no new assertions needed for this step.

- [ ] **Step 2: Rewrite the component with the flip**

```tsx
// components/grid/Tile.tsx
import { useEffect, useRef, useState } from 'react';
import { Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import type { LetterState } from '../../types/game';
import { tileStyles } from './Tile.styles';

type TileProps = {
  letter: string;
  state: LetterState | 'empty';
  revealDelay?: number;
};

export function Tile({ letter, state, revealDelay = 0 }: TileProps) {
  const [displayState, setDisplayState] = useState(state);
  const rotation = useSharedValue(0);
  const prevState = useRef(state);

  useEffect(() => {
    const wasEmpty = prevState.current === 'empty';
    prevState.current = state;

    if (wasEmpty && state !== 'empty') {
      rotation.value = withDelay(revealDelay, withTiming(180, { duration: 250 }));
      const timeout = setTimeout(() => setDisplayState(state), revealDelay + 125);
      return () => clearTimeout(timeout);
    }

    setDisplayState(state);
  }, [state, revealDelay, rotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotateX: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View
      style={animatedStyle}
      className={`${tileStyles.base} ${tileStyles.states[displayState]}`}
    >
      <Text className={tileStyles.text}>{letter}</Text>
    </Animated.View>
  );
}
```

- [ ] **Step 3: Run the existing Tile test, confirm it still passes**

```bash
yarn test Tile
```

Expected: PASS — mounting with a non-`'empty'` state never enters the animated branch (`prevState.current` starts equal to `state`), so the tile renders immediately, same as before.

- [ ] **Step 4: Wire `revealDelay` from Grid**

In `components/grid/Grid.tsx`, change the `Tile` usage inside the row-rendering `map`:

```tsx
          {row.letters.map((letter, colIndex) => (
            <Tile
              key={colIndex}
              letter={letter}
              state={row.states[colIndex]}
              revealDelay={colIndex * 150}
            />
          ))}
```

- [ ] **Step 5: Run the Grid test, confirm it still passes**

```bash
yarn test Grid
```

Expected: PASS (the prop addition doesn't affect the existing assertions).

- [ ] **Step 6: Commit**

```bash
git add components/grid/Tile.tsx components/grid/Grid.tsx components/grid/Tile.test.tsx
git commit -m "feat: add tile flip reveal animation"
```

---

### Task 10: Keyboard letter coloring

**Files:**
- Modify: `components/keyboard/Key.tsx`
- Modify: `components/keyboard/Key.styles.ts`
- Modify: `components/keyboard/Key.test.tsx`
- Modify: `components/keyboard/Keyboard.tsx`
- Modify: `components/keyboard/Keyboard.test.tsx`

**Interfaces:**
- Consumes: `LetterState` from `types/game.ts`, `mergeLetterStates` output shape from Task 4
- Produces: `<Key state?: LetterState>`, `<Keyboard letterStates?: Record<string, LetterState>>` — used by Task 13 (`GameScreen`)

- [ ] **Step 1: Add a failing test for Key's colored state**

Add to `components/keyboard/Key.test.tsx`:

```ts
import { render, screen } from '@testing-library/react-native';

  it('applies the correct-state background class when a state is given', async () => {
    await render(<Key label="А" onPress={() => {}} state="correct" />);
    const key = screen.getByText('А').parent;
    expect(key?.props.className).toContain('bg-green-600');
  });
```

- [ ] **Step 2: Run the test, confirm it fails**

```bash
yarn test Key
```

Expected: FAIL — `Key` doesn't accept a `state` prop yet.

- [ ] **Step 3: Update `Key.styles.ts`**

```ts
// components/keyboard/Key.styles.ts
export const keyStyles = {
  base: 'h-12 rounded items-center justify-center px-1',
  wide: 'flex-[1.5]',
  narrow: 'flex-1',
  text: 'text-sm font-semibold',
  states: {
    default: { bg: 'bg-gray-300', text: 'text-black' },
    correct: { bg: 'bg-green-600', text: 'text-white' },
    present: { bg: 'bg-yellow-500', text: 'text-white' },
    absent: { bg: 'bg-gray-500', text: 'text-white' },
  },
};
```

- [ ] **Step 4: Update `Key.tsx`**

```tsx
// components/keyboard/Key.tsx
import { Pressable, Text } from 'react-native';
import type { LetterState } from '../../types/game';
import { keyStyles } from './Key.styles';

type KeyProps = {
  label: string;
  onPress: () => void;
  wide?: boolean;
  state?: LetterState;
};

export function Key({ label, onPress, wide = false, state }: KeyProps) {
  const colors = state ? keyStyles.states[state] : keyStyles.states.default;

  return (
    <Pressable
      onPress={onPress}
      className={`${keyStyles.base} ${wide ? keyStyles.wide : keyStyles.narrow} ${colors.bg}`}
    >
      <Text className={`${keyStyles.text} ${colors.text}`}>{label}</Text>
    </Pressable>
  );
}
```

- [ ] **Step 5: Run the test, confirm it passes**

```bash
yarn test Key
```

Expected: PASS, 2 tests.

- [ ] **Step 6: Add a failing test for Keyboard passing states down**

Add to `components/keyboard/Keyboard.test.tsx`:

```ts
  it('colors a key according to the given letterStates', async () => {
    const onKeyPress = jest.fn();
    await render(<Keyboard onKeyPress={onKeyPress} letterStates={{ А: 'correct' }} />);
    const key = screen.getByText('А').parent;
    expect(key?.props.className).toContain('bg-green-600');
  });
```

- [ ] **Step 7: Run the test, confirm it fails**

```bash
yarn test Keyboard
```

Expected: FAIL — `Keyboard` doesn't accept `letterStates` yet.

- [ ] **Step 8: Update `Keyboard.tsx`**

```tsx
// components/keyboard/Keyboard.tsx
import { View } from 'react-native';
import { Key } from './Key';
import { keyboardStyles } from './Keyboard.styles';
import type { LetterState } from '../../types/game';

const ROWS = [
  ['Й', 'Ц', 'У', 'К', 'Е', 'Н', 'Г', 'Ш', 'Щ', 'З', 'Х'],
  ['Ф', 'І', 'В', 'А', 'П', 'Р', 'О', 'Л', 'Д', 'Ж', 'Є'],
  ['ENTER', 'Я', 'Ч', 'С', 'М', 'И', 'Т', 'Ь', 'Б', 'Ю', 'DELETE'],
];

type KeyboardProps = {
  onKeyPress: (key: string) => void;
  letterStates?: Record<string, LetterState>;
};

export function Keyboard({ onKeyPress, letterStates = {} }: KeyboardProps) {
  return (
    <View className={keyboardStyles.container}>
      {ROWS.map((row, rowIndex) => (
        <View key={rowIndex} className={keyboardStyles.row}>
          {row.map((label) => (
            <Key
              key={label}
              label={label}
              onPress={() => onKeyPress(label)}
              wide={label === 'ENTER' || label === 'DELETE'}
              state={letterStates[label]}
            />
          ))}
        </View>
      ))}
    </View>
  );
}
```

- [ ] **Step 9: Run all tests, confirm they pass**

```bash
yarn test Keyboard
```

Expected: PASS, 3 tests.

- [ ] **Step 10: Commit**

```bash
git add components/keyboard/Key.tsx components/keyboard/Key.styles.ts components/keyboard/Key.test.tsx components/keyboard/Keyboard.tsx components/keyboard/Keyboard.test.tsx
git commit -m "feat: color keyboard keys by letter state"
```

---

### Task 11: Result modal

**Files:**
- Create: `components/modal/ResultModal.tsx`
- Create: `components/modal/ResultModal.styles.ts`
- Test: `components/modal/ResultModal.test.tsx`

**Interfaces:**
- Consumes: `Stats` from `types/game.ts`
- Produces: `<ResultModal visible won stats onShare onClose>` — used by Task 13 (`GameScreen`)

- [ ] **Step 1: Write a smoke test**

Create `components/modal/ResultModal.test.tsx`:

```tsx
import { render, screen, fireEvent } from '@testing-library/react-native';
import { ResultModal } from './ResultModal';

const stats = {
  gamesPlayed: 4,
  gamesWon: 3,
  currentStreak: 2,
  maxStreak: 2,
  guessDistribution: [0, 1, 2, 0, 0, 0] as const,
};

describe('ResultModal', () => {
  it('shows a win headline and calls onShare when the share button is pressed', async () => {
    const onShare = jest.fn();
    await render(
      <ResultModal visible won stats={stats} onShare={onShare} onClose={() => {}} />,
    );
    expect(screen.getByText('Перемога!')).toBeTruthy();
    fireEvent.press(screen.getByText('Поділитись'));
    expect(onShare).toHaveBeenCalledTimes(1);
  });

  it('shows a lose headline when won is false', async () => {
    await render(
      <ResultModal visible won={false} stats={stats} onShare={() => {}} onClose={() => {}} />,
    );
    expect(screen.getByText('Гра закінчена')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run the test, confirm it fails**

```bash
yarn test ResultModal
```

Expected: FAIL — `Cannot find module './ResultModal'`.

- [ ] **Step 3: Create the styles**

```ts
// components/modal/ResultModal.styles.ts
export const resultModalStyles = {
  backdrop: 'flex-1 items-center justify-center bg-black/50',
  card: 'w-11/12 max-w-sm rounded-lg bg-white p-6',
  headline: 'text-2xl font-bold text-center mb-4',
  statsRow: 'flex-row justify-between mb-4',
  statItem: 'items-center',
  statValue: 'text-2xl font-bold',
  statLabel: 'text-xs text-gray-500',
  distribution: 'mb-4',
  distributionRow: 'flex-row items-center mb-1',
  distributionLabel: 'w-4 text-xs',
  distributionBar: 'bg-green-600 justify-end px-1 min-h-[18px]',
  distributionCount: 'text-white text-xs font-semibold',
  shareButton: 'bg-green-600 rounded py-3 items-center',
  shareButtonText: 'text-white font-bold',
};
```

- [ ] **Step 4: Create the component**

```tsx
// components/modal/ResultModal.tsx
import { Modal, View, Text, Pressable } from 'react-native';
import type { Stats } from '../../types/game';
import { resultModalStyles } from './ResultModal.styles';

type ResultModalProps = {
  visible: boolean;
  won: boolean;
  stats: Stats;
  onShare: () => void;
  onClose: () => void;
};

export function ResultModal({ visible, won, stats, onShare, onClose }: ResultModalProps) {
  const winPercent = stats.gamesPlayed === 0 ? 0 : Math.round((stats.gamesWon / stats.gamesPlayed) * 100);
  const maxCount = Math.max(...stats.guessDistribution, 1);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className={resultModalStyles.backdrop}>
        <View className={resultModalStyles.card}>
          <Text className={resultModalStyles.headline}>{won ? 'Перемога!' : 'Гра закінчена'}</Text>

          <View className={resultModalStyles.statsRow}>
            <StatItem label="Ігор" value={stats.gamesPlayed} />
            <StatItem label="% перемог" value={winPercent} />
            <StatItem label="Серія" value={stats.currentStreak} />
            <StatItem label="Макс. серія" value={stats.maxStreak} />
          </View>

          <View className={resultModalStyles.distribution}>
            {stats.guessDistribution.map((count, i) => (
              <View key={i} className={resultModalStyles.distributionRow}>
                <Text className={resultModalStyles.distributionLabel}>{i + 1}</Text>
                <View
                  className={resultModalStyles.distributionBar}
                  style={{ width: `${Math.max((count / maxCount) * 100, 8)}%` }}
                >
                  <Text className={resultModalStyles.distributionCount}>{count}</Text>
                </View>
              </View>
            ))}
          </View>

          <Pressable onPress={onShare} className={resultModalStyles.shareButton}>
            <Text className={resultModalStyles.shareButtonText}>Поділитись</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function StatItem({ label, value }: { label: string; value: number }) {
  return (
    <View className={resultModalStyles.statItem}>
      <Text className={resultModalStyles.statValue}>{value}</Text>
      <Text className={resultModalStyles.statLabel}>{label}</Text>
    </View>
  );
}
```

- [ ] **Step 5: Run the test, confirm it passes**

```bash
yarn test ResultModal
```

Expected: PASS, 2 tests.

- [ ] **Step 6: Commit**

```bash
git add components/modal/ResultModal.tsx components/modal/ResultModal.styles.ts components/modal/ResultModal.test.tsx
git commit -m "feat: add result modal with stats and share"
```

---

### Task 12: `useGameState` hook

**Files:**
- Create: `hooks/useGameState.ts`
- Test: `hooks/useGameState.test.ts`

**Interfaces:**
- Consumes: `WORDS` (`data/words.ts`), `getTodayWord` (Task 3), `gameReducer`/`createInitialGameState` (Task 5), `mergeLetterStates` (Task 4), `createInitialStats`/`updateStats` (Task 6), `loadDailyGame`/`saveDailyGame`/`loadStats`/`saveStats` (Task 8)
- Produces: `useGameState(): { state: GameState; stats: Stats; letterStates: Record<string, LetterState>; handleKeyPress: (key: string) => void }` — used by Task 13 (`GameScreen`)

- [ ] **Step 1: Write a test for the initial answer, using a fixed date**

Create `hooks/useGameState.test.ts`:

```ts
import { renderHook, waitFor } from '@testing-library/react-native';
import { EPOCH_DATE } from '../lib/daily-word';
import { useGameState } from './useGameState';

describe('useGameState', () => {
  const RealDate = Date;

  beforeEach(() => {
    // Freeze "today" to the epoch date so the daily word is deterministic (WORDS[0]).
    global.Date = class extends RealDate {
      constructor(...args: unknown[]) {
        if (args.length === 0) {
          super(EPOCH_DATE.getTime());
          return;
        }
        // @ts-expect-error -- forwarding a variable-length constructor call
        super(...args);
      }
    } as DateConstructor;
  });

  afterEach(() => {
    global.Date = RealDate;
  });

  it('starts a game against the daily word', async () => {
    const { result } = renderHook(() => useGameState());
    await waitFor(() => expect(result.current.state.answer).toBe('зебра'));
    expect(result.current.state.status).toBe('playing');
    expect(result.current.stats.gamesPlayed).toBe(0);
  });
});
```

- [ ] **Step 2: Run the test, confirm it fails**

```bash
yarn test useGameState
```

Expected: FAIL — `Cannot find module './useGameState'`.

- [ ] **Step 3: Implementation**

Create `hooks/useGameState.ts`:

```ts
import { useEffect, useReducer, useState } from 'react';
import { WORDS } from '../data/words';
import { getTodayWord } from '../lib/daily-word';
import { createInitialGameState, gameReducer } from '../lib/game-reducer';
import { mergeLetterStates } from '../lib/keyboard-letter-states';
import { createInitialStats, updateStats } from '../lib/stats';
import { loadDailyGame, loadStats, saveDailyGame, saveStats } from '../lib/storage';
import type { Stats } from '../types/game';

function todayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

export function useGameState() {
  const [today] = useState(() => new Date());
  const [state, dispatch] = useReducer(gameReducer, getTodayWord(WORDS, today), createInitialGameState);
  const [stats, setStats] = useState<Stats>(createInitialStats());
  const [hydrated, setHydrated] = useState(false);
  const [statsRecorded, setStatsRecorded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const [savedGame, savedStats] = await Promise.all([loadDailyGame(), loadStats()]);
      if (cancelled) return;
      if (savedStats) setStats(savedStats);
      if (savedGame && savedGame.date === todayKey(today)) {
        dispatch({ type: 'HYDRATE', state: savedGame.state });
      }
      setHydrated(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [today]);

  useEffect(() => {
    if (!hydrated) return;
    saveDailyGame(todayKey(today), state);
  }, [state, hydrated, today]);

  useEffect(() => {
    if (state.status === 'playing' || statsRecorded) return;
    const won = state.status === 'won';
    const next = updateStats(stats, won, state.guesses.length);
    setStats(next);
    saveStats(next);
    setStatsRecorded(true);
    // stats is intentionally omitted from deps: this effect must run exactly once per
    // status transition away from 'playing', not re-run when setStats updates `stats`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status, statsRecorded]);

  return {
    state,
    stats,
    letterStates: mergeLetterStates(state.guesses),
    handleKeyPress: (key: string) => dispatch({ type: 'KEY_PRESS', key }),
  };
}
```

Note: `useReducer(gameReducer, getTodayWord(WORDS, today), createInitialGameState)` uses React's lazy-init form — the second argument (`getTodayWord(...)`) is passed to `createInitialGameState` once, on the first render, rather than calling `getTodayWord` on every render.

- [ ] **Step 4: Run the test, confirm it passes**

```bash
yarn test useGameState
```

Expected: PASS.

- [ ] **Step 5: Add a test for a full win updating stats after hydration**

Add to `hooks/useGameState.test.ts`:

```ts
import { act } from '@testing-library/react-native';

  it('records a win in stats once the game is won', async () => {
    const { result } = renderHook(() => useGameState());
    await waitFor(() => expect(result.current.state.status).toBe('playing'));

    await act(async () => {
      'ЗЕБРА'.split('').forEach((letter) => result.current.handleKeyPress(letter));
      result.current.handleKeyPress('ENTER');
    });

    await waitFor(() => expect(result.current.state.status).toBe('won'));
    await waitFor(() => expect(result.current.stats.gamesWon).toBe(1));
  });
```

- [ ] **Step 6: Run all tests, confirm they pass**

```bash
yarn test useGameState
```

Expected: PASS, 2 tests.

- [ ] **Step 7: Commit**

```bash
git add hooks/useGameState.ts hooks/useGameState.test.ts
git commit -m "feat: add useGameState hook"
```

---

### Task 13: Wire GameScreen together

**Files:**
- Modify: `screens/game/GameScreen.tsx`

**Interfaces:**
- Consumes: `useGameState` (Task 12), `Grid`/`Keyboard` (Week 1), `ResultModal` (Task 11), `buildShareText` (Task 7), `EPOCH_DATE`/`getDailyWordIndex` (Task 3)

- [ ] **Step 1: Rewrite GameScreen**

```tsx
// screens/game/GameScreen.tsx
import { Share, View } from 'react-native';
import { Grid } from '../../components/grid/Grid';
import { Keyboard } from '../../components/keyboard/Keyboard';
import { ResultModal } from '../../components/modal/ResultModal';
import { EPOCH_DATE, getDailyWordIndex } from '../../lib/daily-word';
import { buildShareText } from '../../lib/share-text';
import { useGameState } from '../../hooks/useGameState';
import { gameScreenStyles } from './GameScreen.styles';

export function GameScreen() {
  const { state, stats, letterStates, handleKeyPress } = useGameState();
  const isGameOver = state.status !== 'playing';

  const handleShare = () => {
    const dayIndex = getDailyWordIndex(new Date(), EPOCH_DATE, 1) + 1; // 1-based day number for display
    const message = buildShareText(state.guesses, dayIndex, state.status === 'won');
    Share.share({ message });
  };

  return (
    <View className={gameScreenStyles.container}>
      <Grid guesses={state.guesses} />
      <Keyboard onKeyPress={handleKeyPress} letterStates={letterStates} />
      <ResultModal
        visible={isGameOver}
        won={state.status === 'won'}
        stats={stats}
        onShare={handleShare}
        onClose={() => {}}
      />
    </View>
  );
}
```

Note on `handleShare`'s day number: `getDailyWordIndex(today, EPOCH_DATE, 1)` with `wordCount = 1` always returns `0` (everything mod 1 is 0) — that's a bug, not a real day counter. Fix it before using: what we actually want is the raw day difference, not a modulo-wrapped index. Add a small helper instead.

- [ ] **Step 2: Add a day-number helper to `lib/daily-word.ts`, with a test**

Add to `lib/daily-word.test.ts`:

```ts
import { getDayNumber } from './daily-word';

describe('getDayNumber', () => {
  it('returns 1 on the epoch date (day 1, not day 0)', () => {
    expect(getDayNumber(EPOCH_DATE, EPOCH_DATE)).toBe(1);
  });

  it('returns 2 the day after the epoch', () => {
    const today = new Date(2026, 8, 1);
    expect(getDayNumber(today, EPOCH_DATE)).toBe(2);
  });
});
```

Run `yarn test daily-word` — Expected: FAIL — `getDayNumber` doesn't exist yet.

Add to `lib/daily-word.ts` (reusing the existing private `toLocalDayNumber`):

```ts
export function getDayNumber(today: Date, epoch: Date = EPOCH_DATE): number {
  return toLocalDayNumber(today) - toLocalDayNumber(epoch) + 1;
}
```

Run `yarn test daily-word` again — Expected: PASS, 6 tests total.

- [ ] **Step 3: Fix `handleShare` to use `getDayNumber`**

```tsx
  const handleShare = () => {
    const dayNumber = getDayNumber(new Date());
    const message = buildShareText(state.guesses, dayNumber, state.status === 'won');
    Share.share({ message });
  };
```

Update the import line accordingly:

```tsx
import { getDayNumber } from '../../lib/daily-word';
```

- [ ] **Step 4: Check the TypeScript build**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Run the full test suite and lint**

```bash
yarn test
yarn lint
```

Expected: all tests pass, lint reports no errors.

- [ ] **Step 6: Manually verify a full playthrough on the iOS simulator**

```bash
RCT_METRO_PORT=8090 npx expo run:ios --port 8090
```

(Metro must already be running on 8090, or this command starts it — see the Week 1 notes on the `RCTMetroPort`/`8081` port conflict if this environment still has another project occupying 8081.)

On the simulator:
- Type a 5-letter guess and press ENTER — confirm the row flips tile-by-tile and the keyboard keys recolor
- Play until win or loss — confirm the result modal appears with correct stats (first game: 1 played, streak matches win/loss)
- Press "Поділитись" — confirm the OS share sheet opens with the expected emoji-grid text
- Force-quit and reopen the app the same day — confirm the in-progress or finished game state is restored, not reset

- [ ] **Step 7: Commit**

```bash
git add screens/game/GameScreen.tsx lib/daily-word.ts lib/daily-word.test.ts
git commit -m "feat: wire game screen with reducer, stats modal, and sharing"
```

---

## Done when

- `yarn test` — all tests pass (daily-word, keyboard-letter-states, game-reducer, stats, share-text, storage, Tile, Grid, Key, Keyboard, ResultModal, useGameState)
- `yarn lint` — no errors
- `npx tsc --noEmit` — no errors
- Manually verified on the iOS simulator per Task 13, Step 6
