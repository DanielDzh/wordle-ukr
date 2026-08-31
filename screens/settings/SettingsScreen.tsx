import { View, Text, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Header } from '../../components/header/Header';
import { useThemePreference } from '../../hooks/useThemePreference';
import { settingsStyles } from './SettingsScreen.styles';
import type { ThemePreference } from '../../types/theme';

const OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: 'light', label: 'Світла' },
  { value: 'dark', label: 'Темна' },
  { value: 'system', label: 'Системна' },
];

export function SettingsScreen() {
  const { preference, setPreference } = useThemePreference();
  const navigation = useNavigation();

  return (
    <View className={settingsStyles.container}>
      <Header title="Налаштування" onBackPress={() => navigation.goBack()} />
      <View className={settingsStyles.content}>
        {OPTIONS.map((option) => {
          const active = option.value === preference;
          return (
            <Pressable
              key={option.value}
              onPress={() => setPreference(option.value)}
              className={`${settingsStyles.row} ${active ? settingsStyles.rowActive : ''}`}
            >
              <Text className={settingsStyles.rowText}>{option.label}</Text>
              {active ? <Text className={settingsStyles.checkmark}>✓</Text> : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
