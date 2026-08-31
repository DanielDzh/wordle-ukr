# Wordle UA — Week 3: Onboarding, dark theme, settings

## Week 3 goal

First-run onboarding, a light/dark theme toggle (system-aware, with a manual override), and a settings screen to control it. Sharing a result was already built in Week 2. Custom app icon/splash and release prep stay out of scope — those are Week 4.

## Decisions carried over from Week 1-2

- All styles in separate `*.styles.ts` files, never inline `className`
- TDD for everything in `lib/`
- User-facing UI text is Ukrainian; code comments/docs are English
- PascalCase component files, kebab-case everything else

## New decisions for Week 3

- Onboarding is 3 screens — rules, color meaning, daily word/streak — shown once, gated by an AsyncStorage flag. "Pictures" are built from existing components (e.g. a small row of `Tile`s in `correct`/`present`/`absent` states for the color-meaning screen), not new image assets.
- Dark theme uses NativeWind's own `useColorScheme`/`colorScheme` API (`light` / `dark` / `system`), not a custom React Context — this is NativeWind's idiomatic mechanism and drives `dark:` variant classes automatically.
- The manual theme choice is persisted in AsyncStorage and re-applied on app start.
- A new `SettingsScreen` holds the theme picker (three options: Світла / Темна / Системна), reachable from a plain-text "⚙" button in `GameScreen`'s navigation header — no icon library dependency added for this.
- App icon and splash screen stay on Expo's defaults.
- "Testing on real devices" for this week means the project owner testing personally on their own iPhone via Expo Go — no EAS Build yet.

## New dependency

None. `useColorScheme` ships with the `nativewind` package already installed.

## New modules

### `lib/storage.ts` (extend)
Two more thin AsyncStorage-backed functions, same pattern as the existing `loadStats`/`saveStats`:
```ts
function loadOnboardingSeen(): Promise<boolean>
function markOnboardingSeen(): Promise<void>
function loadThemePreference(): Promise<'light' | 'dark' | 'system' | null>
function saveThemePreference(preference: 'light' | 'dark' | 'system'): Promise<void>
```

### `hooks/useThemePreference.ts`
Loads the saved theme preference on mount and applies it via NativeWind's `colorScheme.set(...)`; exposes the current preference and a setter that both persists and applies:
```ts
function useThemePreference(): {
  preference: 'light' | 'dark' | 'system';
  setPreference: (next: 'light' | 'dark' | 'system') => void;
}
```
Defaults to `'system'` until the saved value loads (NativeWind already defaults to `'system'`, so there's no visible flash).

### `hooks/useOnboardingGate.ts`
Loads the onboarding-seen flag once on mount:
```ts
function useOnboardingGate(): { loading: boolean; seen: boolean; markSeen: () => void }
```
`markSeen` calls `markOnboardingSeen()` and flips `seen` to `true` (used by the onboarding screen's final "Почати гру" button).

## Component/screen changes

### `screens/onboarding/OnboardingScreen.tsx` (new)
Three steps, one visible at a time, driven by local `useState<number>` step index (no navigation sub-stack — swapping content is simpler than nested routes for 3 static steps):
1. **Rules** — short explanation of guessing a 5-letter word in 6 tries
2. **Colors** — a static row of 3 `Tile`s (`correct`, `present`, `absent`) each with a one-line caption
3. **Daily word & streak** — explains the word changes daily and that streaks track consecutive wins

Footer: "Пропустити" (skips to the end immediately) and "Далі" (or "Почати гру" on the last step) — both call `markSeen()` when finishing.

### `screens/settings/SettingsScreen.tsx` (new)
Three pressable rows (Світла / Темна / Системна) using `useThemePreference`, with the active choice visually marked (e.g. a checkmark or highlighted background).

### `navigation/AppNavigator.tsx` (modify)
- Add `Settings` to `RootStackParamList` and the stack
- `GameScreen`'s `options` gets a `headerRight` returning a `Pressable` with "⚙" that calls `navigation.navigate('Settings')`
- The navigator's initial route depends on `useOnboardingGate()`: while `loading`, render nothing (matches the existing `useGameState` hydration pattern); once loaded, show `Onboarding` first if `!seen`, otherwise go straight to `Game`

### Existing components (modify): add `dark:` variants
`Tile.styles.ts`, `Key.styles.ts`, `Keyboard.styles.ts`, `GameScreen.styles.ts`, `ResultModal.styles.ts` — add a `dark:bg-*`/`dark:text-*` counterpart next to each existing light-mode class (e.g. `bg-white dark:bg-gray-900`). Correct/present/absent tile and key colors stay the same in both themes (green/yellow/gray already read fine on a dark background) — only backgrounds, borders, and default text/key colors get dark variants.

## Out of scope for Week 3

- Custom app icon and splash screen
- EAS Build, store listing prep (Week 4)
- Guess validation against a dictionary (still Week 2's decision, unchanged)
- Any onboarding step beyond the 3 listed

## Week 3 done criteria

- `yarn test` passes — new tests for the extended `lib/storage.ts` functions, `useOnboardingGate`, `useThemePreference`, `OnboardingScreen`, `SettingsScreen`
- `yarn lint` passes with no errors
- `npx tsc --noEmit` passes with no errors
- Manually verified on the iOS simulator: onboarding shows on first launch and not on subsequent launches, the color-meaning step renders real `Tile` components, the settings screen switches themes live, and switching to "Системна" follows the simulator's system appearance setting
- The project owner confirms it also runs via Expo Go on their own iPhone
