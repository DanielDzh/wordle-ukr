import { render, screen, fireEvent } from '@testing-library/react-native';
import { ActionBar } from './ActionBar';

describe('ActionBar', () => {
  it('calls onEnter when the ГОТОВО button is pressed', async () => {
    const onEnter = jest.fn();
    const onHint = jest.fn();
    await render(<ActionBar onEnter={onEnter} onHint={onHint} hintsRemaining={2} />);
    fireEvent.press(screen.getByText('ГОТОВО'));
    expect(onEnter).toHaveBeenCalledTimes(1);
  });

  it('shows the remaining hint count and calls onHint when pressed', async () => {
    const onEnter = jest.fn();
    const onHint = jest.fn();
    await render(<ActionBar onEnter={onEnter} onHint={onHint} hintsRemaining={2} />);
    fireEvent.press(screen.getByText('Підказка (2)'));
    expect(onHint).toHaveBeenCalledTimes(1);
  });

  it('disables the hint button once no hints remain', async () => {
    const onEnter = jest.fn();
    const onHint = jest.fn();
    await render(<ActionBar onEnter={onEnter} onHint={onHint} hintsRemaining={0} />);
    fireEvent.press(screen.getByText('Підказка (0)'));
    expect(onHint).not.toHaveBeenCalled();
  });
});
