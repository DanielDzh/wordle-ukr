import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { hapticMedium } from '../../lib/haptics';
import { actionBarStyles } from './ActionBar.styles';

type ActionBarProps = {
  onEnter: () => void;
};

export function ActionBar({ onEnter }: ActionBarProps) {
  const handleEnter = () => {
    hapticMedium();
    onEnter();
  };

  return (
    <View className={actionBarStyles.container}>
      <Pressable className={actionBarStyles.hintButton} disabled>
        <Ionicons name="bulb-outline" size={18} color="#9ca3af" />
        <Text className={actionBarStyles.hintText}>Підказка</Text>
      </Pressable>
      <Pressable onPress={handleEnter} className={actionBarStyles.enterButton}>
        <Ionicons name="checkmark-circle" size={18} color="#ffffff" />
        <Text className={actionBarStyles.enterText}>ENTER</Text>
      </Pressable>
    </View>
  );
}
