import type { GuessResult, LetterState } from '../types/game';

export const compareWord = (guess: string, answer: string): GuessResult => {
  const guessLetters = guess.split('');
  const answerLetters = answer.split('');
  const result: LetterState[] = new Array(guessLetters.length).fill('absent');

  const remaining: Record<string, number> = {};

  guessLetters.forEach((letter, i) => {
    if (letter === answerLetters[i]) {
      result[i] = 'correct';
    } else {
      remaining[answerLetters[i]] = (remaining[answerLetters[i]] ?? 0) + 1;
    }
  });

  guessLetters.forEach((letter, i) => {
    if (result[i] === 'correct') return;
    if (remaining[letter] > 0) {
      result[i] = 'present';
      remaining[letter] -= 1;
    }
  });

  return result;
};
