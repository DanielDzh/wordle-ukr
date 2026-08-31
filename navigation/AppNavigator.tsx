import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Pressable, Text } from 'react-native';
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
              <Pressable onPress={() => navigation.navigate('Settings')}>
                <Text className="text-xl">⚙️</Text>
              </Pressable>
            ),
          })}
        />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Налаштування' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
