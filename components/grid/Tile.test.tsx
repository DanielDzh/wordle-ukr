import { render, screen } from '@testing-library/react-native';
import { Tile } from './Tile';

describe('Tile', () => {
  it('renders the given letter', async () => {
    await render(<Tile letter="А" state="correct" />);
    expect(screen.getByText('А')).toBeTruthy();
  });
});
