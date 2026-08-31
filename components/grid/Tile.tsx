import { View, Text } from 'react-native';
import type { LetterState } from '../../types/game';
import { tileStyles } from './Tile.styles';

type TileProps = {
  letter: string;
  state: LetterState | 'empty';
};

export function Tile({ letter, state }: TileProps) {
  return (
    <View className={`${tileStyles.base} ${tileStyles.states[state]}`}>
      <Text className={tileStyles.text}>{letter}</Text>
    </View>
  );
}
