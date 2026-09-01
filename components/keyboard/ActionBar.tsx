import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { hapticLight, hapticMedium } from '../../lib/haptics';
import { actionBarStyles } from './ActionBar.styles';

type ActionBarProps = {
  onEnter: () => void;
  onHint: () => void;
  hintsRemaining: number;
  disabled?: boolean;
};

export const ActionBar = ({ onEnter, onHint, hintsRemaining, disabled = false }: ActionBarProps) => {
  const hintDisabled = disabled || hintsRemaining <= 0;

  const handleEnter = () => {
    hapticMedium();
    onEnter();
  };

  const handleHint = () => {
    hapticLight();
    onHint();
  };

  return (
    <View className={actionBarStyles.container}>
      <Pressable
        onPress={handleHint}
        disabled={hintDisabled}
        className={`${actionBarStyles.hintButtonBase} ${hintDisabled ? actionBarStyles.hintButtonDisabled : actionBarStyles.hintButton}`}
      >
        <Ionicons name="bulb-outline" size={18} color={hintDisabled ? '#9ca3af' : '#b45309'} />
        <Text className={hintDisabled ? actionBarStyles.hintTextDisabled : actionBarStyles.hintText}>
          Підказка ({hintsRemaining})
        </Text>
      </Pressable>
      <Pressable
        onPress={handleEnter}
        disabled={disabled}
        className={`${actionBarStyles.enterButton} ${disabled ? actionBarStyles.enterButtonDisabled : ''}`}
      >
        <Ionicons name="checkmark-circle" size={18} color="#ffffff" />
        <Text className={actionBarStyles.enterText}>ГОТОВО</Text>
      </Pressable>
    </View>
  );
};
