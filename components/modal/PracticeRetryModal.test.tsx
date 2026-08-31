import { render, screen, fireEvent } from '@testing-library/react-native';
import { PracticeRetryModal } from './PracticeRetryModal';

describe('PracticeRetryModal', () => {
  it('shows the streak and record, and calls onRetry when pressed', async () => {
    const onRetry = jest.fn();
    await render(<PracticeRetryModal visible streak={3} record={7} onRetry={onRetry} />);
    expect(screen.getByText('3')).toBeTruthy();
    expect(screen.getByText('7')).toBeTruthy();
    fireEvent.press(screen.getByText('Спробувати знову'));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
