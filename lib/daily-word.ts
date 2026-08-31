function toLocalDayNumber(date: Date): number {
  const local = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.floor(local.getTime() / 86_400_000);
}

export function getDailyWordIndex(today: Date, epoch: Date, wordCount: number): number {
  const diffDays = toLocalDayNumber(today) - toLocalDayNumber(epoch);
  return ((diffDays % wordCount) + wordCount) % wordCount;
}

export const EPOCH_DATE = new Date(2026, 7, 31);

export function getTodayWord(words: string[], today: Date = new Date()): string {
  const index = getDailyWordIndex(today, EPOCH_DATE, words.length);
  return words[index];
}
