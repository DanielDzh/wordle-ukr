import { Pressable, Text } from 'react-native';
import { hapticLight } from '../../lib/haptics';
import type { LetterState } from '../../types/game';
import { keyStyles } from './Key.styles';

type KeyProps = {
  label: string;
  onPress: (label: string) => void;
  wide?: boolean;
  state?: LetterState;
  disabled?: boolean;
};

export const Key = ({ label, onPress, wide = false, state, disabled = false }: KeyProps) => {
  const colors = state ? keyStyles.states[state] : keyStyles.states.default;

  const handlePress = () => {
    hapticLight();
    onPress(label);
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      className={`${keyStyles.base} ${wide ? keyStyles.wide : keyStyles.narrow} ${colors.bg} ${disabled ? keyStyles.disabled : ''}`}
    >
      <Text className={`${keyStyles.text} ${colors.text}`}>{label}</Text>
    </Pressable>
  );
};
