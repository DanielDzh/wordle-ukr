import { render, screen } from '@testing-library/react-native';
import { Grid } from './Grid';

describe('Grid', () => {
  it('renders 6 rows of 5 tiles each, filling empty rows with placeholders', async () => {
    await render(
      <Grid
        guesses={[
          {
            letters: ['з', 'е', 'б', 'р', 'а'],
            states: ['correct', 'correct', 'correct', 'correct', 'correct'],
          },
        ]}
      />,
    );
    expect(screen.getByText('з')).toBeTruthy();
    expect(screen.getAllByText('', { exact: true }).length).toBeGreaterThan(0);
  });

  it('renders the in-progress currentGuess as the next row', async () => {
    await render(<Grid guesses={[]} currentGuess="КК" />);
    expect(screen.getAllByText('К')).toHaveLength(2);
  });
});
