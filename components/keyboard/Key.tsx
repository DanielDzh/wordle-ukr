import { Pressable, Text } from 'react-native';
import type { LetterState } from '../../types/game';
import { keyStyles } from './Key.styles';

type KeyProps = {
  label: string;
  onPress: () => void;
  wide?: boolean;
  state?: LetterState;
};

export function Key({ label, onPress, wide = false, state }: KeyProps) {
  const colors = state ? keyStyles.states[state] : keyStyles.states.default;

  return (
    <Pressable
      onPress={onPress}
      className={`${keyStyles.base} ${wide ? keyStyles.wide : keyStyles.narrow} ${colors.bg}`}
    >
      <Text className={`${keyStyles.text} ${colors.text}`}>{label}</Text>
    </Pressable>
  );
}
