# Wordle UA — Week 3 Implementation Plan

> **For implementers:** Follow this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** First-run onboarding (3 screens), a light/dark theme toggle (system-aware with manual override), and a settings screen to control it.

**Architecture:** Theme state is owned by NativeWind's own `useColorScheme`/`setColorScheme` API (not a custom Context), wrapped by a small `useThemePreference` hook that persists the choice to AsyncStorage. Onboarding is gated by a boolean flag in AsyncStorage, checked once at app start by `useOnboardingGate`, which decides `AppNavigator`'s initial route. Both hooks follow the same "load once on mount, expose loading state" pattern already used by `useGameState` in Week 2.

**Tech Stack:** Same as Week 1-2. No new dependency — `useColorScheme` ships with the already-installed `nativewind` package.

**Spec:** `docs/superpowers/specs/2026-08-31-wordle-ukr-week3-design.md`

## Global Constraints

- All styles in separate `*.styles.ts` files next to the component — never inline `className` in JSX
- TDD: a test before the implementation for everything in `lib/` (and, following the Week 1-2 pattern, for hooks and components too, where practical)
- User-facing UI text is Ukrainian; code comments/docs are English
- PascalCase component files, kebab-case everything else
- No new app icon/splash, no EAS Build — that's Week 4
- Every task ends with a commit

**Deviation from the spec, decided during planning:** the spec describes `useOnboardingGate` returning a `markSeen` function for the onboarding screen to call. In practice nothing re-reads the gate's `seen` value after the initial routing decision, so `OnboardingScreen` calls `markOnboardingSeen()` from `lib/storage.ts` directly instead — one fewer indirection for the same effect. `useOnboardingGate` only returns `{ loading, seen }`.

---

### Task 1: Extend storage for onboarding and theme preference (TDD)

**Files:**
- Create: `types/theme.ts`
- Modify: `lib/storage.ts`
- Modify: `lib/storage.test.ts`

**Interfaces:**
- Produces: `ThemePreference` type, `loadOnboardingSeen(): Promise<boolean>`, `markOnboardingSeen(): Promise<void>`, `loadThemePreference(): Promise<ThemePreference | null>`, `saveThemePreference(preference: ThemePreference): Promise<void>` — used by Tasks 2-3 (`useOnboardingGate`, `useThemePreference`)

- [ ] **Step 1: Create the theme type**

```ts
// types/theme.ts
export type ThemePreference = 'light' | 'dark' | 'system';
```

- [ ] **Step 2: Write the first failing test**

Add to `lib/storage.test.ts`:

```ts
import { loadOnboardingSeen, markOnboardingSeen, loadThemePreference, saveThemePreference } from './storage';

  it('returns false for onboarding-seen before it is marked', async () => {
    expect(await loadOnboardingSeen()).toBe(false);
  });
```

- [ ] **Step 3: Run the test, confirm it fails**

```bash
yarn test lib/storage
```

Expected: FAIL — `loadOnboardingSeen` is not exported yet.

- [ ] **Step 4: Implement the onboarding-seen functions**

Add to `lib/storage.ts`:

```ts
const ONBOARDING_SEEN_KEY = 'wordle-ukr:onboarding-seen';

export async function loadOnboardingSeen(): Promise<boolean> {
  const raw = await AsyncStorage.getItem(ONBOARDING_SEEN_KEY);
  return raw === 'true';
}

export async function markOnboardingSeen(): Promise<void> {
  await AsyncStorage.setItem(ONBOARDING_SEEN_KEY, 'true');
}
```

- [ ] **Step 5: Run the test, confirm it passes**

```bash
yarn test lib/storage
```

Expected: PASS.

- [ ] **Step 6: Add a test for marking onboarding seen, and for theme preference**

Add to `lib/storage.test.ts`:

```ts
  it('returns true after marking onboarding as seen', async () => {
    await markOnboardingSeen();
    expect(await loadOnboardingSeen()).toBe(true);
  });

  it('returns null for theme preference before one is saved', async () => {
    expect(await loadThemePreference()).toBeNull();
  });

  it('saves and loads a theme preference', async () => {
    await saveThemePreference('dark');
    expect(await loadThemePreference()).toBe('dark');
  });
```

Run `yarn test lib/storage` — Expected: FAIL (`markOnboardingSeen` already passes; `loadThemePreference`/`saveThemePreference` aren't implemented yet, so those two fail with "is not a function").

- [ ] **Step 7: Implement the theme preference functions**

Add to `lib/storage.ts` (also add the import at the top):

```ts
import type { GameState, Stats } from '../types/game';
import type { ThemePreference } from '../types/theme';

const THEME_PREFERENCE_KEY = 'wordle-ukr:theme-preference';

export async function loadThemePreference(): Promise<ThemePreference | null> {
  const raw = await AsyncStorage.getItem(THEME_PREFERENCE_KEY);
  return raw === 'light' || raw === 'dark' || raw === 'system' ? raw : null;
}

export async function saveThemePreference(preference: ThemePreference): Promise<void> {
  await AsyncStorage.setItem(THEME_PREFERENCE_KEY, preference);
}
```

- [ ] **Step 8: Run all storage tests, confirm they pass**

```bash
yarn test lib/storage
```

Expected: PASS, 8 tests total (4 existing + 4 new).

- [ ] **Step 9: Check the TypeScript build and commit**

```bash
npx tsc --noEmit
```

Expected: no errors.

```bash
git add types/theme.ts lib/storage.ts lib/storage.test.ts
git commit -m "feat: add onboarding and theme preference storage"
```

---

### Task 2: `useOnboardingGate` hook (TDD)

**Files:**
- Create: `hooks/useOnboardingGate.ts`
- Test: `hooks/useOnboardingGate.test.ts`

**Interfaces:**
- Consumes: `loadOnboardingSeen`, `markOnboardingSeen` (Task 1)
- Produces: `useOnboardingGate(): { loading: boolean; seen: boolean }` — used by Task 6 (`AppNavigator`)

- [ ] **Step 1: Write the first test**

Create `hooks/useOnboardingGate.test.ts`:

```ts
import { renderHook, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useOnboardingGate } from './useOnboardingGate';

describe('useOnboardingGate', () => {
  afterEach(async () => {
    await AsyncStorage.clear();
  });

  it('reports seen=false once loading finishes, when nothing was marked', async () => {
    const { result } = await renderHook(() => useOnboardingGate());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.seen).toBe(false);
  });
});
```

`renderHook` (per the Week 2 note) already awaits effects to flush before resolving, so `loading` is already `false` by the time `result` is available — there's no way to observe the initial `true` value from the test, so don't assert it.

- [ ] **Step 2: Run the test, confirm it fails**

```bash
yarn test useOnboardingGate
```

Expected: FAIL — `Cannot find module './useOnboardingGate'`.

- [ ] **Step 3: Implementation**

Create `hooks/useOnboardingGate.ts`:

```ts
import { useEffect, useState } from 'react';
import { loadOnboardingSeen } from '../lib/storage';

export function useOnboardingGate() {
  const [loading, setLoading] = useState(true);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const value = await loadOnboardingSeen();
      if (cancelled) return;
      setSeen(value);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { loading, seen };
}
```

- [ ] **Step 4: Run the test, confirm it passes**

```bash
yarn test useOnboardingGate
```

Expected: PASS.

- [ ] **Step 5: Add a test for the already-seen case**

Add to `hooks/useOnboardingGate.test.ts`:

```ts
import { markOnboardingSeen } from '../lib/storage';

  it('reports seen=true after onboarding was marked', async () => {
    await markOnboardingSeen();
    const { result } = await renderHook(() => useOnboardingGate());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.seen).toBe(true);
  });
```

- [ ] **Step 6: Run all tests, confirm they pass**

```bash
yarn test useOnboardingGate
```

Expected: PASS, 2 tests.

- [ ] **Step 7: Commit**

```bash
git add hooks/useOnboardingGate.ts hooks/useOnboardingGate.test.ts
git commit -m "feat: add useOnboardingGate hook"
```

---

### Task 3: `useThemePreference` hook (TDD)

**Files:**
- Create: `hooks/useThemePreference.ts`
- Test: `hooks/useThemePreference.test.ts`

**Interfaces:**
- Consumes: `loadThemePreference`, `saveThemePreference` (Task 1), `useColorScheme` from `nativewind`
- Produces: `useThemePreference(): { preference: ThemePreference; setPreference: (next: ThemePreference) => void }` — used by Task 5 (`SettingsScreen`)

- [ ] **Step 1: Enable manual dark mode in Tailwind**

NativeWind's `setColorScheme` throws unless Tailwind is configured for manual (class-based) dark mode — by default it's `'media'` (system-only, no manual override possible). Add to `tailwind.config.js`:

```js
module.exports = {
  darkMode: 'class',
  // ...rest unchanged
};
```

- [ ] **Step 2: Write the first test**

Create `hooks/useThemePreference.test.ts`:

```ts
import { renderHook, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useThemePreference } from './useThemePreference';

// NativeWind's setColorScheme requires darkMode:'class' to have been compiled into
// global.css by Metro — that pipeline doesn't run under Jest, so calling the real
// setColorScheme here throws. This hook's job is to bridge storage <-> NativeWind's
// API, not to re-verify NativeWind's own dark-mode rendering (that's covered by
// manual testing on the simulator in Task 8), so the module is mocked.
jest.mock('nativewind', () => ({
  useColorScheme: () => ({ setColorScheme: jest.fn(), colorScheme: 'light' }),
}));

describe('useThemePreference', () => {
  afterEach(async () => {
    await AsyncStorage.clear();
  });

  it('defaults to system when nothing was saved', async () => {
    const { result } = await renderHook(() => useThemePreference());
    await waitFor(() => expect(result.current.preference).toBe('system'));
  });
});
```

- [ ] **Step 3: Run the test, confirm it fails**

```bash
yarn test useThemePreference
```

Expected: FAIL — `Cannot find module './useThemePreference'`.

- [ ] **Step 4: Implementation**

Create `hooks/useThemePreference.ts`:

```ts
import { useEffect, useState } from 'react';
import { useColorScheme } from 'nativewind';
import { loadThemePreference, saveThemePreference } from '../lib/storage';
import type { ThemePreference } from '../types/theme';

export function useThemePreference() {
  const { setColorScheme } = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const saved = await loadThemePreference();
      if (cancelled || !saved) return;
      setPreferenceState(saved);
      setColorScheme(saved);
    })();

    return () => {
      cancelled = true;
    };
    // Runs once on mount only — setColorScheme's identity is stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setPreference = (next: ThemePreference) => {
    setPreferenceState(next);
    setColorScheme(next);
    saveThemePreference(next);
  };

  return { preference, setPreference };
}
```

- [ ] **Step 5: Run the test, confirm it passes**

```bash
yarn test useThemePreference
```

Expected: PASS.

- [ ] **Step 6: Add tests for loading a saved preference and for persisting a new one**

Add to `hooks/useThemePreference.test.ts`:

```ts
import { act } from '@testing-library/react-native';
import { loadThemePreference, saveThemePreference } from '../lib/storage';

  it('loads a previously saved preference on mount', async () => {
    await saveThemePreference('light');
    const { result } = await renderHook(() => useThemePreference());
    await waitFor(() => expect(result.current.preference).toBe('light'));
  });

  it('persists a newly chosen preference', async () => {
    const { result } = await renderHook(() => useThemePreference());
    await waitFor(() => expect(result.current.preference).toBe('system'));

    await act(async () => {
      result.current.setPreference('dark');
    });

    expect(result.current.preference).toBe('dark');
    await waitFor(async () => expect(await loadThemePreference()).toBe('dark'));
  });
```

- [ ] **Step 7: Run all tests, confirm they pass**

```bash
yarn test useThemePreference
```

Expected: PASS, 3 tests.

- [ ] **Step 8: Check the TypeScript build and commit**

```bash
npx tsc --noEmit
```

Expected: no errors.

```bash
git add hooks/useThemePreference.ts hooks/useThemePreference.test.ts
git commit -m "feat: add useThemePreference hook"
```

---

### Task 4: OnboardingScreen

**Files:**
- Create: `screens/onboarding/OnboardingScreen.tsx`
- Create: `screens/onboarding/OnboardingScreen.styles.ts`
- Test: `screens/onboarding/OnboardingScreen.test.tsx`

**Interfaces:**
- Consumes: `Tile` (Week 1), `markOnboardingSeen` (Task 1), `RootStackParamList` (Task 6 — see note below)
- Produces: `<OnboardingScreen navigation route>` (a `NativeStackScreenProps<RootStackParamList, 'Onboarding'>`) — registered in Task 6 (`AppNavigator`)

Note: `RootStackParamList` doesn't gain its `'Onboarding'` member until Task 6. For this task's test, pass a plain mock navigation object typed `any` rather than importing the real (not-yet-updated) type — Task 6 wires the real type once the route exists.

- [ ] **Step 1: Write the first test**

Create `screens/onboarding/OnboardingScreen.test.tsx`:

```tsx
import { render, screen, fireEvent } from '@testing-library/react-native';
import { OnboardingScreen } from './OnboardingScreen';

describe('OnboardingScreen', () => {
  it('shows the first step title', async () => {
    const navigation = { replace: jest.fn() } as any;
    await render(<OnboardingScreen navigation={navigation} route={{} as any} />);
    expect(screen.getByText('Як грати')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run the test, confirm it fails**

```bash
yarn test OnboardingScreen
```

Expected: FAIL — `Cannot find module './OnboardingScreen'`.

- [ ] **Step 3: Create the styles**

```ts
// screens/onboarding/OnboardingScreen.styles.ts
export const onboardingStyles = {
  container: 'flex-1 justify-between bg-white dark:bg-gray-900 p-6',
  content: 'flex-1 items-center justify-center gap-4',
  title: 'text-2xl font-bold text-center text-black dark:text-white',
  body: 'text-base text-center text-gray-600 dark:text-gray-300',
  tileRow: 'flex-row gap-2 mt-4',
  footer: 'flex-row justify-between items-center',
  skipText: 'text-gray-500 dark:text-gray-400',
  nextButton: 'bg-green-600 rounded px-6 py-3',
  nextButtonText: 'text-white font-bold',
};
```

- [ ] **Step 4: Create the component**

```tsx
// screens/onboarding/OnboardingScreen.tsx
import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Tile } from '../../components/grid/Tile';
import { markOnboardingSeen } from '../../lib/storage';
import { onboardingStyles } from './OnboardingScreen.styles';

const STEPS = [
  {
    title: 'Як грати',
    body: 'Вгадайте українське слово з 5 літер за 6 спроб. Після кожної спроби кольори підказують, наскільки ви близькі.',
  },
  {
    title: 'Що означають кольори',
    body: 'Зелений — літера на своєму місці. Жовтий — літера є в слові, але на іншому місці. Сірий — літери немає в слові.',
  },
  {
    title: 'Слово дня',
    body: 'Кожного дня — нове слово. Вигравайте день у день, щоб наростити серію перемог (streak).',
  },
];

type Props = {
  navigation: { replace: (screen: 'Game') => void };
  route: unknown;
};

export function OnboardingScreen({ navigation }: Props) {
  const [step, setStep] = useState(0);
  const isLastStep = step === STEPS.length - 1;

  const finish = async () => {
    await markOnboardingSeen();
    navigation.replace('Game');
  };

  const handleNext = () => {
    if (isLastStep) {
      finish();
    } else {
      setStep((s) => s + 1);
    }
  };

  return (
    <View className={onboardingStyles.container}>
      <View className={onboardingStyles.content}>
        <Text className={onboardingStyles.title}>{STEPS[step].title}</Text>
        <Text className={onboardingStyles.body}>{STEPS[step].body}</Text>
        {step === 1 ? (
          <View className={onboardingStyles.tileRow}>
            <Tile letter="А" state="correct" />
            <Tile letter="Б" state="present" />
            <Tile letter="В" state="absent" />
          </View>
        ) : null}
      </View>

      <View className={onboardingStyles.footer}>
        <Pressable onPress={finish}>
          <Text className={onboardingStyles.skipText}>Пропустити</Text>
        </Pressable>
        <Pressable onPress={handleNext} className={onboardingStyles.nextButton}>
          <Text className={onboardingStyles.nextButtonText}>
            {isLastStep ? 'Почати гру' : 'Далі'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
```

- [ ] **Step 5: Run the test, confirm it passes**

```bash
yarn test OnboardingScreen
```

Expected: PASS.

- [ ] **Step 6: Add tests for advancing through steps and for finishing**

Add to `screens/onboarding/OnboardingScreen.test.tsx`:

```tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { act } from '@testing-library/react-native';
import { loadOnboardingSeen } from '../../lib/storage';

  afterEach(async () => {
    await AsyncStorage.clear();
  });

  it('advances through all three steps via "Далі"', async () => {
    const navigation = { replace: jest.fn() } as any;
    await render(<OnboardingScreen navigation={navigation} route={{} as any} />);

    await act(async () => {
      fireEvent.press(screen.getByText('Далі'));
    });
    expect(screen.getByText('Що означають кольори')).toBeTruthy();

    await act(async () => {
      fireEvent.press(screen.getByText('Далі'));
    });
    expect(screen.getByText('Слово дня')).toBeTruthy();
    expect(screen.getByText('Почати гру')).toBeTruthy();
  });

  it('marks onboarding seen and navigates to Game when finishing', async () => {
    const navigation = { replace: jest.fn() } as any;
    await render(<OnboardingScreen navigation={navigation} route={{} as any} />);

    await act(async () => {
      fireEvent.press(screen.getByText('Пропустити'));
    });

    expect(navigation.replace).toHaveBeenCalledWith('Game');
    expect(await loadOnboardingSeen()).toBe(true);
  });
```

(Move the `describe` block's existing `afterEach` next to the new one, or merge them into a single `afterEach` — don't register two.)

Both `fireEvent.press` calls that trigger a `setState` need the `act(async () => {...})` wrapper — plain `fireEvent.press(...)` outside `act` doesn't reliably flush the state update before the following assertion in this RNTL version (same underlying concurrent-renderer behavior as the `render()`/`renderHook()` async notes from Week 1-2).

- [ ] **Step 7: Run all tests, confirm they pass**

```bash
yarn test OnboardingScreen
```

Expected: PASS, 3 tests.

- [ ] **Step 8: Check the TypeScript build and commit**

```bash
npx tsc --noEmit
```

Expected: no errors.

```bash
git add screens/onboarding/OnboardingScreen.tsx screens/onboarding/OnboardingScreen.styles.ts screens/onboarding/OnboardingScreen.test.tsx
git commit -m "feat: add onboarding screen"
```

---

### Task 5: SettingsScreen

**Files:**
- Create: `screens/settings/SettingsScreen.tsx`
- Create: `screens/settings/SettingsScreen.styles.ts`
- Test: `screens/settings/SettingsScreen.test.tsx`

**Interfaces:**
- Consumes: `useThemePreference` (Task 3), `ThemePreference` (Task 1)
- Produces: `<SettingsScreen>` — registered in Task 6 (`AppNavigator`)

- [ ] **Step 1: Write the first test**

Create `screens/settings/SettingsScreen.test.tsx`:

```tsx
import { render, screen, fireEvent } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SettingsScreen } from './SettingsScreen';

describe('SettingsScreen', () => {
  afterEach(async () => {
    await AsyncStorage.clear();
  });

  it('renders all three theme options', async () => {
    await render(<SettingsScreen />);
    expect(screen.getByText('Світла')).toBeTruthy();
    expect(screen.getByText('Темна')).toBeTruthy();
    expect(screen.getByText('Системна')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run the test, confirm it fails**

```bash
yarn test SettingsScreen
```

Expected: FAIL — `Cannot find module './SettingsScreen'`.

- [ ] **Step 3: Create the styles**

```ts
// screens/settings/SettingsScreen.styles.ts
export const settingsStyles = {
  container: 'flex-1 bg-white dark:bg-gray-900 p-4 gap-2',
  row: 'flex-row justify-between items-center p-4 rounded bg-gray-100 dark:bg-gray-800',
  rowActive: 'border-2 border-green-600',
  rowText: 'text-base text-black dark:text-white',
  checkmark: 'text-green-600 font-bold',
};
```

- [ ] **Step 4: Create the component**

```tsx
// screens/settings/SettingsScreen.tsx
import { View, Text, Pressable } from 'react-native';
import { useThemePreference } from '../../hooks/useThemePreference';
import { settingsStyles } from './SettingsScreen.styles';
import type { ThemePreference } from '../../types/theme';

const OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: 'light', label: 'Світла' },
  { value: 'dark', label: 'Темна' },
  { value: 'system', label: 'Системна' },
];

export function SettingsScreen() {
  const { preference, setPreference } = useThemePreference();

  return (
    <View className={settingsStyles.container}>
      {OPTIONS.map((option) => {
        const active = option.value === preference;
        return (
          <Pressable
            key={option.value}
            onPress={() => setPreference(option.value)}
            className={`${settingsStyles.row} ${active ? settingsStyles.rowActive : ''}`}
          >
            <Text className={settingsStyles.rowText}>{option.label}</Text>
            {active ? <Text className={settingsStyles.checkmark}>✓</Text> : null}
          </Pressable>
        );
      })}
    </View>
  );
}
```

- [ ] **Step 5: Run the test, confirm it passes**

```bash
yarn test SettingsScreen
```

Expected: PASS.

- [ ] **Step 6: Add a test for switching the active option**

Add to `screens/settings/SettingsScreen.test.tsx`:

```tsx
import { waitFor } from '@testing-library/react-native';
import { loadThemePreference } from '../../lib/storage';

  it('persists the chosen option when pressed', async () => {
    await render(<SettingsScreen />);
    fireEvent.press(screen.getByText('Темна'));
    await waitFor(async () => expect(await loadThemePreference()).toBe('dark'));
  });
```

- [ ] **Step 7: Run all tests, confirm they pass**

```bash
yarn test SettingsScreen
```

Expected: PASS, 2 tests.

- [ ] **Step 8: Check the TypeScript build and commit**

```bash
npx tsc --noEmit
```

Expected: no errors.

```bash
git add screens/settings/SettingsScreen.tsx screens/settings/SettingsScreen.styles.ts screens/settings/SettingsScreen.test.tsx
git commit -m "feat: add settings screen with theme picker"
```

---

### Task 6: Wire onboarding gate, Settings screen, and header button into AppNavigator

**Files:**
- Modify: `navigation/AppNavigator.tsx`

**Interfaces:**
- Consumes: `useOnboardingGate` (Task 2), `OnboardingScreen` (Task 4), `SettingsScreen` (Task 5)
- Produces: updated `RootStackParamList` with `Onboarding` and `Settings` members

- [ ] **Step 1: Rewrite the navigator**

```tsx
// navigation/AppNavigator.tsx
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Pressable, Text } from 'react-native';
import { GameScreen } from '../screens/game/GameScreen';
import { OnboardingScreen } from '../screens/onboarding/OnboardingScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { useOnboardingGate } from '../hooks/useOnboardingGate';

export type RootStackParamList = {
  Onboarding: undefined;
  Game: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const { loading, seen } = useOnboardingGate();

  if (loading) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={seen ? 'Game' : 'Onboarding'}>
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Game"
          component={GameScreen}
          options={({ navigation }) => ({
            title: 'Wordle UA',
            headerRight: () => (
              <Pressable onPress={() => navigation.navigate('Settings')}>
                <Text className="text-xl">⚙️</Text>
              </Pressable>
            ),
          })}
        />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Налаштування' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

- [ ] **Step 2: Check the TypeScript build**

```bash
npx tsc --noEmit
```

Expected: no errors. `OnboardingScreen`'s hand-written `Props` type (Task 4) is structurally compatible with what `Stack.Screen`'s `component` prop expects, since it only uses `navigation.replace('Game')` and ignores `route`.

- [ ] **Step 3: Run the full test suite and lint**

```bash
yarn test
yarn lint
```

Expected: all tests pass, lint reports no errors.

- [ ] **Step 4: Commit**

```bash
git add navigation/AppNavigator.tsx
git commit -m "feat: wire onboarding gate and settings navigation"
```

---

### Task 7: Dark mode variants for existing components

**Files:**
- Modify: `components/grid/Tile.styles.ts`
- Modify: `components/keyboard/Key.styles.ts`
- Modify: `screens/game/GameScreen.styles.ts`
- Modify: `components/modal/ResultModal.styles.ts`

**Interfaces:**
- No signature changes — style-only edits. Existing tests must still pass unchanged (they assert on `correct`/`present`/`absent` class names, which don't change).

- [ ] **Step 1: Add dark variants to `Tile.styles.ts`**

```ts
// components/grid/Tile.styles.ts
export const tileStyles = {
  base: 'w-14 h-14 border-2 border-gray-400 dark:border-gray-600 items-center justify-center',
  text: 'text-2xl font-bold text-white',
  states: {
    correct: 'bg-green-600 border-green-600',
    present: 'bg-yellow-500 border-yellow-500',
    absent: 'bg-gray-500 border-gray-500',
    empty: 'bg-transparent border-gray-400 dark:border-gray-600',
  },
};
```

- [ ] **Step 2: Add dark variants to `Key.styles.ts`**

```ts
// components/keyboard/Key.styles.ts
export const keyStyles = {
  base: 'h-12 rounded items-center justify-center px-1',
  wide: 'flex-[2.2]',
  narrow: 'flex-1',
  text: 'text-xs font-semibold',
  states: {
    default: { bg: 'bg-gray-300 dark:bg-gray-700', text: 'text-black dark:text-white' },
    correct: { bg: 'bg-green-600', text: 'text-white' },
    present: { bg: 'bg-yellow-500', text: 'text-white' },
    absent: { bg: 'bg-gray-500', text: 'text-white' },
  },
};
```

- [ ] **Step 3: Add a dark variant to `GameScreen.styles.ts`**

```ts
// screens/game/GameScreen.styles.ts
export const gameScreenStyles = {
  container: 'flex-1 justify-between bg-white dark:bg-gray-900 py-4',
};
```

- [ ] **Step 4: Add dark variants to `ResultModal.styles.ts`**

```ts
// components/modal/ResultModal.styles.ts
export const resultModalStyles = {
  backdrop: 'flex-1 items-center justify-center bg-black/50',
  card: 'w-11/12 max-w-sm rounded-lg bg-white dark:bg-gray-800 p-6',
  headline: 'text-2xl font-bold text-center mb-4 text-black dark:text-white',
  statsRow: 'flex-row justify-between mb-4',
  statItem: 'items-center',
  statValue: 'text-2xl font-bold text-black dark:text-white',
  statLabel: 'text-xs text-gray-500 dark:text-gray-400',
  distribution: 'mb-4',
  distributionRow: 'flex-row items-center mb-1',
  distributionLabel: 'w-4 text-xs text-black dark:text-white',
  distributionBar: 'bg-green-600 justify-end px-1 min-h-[18px]',
  distributionCount: 'text-white text-xs font-semibold',
  shareButton: 'bg-green-600 rounded py-3 items-center',
  shareButtonText: 'text-white font-bold',
};
```

- [ ] **Step 5: Run the full test suite, lint, and typecheck**

```bash
yarn test
yarn lint
npx tsc --noEmit
```

Expected: all pass unchanged — these are additive class-name edits.

- [ ] **Step 6: Commit**

```bash
git add components/grid/Tile.styles.ts components/keyboard/Key.styles.ts screens/game/GameScreen.styles.ts components/modal/ResultModal.styles.ts
git commit -m "feat: add dark mode variants to existing components"
```

---

### Task 8: Manual verification

**Files:** none — verification only.

- [ ] **Step 1: Clear the onboarding flag and reinstall on the simulator**

Onboarding only shows once; to see it again during testing, uninstall the app from the simulator (or clear AsyncStorage — easiest is uninstalling: long-press the app icon on the simulator's home screen and delete it) before reinstalling.

- [ ] **Step 2: Rebuild and run on the iOS simulator**

```bash
RCT_METRO_PORT=8090 npx expo run:ios --port 8090
```

No new native dependency was added this week, so a full native rebuild isn't strictly required — a JS reload of the existing dev-client build should pick up all the changes. Rebuild anyway if the app was ever fully closed and native module state seems stale (see the Week 1/2 notes on the `RCTMetroPort`/8081 port conflict if this comes up again).

- [ ] **Step 3: Verify onboarding**

Expected: the 3-step onboarding shows on first launch; the "colors" step (step 2) shows 3 real `Tile` components in `correct`/`present`/`absent` colors; "Пропустити" and "Почати гру" both land on the game screen; force-quitting and reopening the app does **not** show onboarding again.

- [ ] **Step 4: Verify the settings screen and theme switching**

Tap the "⚙️" button in the game screen's header. Expected: navigates to Налаштування, showing 3 rows with the current selection checked. Tap "Темна" — expected: the whole app (game screen, grid borders, keyboard default keys) switches to dark colors immediately, without needing to restart. Tap "Системна" and change the simulator's system appearance (Settings app → Developer → Dark Appearance, or Xcode's Simulator menu → Features → Toggle Appearance) — expected: the app follows the system setting only while "Системна" is selected.

- [ ] **Step 5: Run the full automated suite one more time**

```bash
yarn test
yarn lint
npx tsc --noEmit
```

Expected: all green.

- [ ] **Step 6: Ask the project owner to verify on their own iPhone via Expo Go**

```bash
yarn start
```

Scan the QR code with the iPhone's camera (or open in Expo Go). Note: Expo Go only supports the standard Expo SDK module set — if `@react-native-async-storage/async-storage` or `react-native-reanimated` fail to load in Expo Go specifically (as opposed to the custom dev-client build used on the simulator), that's expected and means real-device testing needs the dev-client build shared to the device instead, which is out of scope for this week's plan and can be revisited if it comes up.

- [ ] **Step 7: Commit if any fixes were needed during verification**

If Steps 3-6 required code changes, commit them with a message describing what was fixed (following the same pattern as the Week 1/2 layout-bug fixes found during manual verification).

---

## Done when

- `yarn test` — all tests pass (extended `lib/storage.ts`, `useOnboardingGate`, `useThemePreference`, `OnboardingScreen`, `SettingsScreen`, plus everything from Weeks 1-2)
- `yarn lint` — no errors
- `npx tsc --noEmit` — no errors
- Onboarding shows once, settings screen switches themes live, and the project owner has confirmed it also runs via Expo Go on their own iPhone (or the dev-client limitation was noted if it doesn't)
