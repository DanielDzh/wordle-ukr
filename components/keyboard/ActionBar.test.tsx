import { render, screen, fireEvent } from '@testing-library/react-native';
import { ActionBar } from './ActionBar';

describe('ActionBar', () => {
  it('calls onEnter when the ENTER button is pressed', async () => {
    const onEnter = jest.fn();
    await render(<ActionBar onEnter={onEnter} />);
    fireEvent.press(screen.getByText('ENTER'));
    expect(onEnter).toHaveBeenCalledTimes(1);
  });

  it('renders a disabled hint placeholder button', async () => {
    const onEnter = jest.fn();
    await render(<ActionBar onEnter={onEnter} />);
    const hint = screen.getByText('Підказка');
    expect(hint).toBeTruthy();
    fireEvent.press(hint);
    expect(onEnter).not.toHaveBeenCalled();
  });
});
