import { EPOCH_DATE, getDailyWordIndex, getTodayWord } from './daily-word';

describe('getDailyWordIndex', () => {
  it('returns 0 when today is the same calendar day as the epoch', () => {
    const epoch = new Date(2026, 7, 31);
    const today = new Date(2026, 7, 31, 23, 59);
    expect(getDailyWordIndex(today, epoch, 33)).toBe(0);
  });

  it('returns 1 the day after the epoch', () => {
    const epoch = new Date(2026, 7, 31);
    const today = new Date(2026, 8, 1);
    expect(getDailyWordIndex(today, epoch, 33)).toBe(1);
  });

  it('wraps around using modulo when the day count exceeds the word count', () => {
    const epoch = new Date(2026, 7, 31);
    const today = new Date(2026, 8, 3); // 3 days after epoch
    expect(getDailyWordIndex(today, epoch, 3)).toBe(0);
  });
});

describe('getTodayWord', () => {
  it('returns the first word on the epoch date', () => {
    expect(getTodayWord(['а', 'б', 'в'], EPOCH_DATE)).toBe('а');
  });
});
