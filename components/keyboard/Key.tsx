import { Pressable, Text } from 'react-native';
import { keyStyles } from './Key.styles';

type KeyProps = {
  label: string;
  onPress: () => void;
  wide?: boolean;
};

export function Key({ label, onPress, wide = false }: KeyProps) {
  return (
    <Pressable
      onPress={onPress}
      className={`${keyStyles.base} ${wide ? keyStyles.wide : keyStyles.narrow}`}
    >
      <Text className={keyStyles.text}>{label}</Text>
    </Pressable>
  );
}
