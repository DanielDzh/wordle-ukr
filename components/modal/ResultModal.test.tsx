import { render, screen, fireEvent } from '@testing-library/react-native';
import { ResultModal } from './ResultModal';

const stats = {
  gamesPlayed: 4,
  gamesWon: 3,
  currentStreak: 2,
  maxStreak: 2,
  guessDistribution: [0, 1, 2, 0, 0, 0] as [number, number, number, number, number, number],
};

function renderModal(overrides: Partial<React.ComponentProps<typeof ResultModal>> = {}) {
  return render(
    <ResultModal
      visible
      won
      stats={stats}
      onShare={() => {}}
      onClose={() => {}}
      onPractice={() => {}}
      {...overrides}
    />,
  );
}

describe('ResultModal', () => {
  it('shows a win headline and calls onShare when the share button is pressed', async () => {
    const onShare = jest.fn();
    await renderModal({ onShare });
    expect(screen.getByText('Перемога!')).toBeTruthy();
    fireEvent.press(screen.getByText('Поділитись'));
    expect(onShare).toHaveBeenCalledTimes(1);
  });

  it('shows a lose headline when won is false', async () => {
    await renderModal({ won: false });
    expect(screen.getByText('Гра закінчена')).toBeTruthy();
  });

  it('calls onClose when the close button is pressed', async () => {
    const onClose = jest.fn();
    await renderModal({ onClose });
    fireEvent.press(screen.getByLabelText('Закрити'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onPractice when the "Наступне слово" button is pressed', async () => {
    const onPractice = jest.fn();
    await renderModal({ onPractice });
    fireEvent.press(screen.getByText('Наступне слово'));
    expect(onPractice).toHaveBeenCalledTimes(1);
  });
});
