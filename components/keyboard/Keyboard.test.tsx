import { render, screen, fireEvent } from '@testing-library/react-native';
import { Keyboard } from './Keyboard';

describe('Keyboard', () => {
  it('renders all ukrainian letter keys and calls onKeyPress with the pressed letter', async () => {
    const onKeyPress = jest.fn();
    await render(<Keyboard onKeyPress={onKeyPress} />);
    fireEvent.press(screen.getByText('А'));
    expect(onKeyPress).toHaveBeenCalledWith('А');
  });

  it('renders ENTER and DELETE keys', async () => {
    const onKeyPress = jest.fn();
    await render(<Keyboard onKeyPress={onKeyPress} />);
    fireEvent.press(screen.getByText('ENTER'));
    expect(onKeyPress).toHaveBeenCalledWith('ENTER');
  });

  it('colors a key according to the given letterStates', async () => {
    const onKeyPress = jest.fn();
    await render(<Keyboard onKeyPress={onKeyPress} letterStates={{ А: 'correct' }} />);
    const key = screen.getByText('А').parent;
    expect(key?.props.className).toContain('bg-green-600');
  });
});
