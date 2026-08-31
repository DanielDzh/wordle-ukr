export type LetterState = 'correct' | 'present' | 'absent';

export type GuessResult = LetterState[];

export type GameStatus = 'playing' | 'won' | 'lost';

export type Guess = {
  letters: string[];
  states: LetterState[];
};

export type GameState = {
  status: GameStatus;
  answer: string;
  currentGuess: string;
  guesses: Guess[];
  shakeTrigger: number;
  hintsUsed: number;
};

export type GameAction =
  | { type: 'KEY_PRESS'; key: string }
  | { type: 'HYDRATE'; state: GameState }
  | { type: 'HINT' };

export type Stats = {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: [number, number, number, number, number, number];
};
