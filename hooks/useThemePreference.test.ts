import { act, renderHook, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadThemePreference, saveThemePreference } from '../lib/storage';
import { useThemePreference } from './useThemePreference';

// NativeWind's setColorScheme requires darkMode:'class' to have been compiled into
// global.css by Metro — that pipeline doesn't run under Jest. This hook's job is to
// bridge storage <-> NativeWind's API, not to re-verify NativeWind's own dark-mode
// rendering (that's covered by manual testing on the simulator), so the module is
// mocked here.
jest.mock('nativewind', () => ({
  useColorScheme: () => ({ setColorScheme: jest.fn(), colorScheme: 'light' }),
}));

describe('useThemePreference', () => {
  afterEach(async () => {
    await AsyncStorage.clear();
  });

  it('defaults to system when nothing was saved', async () => {
    const { result } = await renderHook(() => useThemePreference());
    await waitFor(() => expect(result.current.preference).toBe('system'));
  });

  it('loads a previously saved preference on mount', async () => {
    await saveThemePreference('light');
    const { result } = await renderHook(() => useThemePreference());
    await waitFor(() => expect(result.current.preference).toBe('light'));
  });

  it('persists a newly chosen preference', async () => {
    const { result } = await renderHook(() => useThemePreference());
    await waitFor(() => expect(result.current.preference).toBe('system'));

    await act(async () => {
      result.current.setPreference('dark');
    });

    expect(result.current.preference).toBe('dark');
    await waitFor(async () => expect(await loadThemePreference()).toBe('dark'));
  });
});
