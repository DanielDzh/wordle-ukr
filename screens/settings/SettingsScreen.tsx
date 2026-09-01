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

export const SettingsScreen = () => {
  const { preference, setPreference } = useThemePreference();
  const navigation = useNavigation();

  const handleBack = () => navigation.goBack();
  const handleSelect = (value: ThemePreference) => () => setPreference(value);

  return (
    <View className={settingsStyles.container}>
      <Header title="Налаштування" onBackPress={handleBack} />
      <View className={settingsStyles.content}>
        {OPTIONS.map((option) => {
          const active = option.value === preference;
          return (
            <Pressable
              key={option.value}
              onPress={handleSelect(option.value)}
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
};
