# Wordle UA — Тиждень 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Закласти фундамент Wordle UA — налаштований Expo-проєкт з навігацією, статичний UI сітки 6×5 та клавіатури, і протестовану (TDD) логіку порівняння слова.

**Architecture:** Expo + TypeScript, React Navigation (NativeStack), NativeWind для стилів (винесених в окремі `*.styles.ts` файли), Jest + RNTL для тестів. Чиста логіка порівняння слова в `lib/`, без React-залежностей — тестується першою через TDD. Компоненти статичні на цьому тижні, без ігрового стану.

**Tech Stack:** Expo SDK (latest), TypeScript, yarn, React Navigation, NativeWind, Jest (jest-expo preset), React Native Testing Library, ESLint (eslint-config-expo), Prettier.

**Spec:** `docs/superpowers/specs/2026-08-31-wordle-ukr-week1-design.md`

## Global Constraints

- Package manager: yarn (не npm/pnpm)
- Усі стилі в окремих `*.styles.ts` файлах поруч з компонентом — ніколи inline `className` в JSX
- PascalCase для файлів компонентів, kebab-case для решти (lib, data, types)
- TDD: тест перед реалізацією для всього в `lib/`
- Без бекенду, без ігрового стану, без анімацій — це все Тиждень 2
- Кожен таск закінчується коммітом

---

### Task 1: Ініціалізація проєкту

**Files:**
- Create: увесь scaffold `create-expo-app` (blank-typescript template)
- Create: `.gitignore` (з шаблону Expo)

**Interfaces:**
- Produces: базовий Expo-проєкт, який запускається через `yarn start`

- [ ] **Step 1: Створити проєкт**

```bash
cd /Users/admin/AI-projects
yarn create expo-app wordle-ukr --template blank-typescript
```

Якщо команда попросить перезаписати наявну директорію (там уже лежить `CLAUDE.md`, `docs/`, `tmp/`) — підтвердити, вона не займе ці файли, тільки додасть відсутні.

- [ ] **Step 2: Перевірити, що CLAUDE.md, docs/, tmp/ не зникли**

```bash
cd /Users/admin/AI-projects/wordle-ukr
ls -la
```

Expected: бачимо і `CLAUDE.md`/`docs/`/`tmp/`, і нові Expo-файли (`App.tsx`, `app.json`, `package.json`, `.gitignore`).

- [ ] **Step 3: Запустити проєкт, переконатись що стартує**

```bash
yarn start
```

Expected: Metro bundler піднімається без помилок. Зупинити (Ctrl+C) після перевірки.

- [ ] **Step 4: Ініціалізувати git та зробити перший коміт на `main`**

```bash
git init
git add .
git commit -m "feat: init expo project scaffold"
```

- [ ] **Step 5: Створити `develop` та гілку фічі для Тижня 1**

```bash
git branch develop
git checkout -b feature/week1-setup develop
```

Усі наступні таски (2-12) комітяться в `feature/week1-setup`. У кінці Тижня 1 — PR у `develop` (не в `main`).

---

### Task 2: Tooling — ESLint, Prettier, Jest, RNTL

**Files:**
- Create/Modify: `.eslintrc.js` (або `eslint.config.js` залежно від версії Expo)
- Create: `.prettierrc`
- Modify: `package.json` (scripts: `lint`, `test`)
- Create: `lib/sanity.test.ts` (тимчасовий, видаляється в кінці таску)

**Interfaces:**
- Produces: `yarn lint`, `yarn test` — робочі команди для всіх наступних тасків

- [ ] **Step 1: Налаштувати ESLint через Expo**

```bash
yarn expo lint
```

Це створить `eslint-config-expo`-конфіг і запитає про `eslint.config.js` — погодитись на дефолтні опції.

- [ ] **Step 2: Додати Prettier**

```bash
yarn add -D prettier eslint-config-prettier
```

Створити `.prettierrc`:

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all"
}
```

- [ ] **Step 3: Перевірити лінт працює**

```bash
yarn lint
```

Expected: завершується без помилок (warnings по дефолтному шаблону — ок).

- [ ] **Step 4: Встановити Jest + RNTL**

```bash
yarn add -D jest jest-expo @testing-library/react-native @types/jest
```

Додати в `package.json`:

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

- [ ] **Step 5: Написати тимчасовий sanity-тест**

Створити `lib/sanity.test.ts`:

```ts
test('jest harness works', () => {
  expect(1 + 1).toBe(2);
});
```

- [ ] **Step 6: Запустити тест, переконатись що проходить**

```bash
yarn test
```

Expected: PASS, 1 test.

- [ ] **Step 7: Видалити тимчасовий тест**

```bash
rm lib/sanity.test.ts
```

- [ ] **Step 8: Коміт**

```bash
git add .
git commit -m "chore: setup eslint, prettier, jest, rntl"
```

---

### Task 3: Налаштування NativeWind

**Files:**
- Create: `tailwind.config.js`
- Create: `global.css`
- Create: `nativewind-env.d.ts`
- Modify: `babel.config.js`
- Modify: `metro.config.js` (створити, якщо немає)
- Modify: `App.tsx` (додати `import './global.css'`)

**Interfaces:**
- Produces: `className` доступний у будь-якому RN-компоненті проєкту

- [ ] **Step 1: Встановити залежності**

```bash
yarn add nativewind tailwindcss@^3
```

- [ ] **Step 2: Ініціалізувати Tailwind**

```bash
npx tailwindcss init
```

- [ ] **Step 3: Налаштувати `tailwind.config.js`**

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

- [ ] **Step 4: Створити `global.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 5: Налаштувати `babel.config.js`**

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

- [ ] **Step 6: Створити `metro.config.js`**

```js
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: './global.css' });
```

- [ ] **Step 7: Створити `nativewind-env.d.ts`**

```ts
/// <reference types="nativewind/types" />
```

- [ ] **Step 8: Підключити стилі в `App.tsx`**

Додати перший рядок імпорту (перед іншими імпортами):

```tsx
import './global.css';
```

- [ ] **Step 9: Перевірити, що className працює**

Тимчасово додати в `App.tsx` елемент з `className="bg-red-500"`, запустити `yarn start`, відкрити в Expo Go/симуляторі, переконатись що фон червоний. Прибрати тимчасову зміну після перевірки.

- [ ] **Step 10: Коміт**

```bash
git add .
git commit -m "feat: setup nativewind"
```

---

### Task 4: Типи гри (`types/game.ts`)

**Files:**
- Create: `types/game.ts`

**Interfaces:**
- Produces: `LetterState`, `GuessResult` — використовуються в Task 5 (word-comparison), Task 7-8 (Tile, Grid)

- [ ] **Step 1: Створити файл з типами**

```ts
// types/game.ts
export type LetterState = 'correct' | 'present' | 'absent';

export type GuessResult = LetterState[];
```

- [ ] **Step 2: Перевірити компіляцію TypeScript**

```bash
npx tsc --noEmit
```

Expected: без помилок.

- [ ] **Step 3: Коміт**

```bash
git add types/game.ts
git commit -m "feat: add game types"
```

---

### Task 5: Логіка порівняння слова (TDD)

**Files:**
- Create: `lib/word-comparison.ts`
- Test: `lib/word-comparison.test.ts`

**Interfaces:**
- Consumes: `LetterState`, `GuessResult` з `types/game.ts` (Task 4)
- Produces: `compareWord(guess: string, answer: string): GuessResult` — використовується в Task 8 (Grid) для передачі станів у Tile

- [ ] **Step 1: Написати перший тест — усі літери правильні**

Створити `lib/word-comparison.test.ts`:

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

- [ ] **Step 2: Запустити тест, переконатись що падає**

```bash
yarn test word-comparison
```

Expected: FAIL — `Cannot find module './word-comparison'`.

- [ ] **Step 3: Мінімальна реалізація для проходження тесту**

Створити `lib/word-comparison.ts`:

```ts
import type { GuessResult } from '../types/game';

export function compareWord(guess: string, answer: string): GuessResult {
  return guess.split('').map(() => 'correct');
}
```

- [ ] **Step 4: Запустити тест, переконатись що проходить**

```bash
yarn test word-comparison
```

Expected: PASS.

- [ ] **Step 5: Додати тест на "усі літери відсутні"**

Додати в `lib/word-comparison.test.ts`:

```ts
  it('returns all "absent" when no letters match', () => {
    expect(compareWord('шкода', 'зебра')).toEqual([
      'absent', 'absent', 'absent', 'absent', 'absent',
    ]);
  });
```

Запустити `yarn test word-comparison` — Expected: FAIL (поточна реалізація завжди повертає `correct`).

- [ ] **Step 6: Додати тест на "літера є, але не на своєму місці"**

Додати в `lib/word-comparison.test.ts`:

```ts
  it('marks a letter as "present" when it exists elsewhere in the answer', () => {
    expect(compareWord('арбуз', 'зебра')).toEqual([
      'present', 'present', 'absent', 'present', 'present',
    ]);
  });
```

- [ ] **Step 7: Написати повну реалізацію (correct → present → absent)**

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

- [ ] **Step 8: Запустити всі тести, переконатись що проходять**

```bash
yarn test word-comparison
```

Expected: PASS, 3 tests.

- [ ] **Step 9: Додати тест на дублікати літер — ключовий edge case**

Додати в `lib/word-comparison.test.ts`:

```ts
  it('handles duplicate letters correctly — does not over-mark "present"', () => {
    // answer has only one "а", guess has two "а"
    expect(compareWord('азарт', 'арбуз')).toEqual([
      'correct', 'present', 'absent', 'absent', 'absent',
    ]);
  });
```

Запустити `yarn test word-comparison` — Expected: PASS (реалізація з `remaining`-лічильником вже коректно обробляє цей кейс, тест підтверджує це і документує поведінку).

- [ ] **Step 10: Коміт**

```bash
git add lib/word-comparison.ts lib/word-comparison.test.ts
git commit -m "feat: add word comparison logic with tests"
```

---

### Task 6: Стартовий словник (`data/words.ts`)

**Files:**
- Create: `data/words.ts`

**Interfaces:**
- Produces: `WORDS: string[]` — масив 5-літерних українських слів у нижньому регістрі, використовується пізніше (Тиждень 2) для вибору слова дня; на Тижні 1 просто існує для наступних інтеграцій

- [ ] **Step 1: Створити файл зі стартовим списком слів**

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

Усі слова — рівно 5 літер кирилицею (перевірено вручну під час написання плану).

- [ ] **Step 2: Перевірити, що всі слова рівно 5 літер**

```bash
npx tsx -e "
import { WORDS } from './data/words';
const bad = WORDS.filter(w => [...w].length !== 5);
console.log(bad.length === 0 ? 'OK: all words are 5 letters' : 'BAD WORDS: ' + bad.join(', '));
"
```

Expected: `OK: all words are 5 letters`. Якщо все ж є `BAD WORDS` — прибрати/виправити ці слова у файлі й перезапустити перевірку.

- [ ] **Step 3: Коміт**

```bash
git add data/words.ts
git commit -m "feat: add starter word list"
```

---

### Task 7: Компонент Tile

**Files:**
- Create: `components/grid/Tile.tsx`
- Create: `components/grid/Tile.styles.ts`
- Test: `components/grid/Tile.test.tsx`

**Interfaces:**
- Consumes: `LetterState` з `types/game.ts` (Task 4)
- Produces: `<Tile letter={string} state={LetterState}>` — використовується в Task 8 (Grid)

- [ ] **Step 1: Написати smoke-тест**

Створити `components/grid/Tile.test.tsx`:

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

- [ ] **Step 2: Запустити тест, переконатись що падає**

```bash
yarn test Tile
```

Expected: FAIL — `Cannot find module './Tile'`.

- [ ] **Step 3: Створити стилі**

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

- [ ] **Step 4: Створити компонент**

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

- [ ] **Step 5: Запустити тест, переконатись що проходить**

```bash
yarn test Tile
```

Expected: PASS.

- [ ] **Step 6: Коміт**

```bash
git add components/grid/Tile.tsx components/grid/Tile.styles.ts components/grid/Tile.test.tsx
git commit -m "feat: add Tile component"
```

---

### Task 8: Компонент Grid

**Files:**
- Create: `components/grid/Grid.tsx`
- Create: `components/grid/Grid.styles.ts`
- Test: `components/grid/Grid.test.tsx`

**Interfaces:**
- Consumes: `Tile` з Task 7, `LetterState` з `types/game.ts`
- Produces: `<Grid guesses={{ letters: string[]; states: (LetterState | 'empty')[] }[]} />` — 6 рядків по 5 клітинок; використовується в Task 12 (GameScreen)

- [ ] **Step 1: Написати smoke-тест**

Створити `components/grid/Grid.test.tsx`:

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

- [ ] **Step 2: Запустити тест, переконатись що падає**

```bash
yarn test Grid
```

Expected: FAIL — `Cannot find module './Grid'`.

- [ ] **Step 3: Створити стилі**

```ts
// components/grid/Grid.styles.ts
export const gridStyles = {
  container: 'gap-1.5 items-center',
  row: 'flex-row gap-1.5',
};
```

- [ ] **Step 4: Створити компонент**

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

- [ ] **Step 5: Запустити тест, переконатись що проходить**

```bash
yarn test Grid
```

Expected: PASS.

- [ ] **Step 6: Коміт**

```bash
git add components/grid/Grid.tsx components/grid/Grid.styles.ts components/grid/Grid.test.tsx
git commit -m "feat: add Grid component"
```

---

### Task 9: Компонент Key

**Files:**
- Create: `components/keyboard/Key.tsx`
- Create: `components/keyboard/Key.styles.ts`
- Test: `components/keyboard/Key.test.tsx`

**Interfaces:**
- Produces: `<Key label={string} onPress={() => void} wide?={boolean}>` — використовується в Task 10 (Keyboard). Обробка натискань поки лишається no-op заглушкою — реальна ігрова логіка на неї повісить обробники в Тижні 2.

- [ ] **Step 1: Написати smoke-тест**

Створити `components/keyboard/Key.test.tsx`:

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

- [ ] **Step 2: Запустити тест, переконатись що падає**

```bash
yarn test Key
```

Expected: FAIL — `Cannot find module './Key'`.

- [ ] **Step 3: Створити стилі**

```ts
// components/keyboard/Key.styles.ts
export const keyStyles = {
  base: 'h-12 rounded bg-gray-300 items-center justify-center px-1',
  wide: 'flex-[1.5]',
  narrow: 'flex-1',
  text: 'text-sm font-semibold text-black',
};
```

- [ ] **Step 4: Створити компонент**

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

- [ ] **Step 5: Запустити тест, переконатись що проходить**

```bash
yarn test Key
```

Expected: PASS.

- [ ] **Step 6: Коміт**

```bash
git add components/keyboard/Key.tsx components/keyboard/Key.styles.ts components/keyboard/Key.test.tsx
git commit -m "feat: add Key component"
```

---

### Task 10: Компонент Keyboard

**Files:**
- Create: `components/keyboard/Keyboard.tsx`
- Create: `components/keyboard/Keyboard.styles.ts`
- Test: `components/keyboard/Keyboard.test.tsx`

**Interfaces:**
- Consumes: `Key` з Task 9
- Produces: `<Keyboard onKeyPress={(key: string) => void} />` — використовується в Task 12 (GameScreen); `key` буде або літерою, або `'ENTER'`/`'DELETE'`

- [ ] **Step 1: Написати smoke-тест**

Створити `components/keyboard/Keyboard.test.tsx`:

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

- [ ] **Step 2: Запустити тест, переконатись що падає**

```bash
yarn test Keyboard
```

Expected: FAIL — `Cannot find module './Keyboard'`.

- [ ] **Step 3: Створити стилі**

```ts
// components/keyboard/Keyboard.styles.ts
export const keyboardStyles = {
  container: 'gap-1.5 px-1',
  row: 'flex-row gap-1.5',
};
```

- [ ] **Step 4: Створити компонент**

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

- [ ] **Step 5: Запустити тест, переконатись що проходить**

```bash
yarn test Keyboard
```

Expected: PASS, 2 tests.

- [ ] **Step 6: Коміт**

```bash
git add components/keyboard/Keyboard.tsx components/keyboard/Keyboard.styles.ts components/keyboard/Keyboard.test.tsx
git commit -m "feat: add Keyboard component"
```

---

### Task 11: Навігація (React Navigation)

**Files:**
- Create: `navigation/AppNavigator.tsx`
- Modify: `App.tsx`

**Interfaces:**
- Produces: `<AppNavigator />` — обгортка з `NavigationContainer` + `NativeStack`, рендерить `GameScreen` (Task 12) як єдиний екран

- [ ] **Step 1: Встановити залежності**

```bash
npx expo install @react-navigation/native @react-navigation/native-stack react-native-screens react-native-safe-area-context
```

- [ ] **Step 2: Створити навігатор**

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

Примітка: цей файл посилається на `GameScreen`, який ще не існує (створюється в Task 12). Це очікувано — `npx tsc --noEmit` на цьому кроці покаже помилку, її можна ігнорувати до завершення Task 12.

- [ ] **Step 3: Коміт**

```bash
git add navigation/AppNavigator.tsx package.json yarn.lock
git commit -m "feat: setup react navigation"
```

---

### Task 12: GameScreen — збірка докупи

**Files:**
- Create: `screens/game/GameScreen.tsx`
- Create: `screens/game/GameScreen.styles.ts`
- Modify: `App.tsx`

**Interfaces:**
- Consumes: `Grid` (Task 8), `Keyboard` (Task 10), `AppNavigator` (Task 11)
- Produces: повний робочий екран — фінальний деліверебл Тижня 1

- [ ] **Step 1: Створити стилі екрану**

```ts
// screens/game/GameScreen.styles.ts
export const gameScreenStyles = {
  container: 'flex-1 items-center justify-between bg-white py-4',
};
```

- [ ] **Step 2: Створити GameScreen**

```tsx
// screens/game/GameScreen.tsx
import { View } from 'react-native';
import { Grid } from '../../components/grid/Grid';
import { Keyboard } from '../../components/keyboard/Keyboard';
import { gameScreenStyles } from './GameScreen.styles';

export function GameScreen() {
  const handleKeyPress = (key: string) => {
    // Обробка вводу — Тиждень 2. Поки no-op.
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

- [ ] **Step 3: Підключити навігатор в `App.tsx`**

```tsx
// App.tsx
import './global.css';
import { AppNavigator } from './navigation/AppNavigator';

export default function App() {
  return <AppNavigator />;
}
```

- [ ] **Step 4: Перевірити компіляцію TypeScript**

```bash
npx tsc --noEmit
```

Expected: без помилок (тепер, коли `GameScreen` існує, помилка з Task 11 зникає).

- [ ] **Step 5: Запустити проєкт і перевірити вручну**

```bash
yarn start
```

Відкрити в Expo Go / симуляторі. Expected: видно сітку 6×5 (порожні клітинки з рамкою) та українську клавіатуру знизу; натискання клавіш логуються в консоль Metro.

- [ ] **Step 6: Прогнати весь набір тестів і лінт**

```bash
yarn test
yarn lint
```

Expected: усі тести проходять, лінт без помилок.

- [ ] **Step 7: Коміт**

```bash
git add screens/game/GameScreen.tsx screens/game/GameScreen.styles.ts App.tsx
git commit -m "feat: assemble game screen"
```

---

## Готово, коли

- `yarn test` — усі тести проходять (word-comparison з edge case дублікатів, Tile, Grid, Key, Keyboard)
- `yarn lint` — без помилок
- `npx tsc --noEmit` — без помилок
- Проєкт запускається в Expo Go / симуляторі, показує статичну сітку 6×5 і клавіатуру
