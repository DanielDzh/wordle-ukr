import { compareWord } from './word-comparison';

describe('compareWord', () => {
  it('returns all "correct" when guess equals answer', () => {
    expect(compareWord('зебра', 'зебра')).toEqual([
      'correct', 'correct', 'correct', 'correct', 'correct',
    ]);
  });

  it('returns all "absent" when no letters match', () => {
    expect(compareWord('лимон', 'зебра')).toEqual([
      'absent', 'absent', 'absent', 'absent', 'absent',
    ]);
  });

  it('marks a letter as "present" when it exists elsewhere in the answer', () => {
    // "б" is correct (same position in both), "у" is absent (not in answer at all),
    // "а", "р", "з" exist in the answer but at different positions -> "present"
    expect(compareWord('арбуз', 'зебра')).toEqual([
      'present', 'present', 'correct', 'absent', 'present',
    ]);
  });

  it('handles duplicate letters correctly — does not over-mark "present"', () => {
    // answer "арбуз" has one "а" (used up by position 0's "correct") and one "р";
    // guess "азарт" has a second "а" at index 2 that must NOT be marked "present"
    // since there's no "а" left in the answer to account for it.
    expect(compareWord('азарт', 'арбуз')).toEqual([
      'correct', 'present', 'absent', 'present', 'absent',
    ]);
  });
});
