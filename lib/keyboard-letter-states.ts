import type { Guess, LetterState } from '../types/game';

const PRIORITY: Record<LetterState, number> = { absent: 0, present: 1, correct: 2 };

export function mergeLetterStates(guesses: Guess[]): Record<string, LetterState> {
  const result: Record<string, LetterState> = {};

  guesses.forEach((guess) => {
    guess.letters.forEach((letter, i) => {
      const state = guess.states[i];
      const existing = result[letter];
      if (!existing || PRIORITY[state] > PRIORITY[existing]) {
        result[letter] = state;
      }
    });
  });

  return result;
}
