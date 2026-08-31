import AsyncStorage from '@react-native-async-storage/async-storage';
import { createInitialGameState } from './game-reducer';
import { loadDailyGame, loadStats, saveDailyGame, saveStats } from './storage';
import type { Stats } from '../types/game';

describe('storage', () => {
  afterEach(async () => {
    await AsyncStorage.clear();
  });

  it('returns null when no stats have been saved', async () => {
    expect(await loadStats()).toBeNull();
  });

  it('saves and loads stats', async () => {
    const stats: Stats = {
      gamesPlayed: 1,
      gamesWon: 1,
      currentStreak: 1,
      maxStreak: 1,
      guessDistribution: [0, 1, 0, 0, 0, 0],
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
});
