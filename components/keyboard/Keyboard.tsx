import { View } from 'react-native';
import { Key } from './Key';
import { keyboardStyles } from './Keyboard.styles';
import type { LetterState } from '../../types/game';

const ROWS = [
  ['Й', 'Ц', 'У', 'К', 'Е', 'Н', 'Г', 'Ш', 'Щ', 'З', 'Х'],
  ['Ф', 'І', 'В', 'А', 'П', 'Р', 'О', 'Л', 'Д', 'Ж', 'Є'],
  ['Я', 'Ч', 'С', 'М', 'И', 'Т', 'Ь', 'Б', 'Ю', 'DELETE'],
];

type KeyboardProps = {
  onKeyPress: (key: string) => void;
  letterStates?: Record<string, LetterState>;
  disabled?: boolean;
};

export function Keyboard({ onKeyPress, letterStates = {}, disabled = false }: KeyboardProps) {
  return (
    <View className={keyboardStyles.container}>
      {ROWS.map((row, rowIndex) => (
        <View key={rowIndex} className={keyboardStyles.row}>
          {row.map((label) => (
            <Key
              key={label}
              label={label}
              onPress={() => onKeyPress(label)}
              wide={label === 'DELETE'}
              state={letterStates[label]}
              disabled={disabled}
            />
          ))}
        </View>
      ))}
    </View>
  );
}
