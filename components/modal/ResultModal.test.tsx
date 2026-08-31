import { render, screen, fireEvent } from '@testing-library/react-native';
import { ResultModal } from './ResultModal';

const stats = {
  gamesPlayed: 4,
  gamesWon: 3,
  currentStreak: 2,
  maxStreak: 2,
  guessDistribution: [0, 1, 2, 0, 0, 0] as [number, number, number, number, number, number],
};

describe('ResultModal', () => {
  it('shows a win headline and calls onShare when the share button is pressed', async () => {
    const onShare = jest.fn();
    await render(<ResultModal visible won stats={stats} onShare={onShare} onClose={() => {}} />);
    expect(screen.getByText('Перемога!')).toBeTruthy();
    fireEvent.press(screen.getByText('Поділитись'));
    expect(onShare).toHaveBeenCalledTimes(1);
  });

  it('shows a lose headline when won is false', async () => {
    await render(
      <ResultModal visible won={false} stats={stats} onShare={() => {}} onClose={() => {}} />,
    );
    expect(screen.getByText('Гра закінчена')).toBeTruthy();
  });
});
