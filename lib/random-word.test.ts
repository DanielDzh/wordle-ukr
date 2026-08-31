import { pickRandomWord } from './random-word';

describe('pickRandomWord', () => {
  it('returns the only word when the list has just one', () => {
    expect(pickRandomWord(['зебра'], 'зебра')).toBe('зебра');
  });

  it('never returns the excluded word when alternatives exist', () => {
    const words = ['зебра', 'лимон'];
    for (let i = 0; i < 20; i++) {
      expect(pickRandomWord(words, 'зебра')).toBe('лимон');
    }
  });

  it('can return any word from the list when nothing is excluded', () => {
    const words = ['зебра', 'лимон'];
    const results = new Set(Array.from({ length: 30 }, () => pickRandomWord(words, undefined)));
    expect(results.size).toBeGreaterThan(0);
    results.forEach((word) => expect(words).toContain(word));
  });
});
