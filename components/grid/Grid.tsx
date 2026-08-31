import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import type { LetterState } from '../../types/game';
import { Tile } from './Tile';
import { gridStyles } from './Grid.styles';

const ROWS = 6;
const COLS = 5;

type GuessRow = {
  letters: string[];
  states: (LetterState | 'empty')[];
};

type GridProps = {
  guesses: GuessRow[];
  currentGuess?: string;
  shakeTrigger?: number;
};

export function Grid({ guesses, currentGuess = '', shakeTrigger = 0 }: GridProps) {
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
              revealDelay={colIndex * 150}
            />
          ))}
        </Animated.View>
      ))}
    </View>
  );
}
