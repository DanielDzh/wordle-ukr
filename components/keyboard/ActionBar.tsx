import { View, Text, Pressable } from 'react-native';
import { actionBarStyles } from './ActionBar.styles';

type ActionBarProps = {
  onEnter: () => void;
};

export function ActionBar({ onEnter }: ActionBarProps) {
  return (
    <View className={actionBarStyles.container}>
      <Pressable className={actionBarStyles.hintButton} disabled>
        <Text className={actionBarStyles.hintText}>💡 Підказка</Text>
      </Pressable>
      <Pressable onPress={onEnter} className={actionBarStyles.enterButton}>
        <Text className={actionBarStyles.enterText}>✅ ENTER</Text>
      </Pressable>
    </View>
  );
}
