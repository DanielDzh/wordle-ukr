import { act, renderHook, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EPOCH_DATE } from '../lib/daily-word';
import { useGameState } from './useGameState';

describe('useGameState', () => {
  const RealDate = Date;

  afterEach(async () => {
    await AsyncStorage.clear();
  });

  beforeEach(() => {
    // Freeze "today" to the epoch date so the daily word is deterministic (WORDS[0]).
    globalThis.Date = class extends RealDate {
      constructor(...args: unknown[]) {
        if (args.length === 0) {
          super(EPOCH_DATE.getTime());
          return;
        }
        // @ts-expect-error -- forwarding a variable-length constructor call
        super(...args);
      }
    } as DateConstructor;
  });

  afterEach(() => {
    globalThis.Date = RealDate;
  });

  it('starts a game against the daily word', async () => {
    const { result } = await renderHook(() => useGameState());
    await waitFor(() => expect(result.current.state.answer).toBe('зебра'));
    expect(result.current.state.status).toBe('playing');
    expect(result.current.stats.gamesPlayed).toBe(0);
  });

  it('records a win in stats once the game is won', async () => {
    const { result } = await renderHook(() => useGameState());
    await waitFor(() => expect(result.current.state.status).toBe('playing'));

    await act(async () => {
      'ЗЕБРА'.split('').forEach((letter) => result.current.handleKeyPress(letter));
      result.current.handleKeyPress('ENTER');
    });

    await waitFor(() => expect(result.current.state.status).toBe('won'));
    await waitFor(() => expect(result.current.stats.gamesWon).toBe(1));
  });

  it('bumps shakeTrigger when ENTER is pressed with a word not in the dictionary', async () => {
    const { result } = await renderHook(() => useGameState());
    await waitFor(() => expect(result.current.state.status).toBe('playing'));
    const before = result.current.shakeTrigger;

    await act(async () => {
      'ХХХХХ'.split('').forEach((letter) => result.current.handleKeyPress(letter));
      result.current.handleKeyPress('ENTER');
    });

    expect(result.current.shakeTrigger).toBe(before + 1);
    expect(result.current.state.currentGuess).toBe('ХХХХХ');
  });

  it('does not bump shakeTrigger for a valid guess', async () => {
    const { result } = await renderHook(() => useGameState());
    await waitFor(() => expect(result.current.state.status).toBe('playing'));
    const before = result.current.shakeTrigger;

    await act(async () => {
      'ЗЕБРА'.split('').forEach((letter) => result.current.handleKeyPress(letter));
      result.current.handleKeyPress('ENTER');
    });

    expect(result.current.shakeTrigger).toBe(before);
  });

  it('reveals a letter and decrements hintsRemaining when handleHint is called', async () => {
    const { result } = await renderHook(() => useGameState());
    await waitFor(() => expect(result.current.state.status).toBe('playing'));
    const before = result.current.hintsRemaining;

    await act(async () => {
      result.current.handleHint();
    });

    expect(result.current.hintsRemaining).toBe(before - 1);
    expect(result.current.state.currentGuess).toBe('З');
  });
});
