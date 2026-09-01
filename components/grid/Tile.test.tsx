import { render, screen } from '@testing-library/react-native';
import { Tile } from './Tile';

describe('Tile', () => {
  it('renders the given letter', async () => {
    await render(<Tile letter="А" state="correct" />);
    expect(screen.getByText('А')).toBeTruthy();
  });

  it('uses a dark (visible in light mode) text color for an in-progress "empty" tile, not white-on-transparent', async () => {
    await render(<Tile letter="А" state="empty" />);
    const text = screen.getByText('А');
    expect(text.props.className).toContain('text-black');
  });
});
