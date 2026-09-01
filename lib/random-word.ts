export const pickRandomWord = (words: string[], exclude: string | undefined): string => {
  const candidates = words.length > 1 ? words.filter((word) => word !== exclude) : words;
  return candidates[Math.floor(Math.random() * candidates.length)];
};
