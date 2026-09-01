import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadThemePreference } from '../../lib/storage';
import { SettingsScreen } from './SettingsScreen';

// See the note in hooks/useThemePreference.test.ts — NativeWind's setColorScheme
// requires darkMode:'class' compiled into global.css, which Jest never processes.
jest.mock('nativewind', () => ({
  useColorScheme: () => ({ setColorScheme: jest.fn(), colorScheme: 'light' }),
}));

// See the note in OnboardingScreen.test.tsx — initialWindowMetrics is null under
// Jest, so SafeAreaProvider needs explicit metrics to render children immediately.
const testSafeAreaMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

function renderSettings() {
  return render(<SettingsScreen />, {
    wrapper: ({ children }) => (
      <SafeAreaProvider initialMetrics={testSafeAreaMetrics}>
        <NavigationContainer>{children}</NavigationContainer>
      </SafeAreaProvider>
    ),
  });
}

describe('SettingsScreen', () => {
  afterEach(async () => {
    await AsyncStorage.clear();
  });

  it('renders all three theme options', async () => {
    await renderSettings();
    expect(screen.getByText('Світла')).toBeTruthy();
    expect(screen.getByText('Темна')).toBeTruthy();
    expect(screen.getByText('Системна')).toBeTruthy();
  });

  it('persists the chosen option when pressed', async () => {
    await renderSettings();
    fireEvent.press(screen.getByText('Темна'));
    await waitFor(async () => expect(await loadThemePreference()).toBe('dark'));
  });
});
