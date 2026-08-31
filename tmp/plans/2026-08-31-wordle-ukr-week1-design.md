# Wordle UA — Тиждень 1: Setup проєкту та базовий UI сітки

## Мета проєкту

Wordle українською мовою — реальний продукт, який планується випустити в App Store та Google Play. Головна мета для власника проєкту — навчальна: пройти повне флоу від нуля до деплою в обидва стори, з ментором (Claude Code), який пояснює рішення на кожному кроці, а не просто пише код.

Загальний план — 4 тижні (Setup → Ігрова логіка → Полірування → Реліз). Цей документ описує тільки Тиждень 1.

## Мета Тижня 1

Закласти фундамент: налаштований Expo-проєкт з навігацією, статичний UI сітки 6×5 та клавіатури, і протестовану (TDD) логіку порівняння слова — без ігрового стану, анімацій чи збереження прогресу (це Тиждень 2).

## Стек

- Expo + TypeScript
- Package manager: yarn
- Навігація: React Navigation (NativeStack) — свідомий вибір замість Expo Router, щоб зрозуміти навігацію без файлової абстракції
- Стилі: NativeWind (Tailwind для RN); усі стилі виносяться в окремі `*.styles.ts` файли поруч з компонентом, не inline `className` в JSX
- Тестування: Jest + React Native Testing Library (jest-expo preset), TDD з самого початку
- Лінтинг: ESLint (eslint-config-expo) + Prettier одразу зі старту
- Без бекенду — слово дня рахуватиметься локально від дати (Тиждень 2)

## Структура проєкту

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

Іменування: PascalCase для файлів компонентів, kebab-case для решти (lib, data, types).

## Логіка порівняння слова (`lib/word-comparison.ts`)

```ts
type LetterState = 'correct' | 'present' | 'absent';

function compareWord(guess: string, answer: string): LetterState[]
```

Ключовий нюанс — коректна обробка повторюваних літер: спочатку прохід по позиціях для `correct`, потім прохід для `present` з підрахунком залишку літер у відповіді (frequency map), щоб не позначати як `present` більше входжень літери, ніж реально лишилось у слові після врахування `correct`.

## Порядок реалізації (TDD)

1. `lib/word-comparison.ts` + `.test.ts` — тести спочатку: прості кейси (усі correct, усі absent) → кейс з дублікатами літер, що показує проблему наївної реалізації → реалізація, що проходить усі тести
2. `types/game.ts` — `LetterState`, `GuessResult` та інші типи, потрібні для Тижня 1
3. `data/words.ts` — стартовий список ~50-100 українських 5-літерних слів (генерується для прототипу, повний словник — пізніше)
4. `components/grid/Tile.tsx` → `components/grid/Grid.tsx` — статична сітка 6×5, зі smoke-тестами на рендер
5. `components/keyboard/Key.tsx` → `components/keyboard/Keyboard.tsx` — статичний UI, без обробки натискань (логіка вводу — Тиждень 2)
6. `screens/game/GameScreen.tsx` + `navigation/AppNavigator.tsx` — збирає все докупи в один екран

## Поза межами Тижня 1

- Ігровий стан (поточна спроба, історія спроб)
- Обробка натискань клавіатури
- Анімація перевороту плиток
- Слово дня за датою, AsyncStorage, статистика
- Онбординг, темна тема, "Поділитись результатом"
- Будь-яка підготовка до релізу (EAS Build, стори)

## Критерії готовності Тижня 1

- `yarn test` проходить — тести на `word-comparison.ts` (включно з кейсом дублікатів літер) та smoke-тести на `Grid`/`Tile`
- `yarn lint` без помилок
- Проєкт запускається в Expo Go / симуляторі, показує статичну сітку 6×5 та клавіатуру на екрані
