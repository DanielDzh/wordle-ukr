import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GameScreen } from '../screens/game/GameScreen';
import { OnboardingScreen } from '../screens/onboarding/OnboardingScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { useOnboardingGate } from '../hooks/useOnboardingGate';

export type RootStackParamList = {
  Onboarding: undefined;
  Game: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const { loading, seen } = useOnboardingGate();

  if (loading) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={seen ? 'Game' : 'Onboarding'}>
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Game"
          component={GameScreen}
          options={({ navigation }) => ({
            title: 'Wordle UA',
            headerRight: () => (
              <Pressable onPress={() => navigation.navigate('Settings')} hitSlop={8}>
                <Ionicons name="settings-outline" size={24} color="#374151" />
              </Pressable>
            ),
          })}
        />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Налаштування' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
