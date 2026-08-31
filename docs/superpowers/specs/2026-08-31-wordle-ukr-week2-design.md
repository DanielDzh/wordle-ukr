# Wordle UA — Week 2: Game logic, daily word, stats

## Week 2 goal

Turn the static Week 1 screen into a playable daily-word game: real guess input, win/lose detection, a result modal with stats and sharing, a date-based daily word, and local persistence — no backend, no onboarding/dark theme/app icon polish (that's Week 3).

## Decisions carried over from Week 1

- No backend — the daily word is derived locally from the date
- All styles in separate `*.styles.ts` files, never inline `className`
- TDD for everything in `lib/`
- PascalCase component files, kebab-case everything else

## New decisions for Week 2

- Keyboard keys change color based on the best known state of that letter across all submitted guesses (`correct` > `present` > `absent`), same as the original Wordle
- After a win or a loss, a modal shows full stats (games played, win %, current streak, max streak, guess distribution 1-6) plus a "Share" button — moved up from Week 3 as requested
- Sharing uses React Native's built-in `Share` API — no new dependency
- The daily word rotates at local device midnight (day index = days since a fixed epoch date, in the device's local calendar, modulo the word list length)
- Guesses are **not** validated against the word list this week — any 5-letter Cyrillic guess is accepted on ENTER. The 33-word starter list is a prototype dictionary for picking the daily word, not a valid-guess dictionary. Real guess validation needs a much larger word list and is out of scope until that list exists.
- Typed input is uppercase (matches the existing `Keyboard` component's uppercase Cyrillic labels and `Tile`'s display convention); comparison against the answer lowercases the guess first, since `data/words.ts` stores lowercase words.

## New dependency

- `@react-native-async-storage/async-storage` — local persistence for stats and in-progress daily game state

## New modules (`lib/`, TDD — test before implementation)

### `lib/daily-word.ts`
```ts
function getDailyWordIndex(today: Date, epoch: Date, wordCount: number): number
function getTodayWord(words: string[], today?: Date): string
```
Day index = whole calendar days between `epoch` and `today` in local time (not UTC-based millisecond division, which breaks across DST changes) — compare `Y/M/D` components directly, not epoch-millisecond subtraction, so a word only rotates at local midnight.

### `lib/keyboard-letter-states.ts`
```ts
function mergeLetterStates(guesses: { letters: string[]; states: LetterState[] }[]): Record<string, LetterState>
```
For each letter seen across all guesses, keep the highest-priority state (`correct` > `present` > `absent`). A letter never seen has no entry (Key renders its default/untouched color).

### `lib/game-reducer.ts`
Pure reducer, no React import — the whole game flow is testable without rendering.
```ts
type GameState = {
  status: 'playing' | 'won' | 'lost';
  answer: string;                    // lowercase
  currentGuess: string;               // uppercase, in-progress
  guesses: { letters: string[]; states: LetterState[] }[]; // submitted, uppercase letters
};

type GameAction =
  | { type: 'KEY_PRESS'; key: string }   // a letter, 'ENTER', or 'DELETE'

function gameReducer(state: GameState, action: GameAction): GameState
```
- Typing a letter appends to `currentGuess` (max 5 chars, ignored once full)
- `DELETE` removes the last character
- `ENTER` with `currentGuess.length !== 5` is a no-op (no validation-failure UI shake this week — that's a Week 3 polish item)
- `ENTER` with 5 characters: run `compareWord(currentGuess.toLowerCase(), answer)`, push `{ letters: currentGuess.split(''), states: result }` to `guesses`, clear `currentGuess`
- After pushing: `status` becomes `won` if all states are `correct`, `lost` if this was the 6th guess and not won, otherwise stays `playing`
- Once `status !== 'playing'`, `KEY_PRESS` is a no-op — the game is over

### `lib/stats.ts`
```ts
type Stats = {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: [number, number, number, number, number, number]; // index 0 = won in 1 guess
};

function updateStats(prev: Stats, won: boolean, guessCount: number): Stats
```
A loss resets `currentStreak` to 0 and does not touch `guessDistribution`. A win increments `guessDistribution[guessCount - 1]`, bumps `currentStreak`, and updates `maxStreak` if the new streak is higher.

### `lib/share-text.ts`
```ts
function buildShareText(guesses: { states: LetterState[] }[], dayIndex: number, won: boolean): string
```
Emoji grid: `correct` → 🟩, `present` → 🟨, `absent` → ⬛, one line per guess row, headed by `Wordle UA #<dayIndex> <guessCount>/6` (or `X/6` on a loss), matching the classic Wordle share format people already recognize.

### `lib/storage.ts`
Thin wrapper over AsyncStorage — not unit tested beyond basic mock-based sanity checks, since it's mostly pass-through:
```ts
function loadStats(): Promise<Stats | null>
function saveStats(stats: Stats): Promise<void>
function loadDailyGame(): Promise<{ date: string; state: GameState } | null>
function saveDailyGame(date: string, state: GameState): Promise<void>
```
`date` is the local `YYYY-MM-DD` of the current daily word. On app start, `GameScreen` loads the saved daily game; if its `date` doesn't match today's, it starts fresh (new day, new word, no resume).

## Component changes

### `Tile` (modify)
Add a flip animation on reveal: when a tile's `state` changes from `empty` to a real state, animate `rotateX` 0deg → 90deg → 0deg over ~250ms per tile via `react-native-reanimated`, with each tile in a row staggered ~150ms after the previous one. The background color swaps at the 90deg midpoint (fully edge-on, so the flip hides the swap).

### `Key` (modify)
Accept an optional `state?: LetterState` prop; when present, override the default background color the same way `Tile` does (`correct`/`present`/`absent` colors), otherwise keep the current gray default.

### `Keyboard` (modify)
Accept `letterStates: Record<string, LetterState>` and pass the matching state down to each `Key`.

### `ResultModal` (new)
`components/modal/ResultModal.tsx` + `.styles.ts`. Props: `visible`, `won`, `stats: Stats`, `onShare: () => void`, `onClose: () => void`. Shows win/lose headline, the four stat numbers, a bar chart of `guessDistribution` (simple `View` bars, no chart library), and a "Share" button.

### `GameScreen` (rewrite)
Wires `useGameState` (a small hook wrapping `game-reducer` + AsyncStorage load/save side effects) to `Grid`, `Keyboard`, and `ResultModal`. Keyboard's `onKeyPress` dispatches to the reducer instead of just logging.

## Out of scope for Week 2

- Guess validation against a dictionary
- Onboarding, dark theme, app icon/splash polish
- "Invalid guess" shake animation
- Release prep (EAS Build, store listings)

## Week 2 done criteria

- `yarn test` passes — new tests for `daily-word`, `keyboard-letter-states`, `game-reducer` (including win/lose transitions), `stats`, `share-text`
- `yarn lint` passes with no errors
- `npx tsc --noEmit` passes with no errors
- Manually verified on the iOS simulator: typing a guess, submitting it, seeing the flip animation and keyboard colors update, reaching win or loss, seeing the result modal with correct stats, and sharing producing the expected emoji-grid text
- Closing and reopening the app on the same day resumes the in-progress game; a stubbed "next day" resets it
