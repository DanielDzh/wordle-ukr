import { VALID_WORDS } from '../data/valid-words';
import { compareWord } from './word-comparison';
import type { GameAction, GameState } from '../types/game';

const WORD_LENGTH = 5;
const MAX_GUESSES = 6;
const VALID_WORD_SET = new Set(VALID_WORDS);

export function isValidWord(word: string): boolean {
  return VALID_WORD_SET.has(word.toLowerCase());
}

export function createInitialGameState(answer: string): GameState {
  return { status: 'playing', answer, currentGuess: '', guesses: [], shakeTrigger: 0 };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  if (action.type === 'HYDRATE') {
    return action.state;
  }

  if (state.status !== 'playing') {
    return state;
  }

  if (action.key === 'DELETE') {
    return { ...state, currentGuess: state.currentGuess.slice(0, -1) };
  }

  if (action.key === 'ENTER') {
    if (state.currentGuess.length !== WORD_LENGTH) {
      return state;
    }

    if (!isValidWord(state.currentGuess)) {
      // `?? 0` guards against state hydrated from AsyncStorage before this field
      // existed — without it, `undefined + 1` is NaN, and NaN + 1 stays NaN forever
      // (React's effect-dependency check treats NaN as equal to itself), silently
      // breaking the shake animation for the rest of that game.
      return { ...state, shakeTrigger: (state.shakeTrigger ?? 0) + 1 };
    }

    const letters = state.currentGuess.split('');
    const guessStates = compareWord(state.currentGuess.toLowerCase(), state.answer);
    const guesses = [...state.guesses, { letters, states: guessStates }];
    const won = guessStates.every((letterState) => letterState === 'correct');
    const lost = !won && guesses.length >= MAX_GUESSES;

    return {
      ...state,
      guesses,
      currentGuess: '',
      status: won ? 'won' : lost ? 'lost' : 'playing',
    };
  }

  if (state.currentGuess.length >= WORD_LENGTH) {
    return state;
  }

  return { ...state, currentGuess: state.currentGuess + action.key };
}
