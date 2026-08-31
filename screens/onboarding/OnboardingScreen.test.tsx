import { render, screen, fireEvent, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { loadOnboardingSeen } from '../../lib/storage';
import { OnboardingScreen } from './OnboardingScreen';

// `initialWindowMetrics` from the library is null under Jest (no native measurement),
// which leaves SafeAreaProvider waiting forever for an onInsetsChange event that never
// fires in tests. Pass explicit metrics instead so children render immediately.
const testSafeAreaMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

function renderOnboarding(navigation: { replace: jest.Mock }) {
  return render(<OnboardingScreen navigation={navigation as any} route={{} as any} />, {
    wrapper: ({ children }) => (
      <SafeAreaProvider initialMetrics={testSafeAreaMetrics}>{children}</SafeAreaProvider>
    ),
  });
}

describe('OnboardingScreen', () => {
  afterEach(async () => {
    await AsyncStorage.clear();
  });

  it('shows the first step title', async () => {
    const navigation = { replace: jest.fn() };
    await renderOnboarding(navigation);
    expect(screen.getByText('Як грати')).toBeTruthy();
  });

  it('advances through all three steps via "Далі"', async () => {
    const navigation = { replace: jest.fn() };
    await renderOnboarding(navigation);

    await act(async () => {
      fireEvent.press(screen.getByText('Далі'));
    });
    expect(screen.getByText('Що означають кольори')).toBeTruthy();

    await act(async () => {
      fireEvent.press(screen.getByText('Далі'));
    });
    expect(screen.getByText('Слово дня')).toBeTruthy();
    expect(screen.getByText('Почати гру')).toBeTruthy();
  });

  it('marks onboarding seen and navigates to Game when finishing', async () => {
    const navigation = { replace: jest.fn() };
    await renderOnboarding(navigation);

    await act(async () => {
      fireEvent.press(screen.getByText('Пропустити'));
    });

    expect(navigation.replace).toHaveBeenCalledWith('Game');
    expect(await loadOnboardingSeen()).toBe(true);
  });
});
