import { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as SplashScreen from 'expo-splash-screen';
import { AnimatedSplash } from '../components/splash/AnimatedSplash';
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

// Keeps our animated splash on screen for at least this long — the onboarding
// check usually resolves in a few ms, which would make the animation an
// imperceptible flash without an artificial minimum.
const MIN_SPLASH_MS = 2000;

export const AppNavigator = () => {
  const { loading, seen } = useOnboardingGate();
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  useEffect(() => {
    // Swap the native splash for our animated one as soon as this mounts,
    // rather than waiting for the onboarding check — the animated splash
    // covers the screen either way, so there's nothing to flash to.
    SplashScreen.hideAsync().catch(() => {});
    const timeout = setTimeout(() => setMinTimeElapsed(true), MIN_SPLASH_MS);
    return () => clearTimeout(timeout);
  }, []);

  if (loading || !minTimeElapsed) {
    return <AnimatedSplash />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={seen ? 'Game' : 'Onboarding'}>
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Game" component={GameScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
