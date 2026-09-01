import { render, screen, fireEvent } from '@testing-library/react-native';
import { Key } from './Key';

describe('Key', () => {
  it('renders label and calls onPress when tapped', async () => {
    const onPress = jest.fn();
    await render(<Key label="А" onPress={onPress} />);
    fireEvent.press(screen.getByText('А'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('applies the correct-state background class when a state is given', async () => {
    await render(<Key label="А" onPress={() => {}} state="correct" />);
    const key = screen.getByText('А').parent;
    expect(key?.props.className).toContain('bg-green-600');
  });
});
