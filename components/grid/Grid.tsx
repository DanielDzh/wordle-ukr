import { View } from 'react-native';
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
};

export function Grid({ guesses }: GridProps) {
  const emptyRow: GuessRow = {
    letters: Array(COLS).fill(''),
    states: Array(COLS).fill('empty'),
  };
  const rows = Array.from({ length: ROWS }, (_, i) => guesses[i] ?? emptyRow);

  return (
    <View className={gridStyles.container}>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} className={gridStyles.row}>
          {row.letters.map((letter, colIndex) => (
            <Tile key={colIndex} letter={letter} state={row.states[colIndex]} />
          ))}
        </View>
      ))}
    </View>
  );
}
