import { useEffect, useReducer, useRef, useState } from 'react';
import { WORDS } from '../data/words';
import { getTodayWord } from '../lib/daily-word';
import { createInitialGameState, gameReducer, MAX_HINTS } from '../lib/game-reducer';
import { hapticError, hapticLight, hapticSuccess } from '../lib/haptics';
import { mergeLetterStates } from '../lib/keyboard-letter-states';
import { createInitialStats, updateStats } from '../lib/stats';
import { loadDailyGame, loadStats, saveDailyGame, saveStats } from '../lib/storage';
import type { Stats } from '../types/game';

const todayKey = (date: Date): string => {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
};

export const useGameState = () => {
  const [today] = useState(() => new Date());
  const [state, dispatch] = useReducer(gameReducer, getTodayWord(WORDS, today), createInitialGameState);
  const [stats, setStats] = useState<Stats>(createInitialStats());
  const [hydrated, setHydrated] = useState(false);
  const [statsRecorded, setStatsRecorded] = useState(false);
  const prevShakeTrigger = useRef(state.shakeTrigger);
  // Distinct from state.shakeTrigger (which is persisted and restored as-is on
  // hydration): this only increments for a shake that happens live, in this
  // session, so restoring a game with a nonzero shakeTrigger from an earlier
  // invalid guess today doesn't replay the shake animation on every reopen.
  const [sessionShakeTrigger, setSessionShakeTrigger] = useState(0);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const [savedGame, savedStats] = await Promise.all([loadDailyGame(), loadStats()]);
      if (cancelled) return;
      if (savedStats) setStats(savedStats);
      if (savedGame && savedGame.date === todayKey(today)) {
        prevShakeTrigger.current = savedGame.state.shakeTrigger ?? 0;
        // A game that was already won/lost before this launch already had its
        // result recorded in stats back when it actually finished — without
        // this, the stats-recording effect below would count it again on
        // every single app open (or any remount), inflating gamesPlayed and
        // streak indefinitely.
        if (savedGame.state.status !== 'playing') {
          setStatsRecorded(true);
        }
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
    if (!hydrated) return;
    if (state.shakeTrigger !== prevShakeTrigger.current) {
      hapticLight();
      prevShakeTrigger.current = state.shakeTrigger;
      setSessionShakeTrigger((n) => n + 1);
    }
  }, [state.shakeTrigger, hydrated]);

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
    shakeTrigger: sessionShakeTrigger,
    hintsRemaining: MAX_HINTS - (state.hintsUsed ?? 0),
    handleKeyPress: (key: string) => dispatch({ type: 'KEY_PRESS', key }),
    handleHint: () => dispatch({ type: 'HINT' }),
  };
};
