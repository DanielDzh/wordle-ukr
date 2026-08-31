import { render, screen, fireEvent } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Header } from './Header';

jest.mock('nativewind', () => ({
  useColorScheme: () => ({ colorScheme: 'light' }),
}));

const testSafeAreaMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

function renderHeader(ui: React.ReactElement) {
  return render(ui, {
    wrapper: ({ children }) => (
      <SafeAreaProvider initialMetrics={testSafeAreaMetrics}>{children}</SafeAreaProvider>
    ),
  });
}

describe('Header', () => {
  it('renders the title', async () => {
    await renderHeader(<Header title="Wordle UA" />);
    expect(screen.getByText('Wordle UA')).toBeTruthy();
  });

  it('renders the streak when provided and greater than zero', async () => {
    await renderHeader(<Header title="Wordle UA" streak={5} />);
    expect(screen.getByText('🔥 5')).toBeTruthy();
  });

  it('does not render the streak when it is zero', async () => {
    await renderHeader(<Header title="Wordle UA" streak={0} />);
    expect(screen.queryByText(/🔥/)).toBeNull();
  });

  it('calls onSettingsPress when the settings button is pressed', async () => {
    const onSettingsPress = jest.fn();
    await renderHeader(<Header title="Wordle UA" onSettingsPress={onSettingsPress} />);
    fireEvent.press(screen.getByLabelText('Налаштування'));
    expect(onSettingsPress).toHaveBeenCalledTimes(1);
  });

  it('calls onBackPress when the back button is pressed', async () => {
    const onBackPress = jest.fn();
    await renderHeader(<Header title="Налаштування" onBackPress={onBackPress} />);
    fireEvent.press(screen.getByLabelText('Назад'));
    expect(onBackPress).toHaveBeenCalledTimes(1);
  });

  it('calls onStatsPress when the stats button is pressed', async () => {
    const onStatsPress = jest.fn();
    await renderHeader(<Header title="Wordle UA" onStatsPress={onStatsPress} />);
    fireEvent.press(screen.getByLabelText('Статистика'));
    expect(onStatsPress).toHaveBeenCalledTimes(1);
  });
});
