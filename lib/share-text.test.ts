import { buildShareText } from './share-text';
import type { LetterState } from '../types/game';

describe('buildShareText', () => {
  it('builds a win header with the guess count and an emoji grid', () => {
    const guesses: { states: LetterState[] }[] = [
      { states: ['absent', 'present', 'absent', 'absent', 'absent'] },
      { states: ['correct', 'correct', 'correct', 'correct', 'correct'] },
    ];
    expect(buildShareText(guesses, 1, true)).toBe('Wordle UA #1 2/6\n\n⬛🟨⬛⬛⬛\n🟩🟩🟩🟩🟩');
  });

  it('builds an X/6 header on a loss', () => {
    const guesses: { states: LetterState[] }[] = [
      { states: ['absent', 'absent', 'absent', 'absent', 'absent'] },
    ];
    expect(buildShareText(guesses, 5, false)).toBe('Wordle UA #5 X/6\n\n⬛⬛⬛⬛⬛');
  });
});
