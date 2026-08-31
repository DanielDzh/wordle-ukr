import { render, screen, fireEvent } from '@testing-library/react-native';
import { Key } from './Key';

describe('Key', () => {
  it('renders label and calls onPress when tapped', async () => {
    const onPress = jest.fn();
    await render(<Key label="А" onPress={onPress} />);
    fireEvent.press(screen.getByText('А'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
