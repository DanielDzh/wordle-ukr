import './global.css';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './navigation/AppNavigator';
import { useThemePreference } from './hooks/useThemePreference';

// Keep the native splash screen up until AppNavigator knows whether onboarding
// has been seen — otherwise there's a blank-screen flash between the splash
// auto-hiding and that AsyncStorage check finishing.
SplashScreen.preventAutoHideAsync().catch(() => {});

const App = () => {
  // Applies the saved theme preference to NativeWind's global color scheme on
  // launch — without this, a saved dark/light choice only took effect once
  // the user opened Settings, since that screen was the only place calling
  // this hook.
  useThemePreference();

  return (
    <SafeAreaProvider>
      <AppNavigator />
    </SafeAreaProvider>
  );
};

export default App;
