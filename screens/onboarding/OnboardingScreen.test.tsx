import { render, screen, fireEvent, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadOnboardingSeen } from '../../lib/storage';
import { OnboardingScreen } from './OnboardingScreen';

describe('OnboardingScreen', () => {
  afterEach(async () => {
    await AsyncStorage.clear();
  });

  it('shows the first step title', async () => {
    const navigation = { replace: jest.fn() } as any;
    await render(<OnboardingScreen navigation={navigation} route={{} as any} />);
    expect(screen.getByText('Як грати')).toBeTruthy();
  });

  it('advances through all three steps via "Далі"', async () => {
    const navigation = { replace: jest.fn() } as any;
    await render(<OnboardingScreen navigation={navigation} route={{} as any} />);

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
    const navigation = { replace: jest.fn() } as any;
    await render(<OnboardingScreen navigation={navigation} route={{} as any} />);

    await act(async () => {
      fireEvent.press(screen.getByText('Пропустити'));
    });

    expect(navigation.replace).toHaveBeenCalledWith('Game');
    expect(await loadOnboardingSeen()).toBe(true);
  });
});
