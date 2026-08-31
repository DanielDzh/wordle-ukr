import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadThemePreference } from '../../lib/storage';
import { SettingsScreen } from './SettingsScreen';

// See the note in hooks/useThemePreference.test.ts — NativeWind's setColorScheme
// requires darkMode:'class' compiled into global.css, which Jest never processes.
jest.mock('nativewind', () => ({
  useColorScheme: () => ({ setColorScheme: jest.fn(), colorScheme: 'light' }),
}));

describe('SettingsScreen', () => {
  afterEach(async () => {
    await AsyncStorage.clear();
  });

  it('renders all three theme options', async () => {
    await render(<SettingsScreen />);
    expect(screen.getByText('Світла')).toBeTruthy();
    expect(screen.getByText('Темна')).toBeTruthy();
    expect(screen.getByText('Системна')).toBeTruthy();
  });

  it('persists the chosen option when pressed', async () => {
    await render(<SettingsScreen />);
    fireEvent.press(screen.getByText('Темна'));
    await waitFor(async () => expect(await loadThemePreference()).toBe('dark'));
  });
});
