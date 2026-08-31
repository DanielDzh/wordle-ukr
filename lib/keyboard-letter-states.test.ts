import { mergeLetterStates } from './keyboard-letter-states';
import type { Guess } from '../types/game';

describe('mergeLetterStates', () => {
  it('returns an empty object for no guesses', () => {
    expect(mergeLetterStates([])).toEqual({});
  });

  it('records the state of each letter from a single guess', () => {
    const guesses: Guess[] = [{ letters: ['А', 'Б'], states: ['correct', 'absent'] }];
    expect(mergeLetterStates(guesses)).toEqual({ А: 'correct', Б: 'absent' });
  });

  it('keeps the highest-priority state when a letter appears in multiple guesses', () => {
    const guesses: Guess[] = [
      { letters: ['А'], states: ['absent'] },
      { letters: ['А'], states: ['present'] },
      { letters: ['А'], states: ['correct'] },
    ];
    expect(mergeLetterStates(guesses)).toEqual({ А: 'correct' });
  });

  it('does not downgrade a letter already marked correct', () => {
    const guesses: Guess[] = [
      { letters: ['А'], states: ['correct'] },
      { letters: ['А'], states: ['present'] },
    ];
    expect(mergeLetterStates(guesses)).toEqual({ А: 'correct' });
  });
});
