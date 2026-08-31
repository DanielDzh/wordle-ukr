import { Pressable, Text, View } from 'react-native';
import { useColorScheme } from 'nativewind';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { headerStyles } from './Header.styles';

type HeaderProps = {
  title: string;
  streak?: number;
  onBackPress?: () => void;
  onSettingsPress?: () => void;
  onStatsPress?: () => void;
};

export function Header({ title, streak, onBackPress, onSettingsPress, onStatsPress }: HeaderProps) {
  const { colorScheme } = useColorScheme();
  const insets = useSafeAreaInsets();
  const iconColor = colorScheme === 'dark' ? '#e5e7eb' : '#374151';

  return (
    <View className={headerStyles.container} style={{ paddingTop: insets.top + 8 }}>
      <View className={headerStyles.side}>
        {onBackPress ? (
          <Pressable onPress={onBackPress} hitSlop={8} accessibilityLabel="Назад">
            <Ionicons name="chevron-back" size={24} color={iconColor} />
          </Pressable>
        ) : null}
      </View>
      <Text className={headerStyles.title}>{title}</Text>
      {streak ? <Text className={headerStyles.streak}>🔥 {streak}</Text> : null}
      <View className={`${headerStyles.side} ${headerStyles.iconGroup}`}>
        {onStatsPress ? (
          <Pressable onPress={onStatsPress} hitSlop={8} accessibilityLabel="Статистика">
            <Ionicons name="stats-chart-outline" size={22} color={iconColor} />
          </Pressable>
        ) : null}
        {onSettingsPress ? (
          <Pressable onPress={onSettingsPress} hitSlop={8} accessibilityLabel="Налаштування">
            <Ionicons name="settings-outline" size={24} color={iconColor} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
