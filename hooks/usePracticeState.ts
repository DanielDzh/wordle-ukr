import { useEffect, useReducer, useRef, useState } from 'react';
import { WORDS } from '../data/words';
import { createInitialGameState, gameReducer, MAX_HINTS } from '../lib/game-reducer';
import { hapticError, hapticLight, hapticSuccess } from '../lib/haptics';
import { mergeLetterStates } from '../lib/keyboard-letter-states';
import { pickRandomWord } from '../lib/random-word';
import { loadPracticeRecord, savePracticeRecord } from '../lib/storage';

// Long enough for the winning row's flip + bounce animation (see Grid.TOTAL_WIN_ANIMATION_MS)
// to finish before the next word silently takes over the board.
export const AUTO_ADVANCE_DELAY_MS = 1500;

export function usePracticeState() {
  const [word, setWord] = useState(() => pickRandomWord(WORDS, undefined));
  const [state, dispatch] = useReducer(gameReducer, word, createInitialGameState);
  const [streak, setStreak] = useState(0);
  const [record, setRecord] = useState(0);
  const prevShakeTrigger = useRef(state.shakeTrigger);

  useEffect(() => {
    loadPracticeRecord().then(setRecord);
  }, []);

  useEffect(() => {
    if (state.shakeTrigger !== prevShakeTrigger.current) {
      hapticLight();
      prevShakeTrigger.current = state.shakeTrigger;
    }
  }, [state.shakeTrigger]);

  useEffect(() => {
    if (state.status === 'lost') {
      hapticError();
      return;
    }
    if (state.status !== 'won') return;

    hapticSuccess();
    const nextStreak = streak + 1;
    setStreak(nextStreak);
    if (nextStreak > record) {
      setRecord(nextStreak);
      savePracticeRecord(nextStreak);
    }

    const timeout = setTimeout(() => {
      const nextWord = pickRandomWord(WORDS, word);
      setWord(nextWord);
      dispatch({ type: 'HYDRATE', state: createInitialGameState(nextWord) });
    }, AUTO_ADVANCE_DELAY_MS);
    return () => clearTimeout(timeout);
    // streak/record/word are read via closure at the moment status flips to
    // 'won' — re-running this effect on their own updates would restart the timer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status]);

  const handleRetry = () => {
    setStreak(0);
    const nextWord = pickRandomWord(WORDS, word);
    setWord(nextWord);
    dispatch({ type: 'HYDRATE', state: createInitialGameState(nextWord) });
  };

  return {
    state,
    streak,
    record,
    letterStates: mergeLetterStates(state.guesses),
    shakeTrigger: state.shakeTrigger,
    hintsRemaining: MAX_HINTS - (state.hintsUsed ?? 0),
    handleKeyPress: (key: string) => dispatch({ type: 'KEY_PRESS', key }),
    handleHint: () => dispatch({ type: 'HINT' }),
    handleRetry,
  };
}
