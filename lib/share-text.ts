import type { LetterState } from '../types/game';

const EMOJI: Record<LetterState, string> = {
  correct: '🟩',
  present: '🟨',
  absent: '⬛',
};

export const buildShareText = (
  guesses: { states: LetterState[] }[],
  dayIndex: number,
  won: boolean,
): string => {
  const header = `Wordle UA #${dayIndex} ${won ? guesses.length : 'X'}/6`;
  const grid = guesses.map((guess) => guess.states.map((state) => EMOJI[state]).join('')).join('\n');
  return `${header}\n\n${grid}`;
};
