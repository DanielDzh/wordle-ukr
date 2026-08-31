import { compareWord } from './word-comparison';
import type { GameAction, GameState } from '../types/game';

const WORD_LENGTH = 5;
const MAX_GUESSES = 6;

export function createInitialGameState(answer: string): GameState {
  return { status: 'playing', answer, currentGuess: '', guesses: [] };
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
