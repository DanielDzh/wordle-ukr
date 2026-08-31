import { createInitialStats, updateStats } from './stats';

describe('updateStats', () => {
  it('records a win in 3 guesses', () => {
    const next = updateStats(createInitialStats(), true, 3);
    expect(next).toEqual({
      gamesPlayed: 1,
      gamesWon: 1,
      currentStreak: 1,
      maxStreak: 1,
      guessDistribution: [0, 0, 1, 0, 0, 0],
    });
  });

  it('resets currentStreak on a loss without touching guessDistribution', () => {
    const afterWin = updateStats(createInitialStats(), true, 2);
    const afterLoss = updateStats(afterWin, false, 6);
    expect(afterLoss).toEqual({
      gamesPlayed: 2,
      gamesWon: 1,
      currentStreak: 0,
      maxStreak: 1,
      guessDistribution: [0, 1, 0, 0, 0, 0],
    });
  });

  it('keeps maxStreak after currentStreak drops', () => {
    let stats = createInitialStats();
    stats = updateStats(stats, true, 1);
    stats = updateStats(stats, true, 1);
    stats = updateStats(stats, false, 6);
    expect(stats.maxStreak).toBe(2);
    expect(stats.currentStreak).toBe(0);
  });
});
