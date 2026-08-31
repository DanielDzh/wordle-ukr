import AsyncStorage from '@react-native-async-storage/async-storage';
import type { GameState, Stats } from '../types/game';
import type { ThemePreference } from '../types/theme';

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

const ONBOARDING_SEEN_KEY = 'wordle-ukr:onboarding-seen';

export async function loadOnboardingSeen(): Promise<boolean> {
  const raw = await AsyncStorage.getItem(ONBOARDING_SEEN_KEY);
  return raw === 'true';
}

export async function markOnboardingSeen(): Promise<void> {
  await AsyncStorage.setItem(ONBOARDING_SEEN_KEY, 'true');
}

const THEME_PREFERENCE_KEY = 'wordle-ukr:theme-preference';

export async function loadThemePreference(): Promise<ThemePreference | null> {
  const raw = await AsyncStorage.getItem(THEME_PREFERENCE_KEY);
  return raw === 'light' || raw === 'dark' || raw === 'system' ? raw : null;
}

export async function saveThemePreference(preference: ThemePreference): Promise<void> {
  await AsyncStorage.setItem(THEME_PREFERENCE_KEY, preference);
}
