import type { Stats } from '../types/game';

export const createInitialStats = (): Stats => {
  return {
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak: 0,
    maxStreak: 0,
    guessDistribution: [0, 0, 0, 0, 0, 0],
  };
};

export const updateStats = (prev: Stats, won: boolean, guessCount: number): Stats => {
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
};
