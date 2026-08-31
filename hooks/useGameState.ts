import { useEffect, useReducer, useState } from 'react';
import { WORDS } from '../data/words';
import { getTodayWord } from '../lib/daily-word';
import { createInitialGameState, gameReducer } from '../lib/game-reducer';
import { hapticError, hapticSuccess } from '../lib/haptics';
import { mergeLetterStates } from '../lib/keyboard-letter-states';
import { createInitialStats, updateStats } from '../lib/stats';
import { loadDailyGame, loadStats, saveDailyGame, saveStats } from '../lib/storage';
import type { Stats } from '../types/game';

function todayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

export function useGameState() {
  const [today] = useState(() => new Date());
  const [state, dispatch] = useReducer(gameReducer, getTodayWord(WORDS, today), createInitialGameState);
  const [stats, setStats] = useState<Stats>(createInitialStats());
  const [hydrated, setHydrated] = useState(false);
  const [statsRecorded, setStatsRecorded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const [savedGame, savedStats] = await Promise.all([loadDailyGame(), loadStats()]);
      if (cancelled) return;
      if (savedStats) setStats(savedStats);
      if (savedGame && savedGame.date === todayKey(today)) {
        dispatch({ type: 'HYDRATE', state: savedGame.state });
      }
      setHydrated(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [today]);

  useEffect(() => {
    if (!hydrated) return;
    saveDailyGame(todayKey(today), state);
  }, [state, hydrated, today]);

  useEffect(() => {
    if (state.status === 'playing' || statsRecorded) return;
    const won = state.status === 'won';
    const next = updateStats(stats, won, state.guesses.length);
    setStats(next);
    saveStats(next);
    setStatsRecorded(true);
    if (won) {
      hapticSuccess();
    } else {
      hapticError();
    }
    // stats is intentionally omitted from deps: this effect must run exactly once per
    // status transition away from 'playing', not re-run when setStats updates `stats`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status, statsRecorded]);

  return {
    state,
    stats,
    letterStates: mergeLetterStates(state.guesses),
    handleKeyPress: (key: string) => dispatch({ type: 'KEY_PRESS', key }),
  };
}
