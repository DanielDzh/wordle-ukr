import AsyncStorage from '@react-native-async-storage/async-storage';
import type { GameState, Stats } from '../types/game';
import type { ThemePreference } from '../types/theme';

const STATS_KEY = 'wordle-ukr:stats';
const DAILY_GAME_KEY = 'wordle-ukr:daily-game';

export const loadStats = async (): Promise<Stats | null> => {
  const raw = await AsyncStorage.getItem(STATS_KEY);
  return raw ? (JSON.parse(raw) as Stats) : null;
};

export const saveStats = async (stats: Stats): Promise<void> => {
  await AsyncStorage.setItem(STATS_KEY, JSON.stringify(stats));
};

export const loadDailyGame = async (): Promise<{ date: string; state: GameState } | null> => {
  const raw = await AsyncStorage.getItem(DAILY_GAME_KEY);
  return raw ? (JSON.parse(raw) as { date: string; state: GameState }) : null;
};

export const saveDailyGame = async (date: string, state: GameState): Promise<void> => {
  await AsyncStorage.setItem(DAILY_GAME_KEY, JSON.stringify({ date, state }));
};

const ONBOARDING_SEEN_KEY = 'wordle-ukr:onboarding-seen';

export const loadOnboardingSeen = async (): Promise<boolean> => {
  const raw = await AsyncStorage.getItem(ONBOARDING_SEEN_KEY);
  return raw === 'true';
};

export const markOnboardingSeen = async (): Promise<void> => {
  await AsyncStorage.setItem(ONBOARDING_SEEN_KEY, 'true');
};

const PRACTICE_RECORD_KEY = 'wordle-ukr:practice-record';

export const loadPracticeRecord = async (): Promise<number> => {
  const raw = await AsyncStorage.getItem(PRACTICE_RECORD_KEY);
  return raw ? Number(raw) : 0;
};

export const savePracticeRecord = async (record: number): Promise<void> => {
  await AsyncStorage.setItem(PRACTICE_RECORD_KEY, String(record));
};

const THEME_PREFERENCE_KEY = 'wordle-ukr:theme-preference';

export const loadThemePreference = async (): Promise<ThemePreference | null> => {
  const raw = await AsyncStorage.getItem(THEME_PREFERENCE_KEY);
  return raw === 'light' || raw === 'dark' || raw === 'system' ? raw : null;
};

export const saveThemePreference = async (preference: ThemePreference): Promise<void> => {
  await AsyncStorage.setItem(THEME_PREFERENCE_KEY, preference);
};
