import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import type { LetterState } from '../../types/game';
import { Tile } from './Tile';
import { gridStyles } from './Grid.styles';

const ROWS = 6;
const COLS = 5;

// Tile flip timing (see Tile.tsx): each column starts REVEAL_STEP_MS after the
// previous one, and the flip itself takes REVEAL_DURATION_MS. The win-row bounce
// must not start before the last tile finishes flipping, and callers outside this
// component (the result modal) must not appear before the bounce finishes either.
const REVEAL_STEP_MS = 150;
const REVEAL_DURATION_MS = 250;
const BOUNCE_STEP_MS = 80;
const BOUNCE_DURATION_MS = 270;

export const TOTAL_REVEAL_MS = (COLS - 1) * REVEAL_STEP_MS + REVEAL_DURATION_MS;
export const TOTAL_WIN_ANIMATION_MS = TOTAL_REVEAL_MS + (COLS - 1) * BOUNCE_STEP_MS + BOUNCE_DURATION_MS;

type GuessRow = {
  letters: string[];
  states: (LetterState | 'empty')[];
};

type GridProps = {
  guesses: GuessRow[];
  currentGuess?: string;
  shakeTrigger?: number;
  won?: boolean;
};

export function Grid({ guesses, currentGuess = '', shakeTrigger = 0, won = false }: GridProps) {
  const shakeX = useSharedValue(0);

  useEffect(() => {
    if (shakeTrigger === 0) return;
    shakeX.value = withSequence(
      withTiming(-8, { duration: 50 }),
      withTiming(8, { duration: 50 }),
      withTiming(-8, { duration: 50 }),
      withTiming(8, { duration: 50 }),
      withTiming(0, { duration: 50 }),
    );
  }, [shakeTrigger, shakeX]);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const emptyRow: GuessRow = {
    letters: Array(COLS).fill(''),
    states: Array(COLS).fill('empty'),
  };

  const currentGuessRow: GuessRow = {
    letters: Array.from({ length: COLS }, (_, i) => currentGuess[i] ?? ''),
    states: Array(COLS).fill('empty'),
  };

  const rows = Array.from({ length: ROWS }, (_, i) => {
    if (i < guesses.length) return guesses[i];
    if (i === guesses.length) return currentGuessRow;
    return emptyRow;
  });

  return (
    <View className={gridStyles.container}>
      {rows.map((row, rowIndex) => (
        <Animated.View
          key={rowIndex}
          className={gridStyles.row}
          style={rowIndex === guesses.length ? shakeStyle : undefined}
        >
          {row.letters.map((letter, colIndex) => (
            <Tile
              key={colIndex}
              letter={letter}
              state={row.states[colIndex]}
              revealDelay={colIndex * REVEAL_STEP_MS}
              bounceDelay={
                won && rowIndex === guesses.length - 1
                  ? TOTAL_REVEAL_MS + colIndex * BOUNCE_STEP_MS
                  : undefined
              }
            />
          ))}
        </Animated.View>
      ))}
    </View>
  );
}
