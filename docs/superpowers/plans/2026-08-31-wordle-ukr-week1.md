# Wordle UA — Week 1 Implementation Plan

> **For implementers:** Follow this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Lay the foundation for Wordle UA — a configured Expo project with navigation, a static UI for the 6×5 grid and keyboard, and tested (TDD) word comparison logic.

**Architecture:** Expo + TypeScript, React Navigation (NativeStack), NativeWind for styles (kept in separate `*.styles.ts` files), Jest + RNTL for tests. Pure word comparison logic lives in `lib/`, with no React dependency — tested first via TDD. Components are static this week, with no game state.

**Tech Stack:** Expo SDK (latest), TypeScript, yarn, React Navigation, NativeWind, Jest (jest-expo preset), React Native Testing Library, ESLint (eslint-config-expo), Prettier.

**Spec:** `docs/superpowers/specs/2026-08-31-wordle-ukr-week1-design.md`

## Global Constraints

- Package manager: yarn (not npm/pnpm)
- All styles in separate `*.styles.ts` files next to the component — never inline `className` in JSX
- PascalCase for component files, kebab-case for everything else (lib, data, types)
- TDD: a test before the implementation for everything in `lib/`
- No backend, no game state, no animations — all of that is Week 2
- Every task ends with a commit

---

### Task 1: Project initialization

**Files:**
- Create: the whole `create-expo-app` scaffold (blank-typescript template)
- Create: `.gitignore` (from the Expo template)

**Interfaces:**
- Produces: a base Expo project that runs via `yarn start`

- [ ] **Step 1: Create the project**

```bash
cd /Users/admin/AI-projects
yarn create expo-app wordle-ukr --template blank-typescript
```

If the command asks to overwrite the existing directory (it already has `CLAUDE.md`, `docs/`, `tmp/`) — confirm; it won't touch those files, only add the missing ones.

- [ ] **Step 2: Verify CLAUDE.md, docs/, tmp/ are still there**

```bash
cd /Users/admin/AI-projects/wordle-ukr
ls -la
```

Expected: both `CLAUDE.md`/`docs/`/`tmp/` and the new Expo files (`App.tsx`, `app.json`, `package.json`, `.gitignore`) are present.

- [ ] **Step 3: Run the project, confirm it starts**

```bash
yarn start
```

Expected: Metro bundler comes up with no errors. Stop it (Ctrl+C) after checking.

- [ ] **Step 4: Initialize git and make the first commit on `main`**

```bash
git init
git add .
git commit -m "feat: init expo project scaffold"
```

- [ ] **Step 5: Create `develop` and a feature branch for Week 1**

```bash
git branch develop
git checkout -b feature/week1-setup develop
```

All subsequent tasks (2-12) commit to `feature/week1-setup`. At the end of Week 1 — a PR into `develop` (not `main`).

---

### Task 2: Tooling — ESLint, Prettier, Jest, RNTL

**Files:**
- Create/Modify: `.eslintrc.js` (or `eslint.config.js` depending on the Expo version)
- Create: `.prettierrc`
- Modify: `package.json` (scripts: `lint`, `test`)
- Create: `lib/sanity.test.ts` (temporary, removed at the end of the task)

**Interfaces:**
- Produces: `yarn lint`, `yarn test` — working commands for every following task

- [ ] **Step 1: Set up ESLint via Expo**

```bash
yarn expo lint
```

This creates an `eslint-config-expo` config and asks about `eslint.config.js` — accept the default options.

- [ ] **Step 2: Add Prettier**

```bash
yarn add -D prettier eslint-config-prettier
```

Create `.prettierrc`:

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all"
}
```

- [ ] **Step 3: Verify lint works**

```bash
yarn lint
```

Expected: finishes with no errors (default-template warnings are fine).

- [ ] **Step 4: Install Jest + RNTL**

```bash
yarn add -D jest jest-expo @testing-library/react-native @types/jest
```

Add to `package.json`:

```json
{
  "scripts": {
    "test": "jest"
  },
  "jest": {
    "preset": "jest-expo"
  }
}
```

- [ ] **Step 5: Write a temporary sanity test**

Create `lib/sanity.test.ts`:

```ts
test('jest harness works', () => {
  expect(1 + 1).toBe(2);
});
```

- [ ] **Step 6: Run the test, confirm it passes**

```bash
yarn test
```

Expected: PASS, 1 test.

- [ ] **Step 7: Remove the temporary test**

```bash
rm lib/sanity.test.ts
```

- [ ] **Step 8: Commit**

```bash
git add .
git commit -m "chore: setup eslint, prettier, jest, rntl"
```

---

### Task 3: NativeWind setup

**Files:**
- Create: `tailwind.config.js`
- Create: `global.css`
- Create: `nativewind-env.d.ts`
- Modify: `babel.config.js`
- Modify: `metro.config.js` (create if missing)
- Modify: `App.tsx` (add `import './global.css'`)

**Interfaces:**
- Produces: `className` available on any RN component in the project

- [ ] **Step 1: Install dependencies**

```bash
yarn add nativewind tailwindcss@^3
```

- [ ] **Step 2: Initialize Tailwind**

```bash
npx tailwindcss init
```

- [ ] **Step 3: Configure `tailwind.config.js`**

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.tsx', './screens/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

- [ ] **Step 4: Create `global.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 5: Configure `babel.config.js`**

```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
  };
};
```

- [ ] **Step 6: Create `metro.config.js`**

```js
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: './global.css' });
```

- [ ] **Step 7: Create `nativewind-env.d.ts`**

```ts
/// <reference types="nativewind/types" />
```

- [ ] **Step 8: Wire up styles in `App.tsx`**

Add as the first import line (before other imports):

```tsx
import './global.css';
```

- [ ] **Step 9: Verify className works**

Temporarily add an element with `className="bg-red-500"` in `App.tsx`, run `yarn start`, open it in Expo Go/a simulator, confirm the background is red. Remove the temporary change afterward.

- [ ] **Step 10: Commit**

```bash
git add .
git commit -m "feat: setup nativewind"
```

---

### Task 4: Game types (`types/game.ts`)

**Files:**
- Create: `types/game.ts`

**Interfaces:**
- Produces: `LetterState`, `GuessResult` — used in Task 5 (word-comparison), Tasks 7-8 (Tile, Grid)

- [ ] **Step 1: Create the types file**

```ts
// types/game.ts
export type LetterState = 'correct' | 'present' | 'absent';

export type GuessResult = LetterState[];
```

- [ ] **Step 2: Check the TypeScript build**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add types/game.ts
git commit -m "feat: add game types"
```

---

### Task 5: Word comparison logic (TDD)

**Files:**
- Create: `lib/word-comparison.ts`
- Test: `lib/word-comparison.test.ts`

**Interfaces:**
- Consumes: `LetterState`, `GuessResult` from `types/game.ts` (Task 4)
- Produces: `compareWord(guess: string, answer: string): GuessResult` — used in Task 8 (Grid) to pass states into Tile

- [ ] **Step 1: Write the first test — all letters correct**

Create `lib/word-comparison.test.ts`:

```ts
import { compareWord } from './word-comparison';

describe('compareWord', () => {
  it('returns all "correct" when guess equals answer', () => {
    expect(compareWord('зебра', 'зебра')).toEqual([
      'correct', 'correct', 'correct', 'correct', 'correct',
    ]);
  });
});
```

- [ ] **Step 2: Run the test, confirm it fails**

```bash
yarn test word-comparison
```

Expected: FAIL — `Cannot find module './word-comparison'`.

- [ ] **Step 3: Minimal implementation to pass the test**

Create `lib/word-comparison.ts`:

```ts
import type { GuessResult } from '../types/game';

export function compareWord(guess: string, answer: string): GuessResult {
  return guess.split('').map(() => 'correct');
}
```

- [ ] **Step 4: Run the test, confirm it passes**

```bash
yarn test word-comparison
```

Expected: PASS.

- [ ] **Step 5: Add a test for "all letters absent"**

Add to `lib/word-comparison.test.ts`:

```ts
  it('returns all "absent" when no letters match', () => {
    expect(compareWord('лимон', 'зебра')).toEqual([
      'absent', 'absent', 'absent', 'absent', 'absent',
    ]);
  });
```

Run `yarn test word-comparison` — Expected: FAIL (the current implementation always returns `correct`).

The two words must share no letters at all — while running this it turned out that "шкода"/"зебра" share the letter "а" at the same position, so an "all absent" test with those words would fail incorrectly.

- [ ] **Step 6: Add a test for "letter present but in the wrong spot"**

Add to `lib/word-comparison.test.ts`:

```ts
  it('marks a letter as "present" when it exists elsewhere in the answer', () => {
    // "б" is correct (same position in both); "у" is absent (not in answer at all);
    // "а", "р", "з" exist in the answer but at other positions -> "present"
    expect(compareWord('арбуз', 'зебра')).toEqual([
      'present', 'present', 'correct', 'absent', 'present',
    ]);
  });
```

- [ ] **Step 7: Write the full implementation (correct → present → absent)**

```ts
import type { GuessResult, LetterState } from '../types/game';

export function compareWord(guess: string, answer: string): GuessResult {
  const guessLetters = guess.split('');
  const answerLetters = answer.split('');
  const result: LetterState[] = new Array(guessLetters.length).fill('absent');

  const remaining: Record<string, number> = {};

  guessLetters.forEach((letter, i) => {
    if (letter === answerLetters[i]) {
      result[i] = 'correct';
    } else {
      remaining[answerLetters[i]] = (remaining[answerLetters[i]] ?? 0) + 1;
    }
  });

  guessLetters.forEach((letter, i) => {
    if (result[i] === 'correct') return;
    if (remaining[letter] > 0) {
      result[i] = 'present';
      remaining[letter] -= 1;
    }
  });

  return result;
}
```

- [ ] **Step 8: Run all tests, confirm they pass**

```bash
yarn test word-comparison
```

Expected: PASS, 3 tests.

- [ ] **Step 9: Add a test for duplicate letters — the key edge case**

Add to `lib/word-comparison.test.ts`:

```ts
  it('handles duplicate letters correctly — does not over-mark "present"', () => {
    // answer "арбуз" has one "а" (used up by position 0's "correct") and one "р";
    // guess "азарт" has a second "а" at index 2 that must NOT be marked "present"
    // since there's no "а" left in the answer to account for it.
    expect(compareWord('азарт', 'арбуз')).toEqual([
      'correct', 'present', 'absent', 'present', 'absent',
    ]);
  });
```

Run `yarn test word-comparison` — Expected: PASS (the implementation's `remaining` counter already handles this case correctly; the test confirms and documents the behavior).

- [ ] **Step 10: Commit**

```bash
git add lib/word-comparison.ts lib/word-comparison.test.ts
git commit -m "feat: add word comparison logic with tests"
```

---

### Task 6: Starter word list (`data/words.ts`)

**Files:**
- Create: `data/words.ts`

**Interfaces:**
- Produces: `WORDS: string[]` — an array of lowercase 5-letter Ukrainian words, used later (Week 2) to pick the daily word; in Week 1 it just exists for later integration

- [ ] **Step 1: Create the file with a starter word list**

```ts
// data/words.ts
export const WORDS: string[] = [
  'зебра', 'арбуз', 'вишня', 'гвинт', 'дрова',
  'жираф', 'зброя', 'ікона', 'канат', 'лампа',
  'мотор', 'нирка', 'океан', 'парта', 'радар',
  'сирок', 'театр', 'уклін', 'фарба', 'цукор',
  'чашка', 'шпага', 'юрист', 'бляха', 'вітер',
  'гараж', 'диван', 'жетон', 'запис', 'кобра',
  'лікар', 'мідяк', 'напис',
];
```

Every word is exactly 5 letters (checked by hand while writing this plan).

- [ ] **Step 2: Verify every word is exactly 5 letters**

```bash
npx tsx -e "
import { WORDS } from './data/words';
const bad = WORDS.filter(w => [...w].length !== 5);
console.log(bad.length === 0 ? 'OK: all words are 5 letters' : 'BAD WORDS: ' + bad.join(', '));
"
```

Expected: `OK: all words are 5 letters`. If `BAD WORDS` shows up — fix or remove those words and rerun the check.

- [ ] **Step 3: Commit**

```bash
git add data/words.ts
git commit -m "feat: add starter word list"
```

---

### Task 7: Tile component

**Files:**
- Create: `components/grid/Tile.tsx`
- Create: `components/grid/Tile.styles.ts`
- Test: `components/grid/Tile.test.tsx`

**Interfaces:**
- Consumes: `LetterState` from `types/game.ts` (Task 4)
- Produces: `<Tile letter={string} state={LetterState}>` — used in Task 8 (Grid)

- [ ] **Step 1: Write a smoke test**

Create `components/grid/Tile.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react-native';
import { Tile } from './Tile';

describe('Tile', () => {
  it('renders the given letter', () => {
    render(<Tile letter="А" state="correct" />);
    expect(screen.getByText('А')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run the test, confirm it fails**

```bash
yarn test Tile
```

Expected: FAIL — `Cannot find module './Tile'`.

- [ ] **Step 3: Create the styles**

```ts
// components/grid/Tile.styles.ts
export const tileStyles = {
  base: 'w-14 h-14 border-2 border-gray-400 items-center justify-center',
  text: 'text-2xl font-bold text-white',
  states: {
    correct: 'bg-green-600 border-green-600',
    present: 'bg-yellow-500 border-yellow-500',
    absent: 'bg-gray-500 border-gray-500',
    empty: 'bg-transparent border-gray-400',
  },
};
```

- [ ] **Step 4: Create the component**

```tsx
// components/grid/Tile.tsx
import { View, Text } from 'react-native';
import type { LetterState } from '../../types/game';
import { tileStyles } from './Tile.styles';

type TileProps = {
  letter: string;
  state: LetterState | 'empty';
};

export function Tile({ letter, state }: TileProps) {
  return (
    <View className={`${tileStyles.base} ${tileStyles.states[state]}`}>
      <Text className={tileStyles.text}>{letter}</Text>
    </View>
  );
}
```

- [ ] **Step 5: Run the test, confirm it passes**

```bash
yarn test Tile
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add components/grid/Tile.tsx components/grid/Tile.styles.ts components/grid/Tile.test.tsx
git commit -m "feat: add Tile component"
```

---

### Task 8: Grid component

**Files:**
- Create: `components/grid/Grid.tsx`
- Create: `components/grid/Grid.styles.ts`
- Test: `components/grid/Grid.test.tsx`

**Interfaces:**
- Consumes: `Tile` from Task 7, `LetterState` from `types/game.ts`
- Produces: `<Grid guesses={{ letters: string[]; states: (LetterState | 'empty')[] }[]} />` — 6 rows of 5 cells; used in Task 12 (GameScreen)

- [ ] **Step 1: Write a smoke test**

Create `components/grid/Grid.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react-native';
import { Grid } from './Grid';

describe('Grid', () => {
  it('renders 6 rows of 5 tiles each, filling empty rows with placeholders', () => {
    render(<Grid guesses={[{ letters: ['з', 'е', 'б', 'р', 'а'], states: ['correct', 'correct', 'correct', 'correct', 'correct'] }]} />);
    expect(screen.getByText('з')).toBeTruthy();
    expect(screen.getAllByText('', { exact: true }).length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run the test, confirm it fails**

```bash
yarn test Grid
```

Expected: FAIL — `Cannot find module './Grid'`.

- [ ] **Step 3: Create the styles**

```ts
// components/grid/Grid.styles.ts
export const gridStyles = {
  container: 'gap-1.5 items-center',
  row: 'flex-row gap-1.5',
};
```

- [ ] **Step 4: Create the component**

```tsx
// components/grid/Grid.tsx
import { View } from 'react-native';
import type { LetterState } from '../../types/game';
import { Tile } from './Tile';
import { gridStyles } from './Grid.styles';

const ROWS = 6;
const COLS = 5;

type GuessRow = {
  letters: string[];
  states: (LetterState | 'empty')[];
};

type GridProps = {
  guesses: GuessRow[];
};

export function Grid({ guesses }: GridProps) {
  const emptyRow: GuessRow = {
    letters: Array(COLS).fill(''),
    states: Array(COLS).fill('empty'),
  };
  const rows = Array.from({ length: ROWS }, (_, i) => guesses[i] ?? emptyRow);

  return (
    <View className={gridStyles.container}>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} className={gridStyles.row}>
          {row.letters.map((letter, colIndex) => (
            <Tile key={colIndex} letter={letter} state={row.states[colIndex]} />
          ))}
        </View>
      ))}
    </View>
  );
}
```

- [ ] **Step 5: Run the test, confirm it passes**

```bash
yarn test Grid
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add components/grid/Grid.tsx components/grid/Grid.styles.ts components/grid/Grid.test.tsx
git commit -m "feat: add Grid component"
```

---

### Task 9: Key component

**Files:**
- Create: `components/keyboard/Key.tsx`
- Create: `components/keyboard/Key.styles.ts`
- Test: `components/keyboard/Key.test.tsx`

**Interfaces:**
- Produces: `<Key label={string} onPress={() => void} wide?={boolean}>` — used in Task 10 (Keyboard). Press handling stays a no-op stub for now — real game logic will attach handlers in Week 2.

- [ ] **Step 1: Write a smoke test**

Create `components/keyboard/Key.test.tsx`:

```tsx
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Key } from './Key';

describe('Key', () => {
  it('renders label and calls onPress when tapped', () => {
    const onPress = jest.fn();
    render(<Key label="А" onPress={onPress} />);
    fireEvent.press(screen.getByText('А'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run the test, confirm it fails**

```bash
yarn test Key
```

Expected: FAIL — `Cannot find module './Key'`.

- [ ] **Step 3: Create the styles**

```ts
// components/keyboard/Key.styles.ts
export const keyStyles = {
  base: 'h-12 rounded bg-gray-300 items-center justify-center px-1',
  wide: 'flex-[1.5]',
  narrow: 'flex-1',
  text: 'text-sm font-semibold text-black',
};
```

- [ ] **Step 4: Create the component**

```tsx
// components/keyboard/Key.tsx
import { Pressable, Text } from 'react-native';
import { keyStyles } from './Key.styles';

type KeyProps = {
  label: string;
  onPress: () => void;
  wide?: boolean;
};

export function Key({ label, onPress, wide = false }: KeyProps) {
  return (
    <Pressable
      onPress={onPress}
      className={`${keyStyles.base} ${wide ? keyStyles.wide : keyStyles.narrow}`}
    >
      <Text className={keyStyles.text}>{label}</Text>
    </Pressable>
  );
}
```

- [ ] **Step 5: Run the test, confirm it passes**

```bash
yarn test Key
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add components/keyboard/Key.tsx components/keyboard/Key.styles.ts components/keyboard/Key.test.tsx
git commit -m "feat: add Key component"
```

---

### Task 10: Keyboard component

**Files:**
- Create: `components/keyboard/Keyboard.tsx`
- Create: `components/keyboard/Keyboard.styles.ts`
- Test: `components/keyboard/Keyboard.test.tsx`

**Interfaces:**
- Consumes: `Key` from Task 9
- Produces: `<Keyboard onKeyPress={(key: string) => void} />` — used in Task 12 (GameScreen); `key` will be either a letter or `'ENTER'`/`'DELETE'`

- [ ] **Step 1: Write a smoke test**

Create `components/keyboard/Keyboard.test.tsx`:

```tsx
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Keyboard } from './Keyboard';

describe('Keyboard', () => {
  it('renders all ukrainian letter keys and calls onKeyPress with the pressed letter', () => {
    const onKeyPress = jest.fn();
    render(<Keyboard onKeyPress={onKeyPress} />);
    fireEvent.press(screen.getByText('А'));
    expect(onKeyPress).toHaveBeenCalledWith('А');
  });

  it('renders ENTER and DELETE keys', () => {
    const onKeyPress = jest.fn();
    render(<Keyboard onKeyPress={onKeyPress} />);
    fireEvent.press(screen.getByText('ENTER'));
    expect(onKeyPress).toHaveBeenCalledWith('ENTER');
  });
});
```

- [ ] **Step 2: Run the test, confirm it fails**

```bash
yarn test Keyboard
```

Expected: FAIL — `Cannot find module './Keyboard'`.

- [ ] **Step 3: Create the styles**

```ts
// components/keyboard/Keyboard.styles.ts
export const keyboardStyles = {
  container: 'gap-1.5 px-1',
  row: 'flex-row gap-1.5',
};
```

- [ ] **Step 4: Create the component**

```tsx
// components/keyboard/Keyboard.tsx
import { View } from 'react-native';
import { Key } from './Key';
import { keyboardStyles } from './Keyboard.styles';

const ROWS = [
  ['Й', 'Ц', 'У', 'К', 'Е', 'Н', 'Г', 'Ш', 'Щ', 'З', 'Х'],
  ['Ф', 'І', 'В', 'А', 'П', 'Р', 'О', 'Л', 'Д', 'Ж', 'Є'],
  ['ENTER', 'Я', 'Ч', 'С', 'М', 'И', 'Т', 'Ь', 'Б', 'Ю', 'DELETE'],
];

type KeyboardProps = {
  onKeyPress: (key: string) => void;
};

export function Keyboard({ onKeyPress }: KeyboardProps) {
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
            />
          ))}
        </View>
      ))}
    </View>
  );
}
```

- [ ] **Step 5: Run the test, confirm it passes**

```bash
yarn test Keyboard
```

Expected: PASS, 2 tests.

- [ ] **Step 6: Commit**

```bash
git add components/keyboard/Keyboard.tsx components/keyboard/Keyboard.styles.ts components/keyboard/Keyboard.test.tsx
git commit -m "feat: add Keyboard component"
```

---

### Task 11: Navigation (React Navigation)

**Files:**
- Create: `navigation/AppNavigator.tsx`
- Modify: `App.tsx`

**Interfaces:**
- Produces: `<AppNavigator />` — a wrapper with `NavigationContainer` + `NativeStack`, renders `GameScreen` (Task 12) as the only screen

- [ ] **Step 1: Install dependencies**

```bash
npx expo install @react-navigation/native @react-navigation/native-stack react-native-screens react-native-safe-area-context
```

- [ ] **Step 2: Create the navigator**

```tsx
// navigation/AppNavigator.tsx
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GameScreen } from '../screens/game/GameScreen';

export type RootStackParamList = {
  Game: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Game" component={GameScreen} options={{ title: 'Wordle UA' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

Note: this file references `GameScreen`, which doesn't exist yet (created in Task 12). That's expected — `npx tsc --noEmit` at this step will show an error, which can be ignored until Task 12 is done.

- [ ] **Step 3: Commit**

```bash
git add navigation/AppNavigator.tsx package.json yarn.lock
git commit -m "feat: setup react navigation"
```

---

### Task 12: GameScreen — assembling everything

**Files:**
- Create: `screens/game/GameScreen.tsx`
- Create: `screens/game/GameScreen.styles.ts`
- Modify: `App.tsx`

**Interfaces:**
- Consumes: `Grid` (Task 8), `Keyboard` (Task 10), `AppNavigator` (Task 11)
- Produces: the full working screen — the final deliverable of Week 1

- [ ] **Step 1: Create the screen styles**

```ts
// screens/game/GameScreen.styles.ts
export const gameScreenStyles = {
  container: 'flex-1 items-center justify-between bg-white py-4',
};
```

- [ ] **Step 2: Create GameScreen**

```tsx
// screens/game/GameScreen.tsx
import { View } from 'react-native';
import { Grid } from '../../components/grid/Grid';
import { Keyboard } from '../../components/keyboard/Keyboard';
import { gameScreenStyles } from './GameScreen.styles';

export function GameScreen() {
  const handleKeyPress = (key: string) => {
    // Input handling lands in Week 2 — no-op for now.
    console.log('key pressed:', key);
  };

  return (
    <View className={gameScreenStyles.container}>
      <Grid guesses={[]} />
      <Keyboard onKeyPress={handleKeyPress} />
    </View>
  );
}
```

- [ ] **Step 3: Wire up the navigator in `App.tsx`**

```tsx
// App.tsx
import './global.css';
import { AppNavigator } from './navigation/AppNavigator';

export default function App() {
  return <AppNavigator />;
}
```

- [ ] **Step 4: Check the TypeScript build**

```bash
npx tsc --noEmit
```

Expected: no errors (now that `GameScreen` exists, the error from Task 11 is gone).

- [ ] **Step 5: Run the project and check it by hand**

```bash
yarn start
```

Open it in Expo Go / a simulator. Expected: a 6×5 grid (empty bordered cells) and the Ukrainian keyboard at the bottom; key presses are logged to the Metro console.

- [ ] **Step 6: Run the full test suite and lint**

```bash
yarn test
yarn lint
```

Expected: all tests pass, lint reports no errors.

- [ ] **Step 7: Commit**

```bash
git add screens/game/GameScreen.tsx screens/game/GameScreen.styles.ts App.tsx
git commit -m "feat: assemble game screen"
```

---

## Done when

- `yarn test` — all tests pass (word-comparison including the duplicate-letters edge case, Tile, Grid, Key, Keyboard)
- `yarn lint` — no errors
- `npx tsc --noEmit` — no errors
- The project runs in Expo Go / a simulator, showing a static 6×5 grid and keyboard
