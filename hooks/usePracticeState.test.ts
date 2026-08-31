import { act, renderHook, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadPracticeRecord } from '../lib/storage';
import { AUTO_ADVANCE_DELAY_MS, usePracticeState } from './usePracticeState';

jest.mock('../data/words', () => ({ WORDS: ['зебра'] }));

describe('usePracticeState', () => {
  afterEach(async () => {
    await AsyncStorage.clear();
    jest.useRealTimers();
  });

  it('starts a round against a word from the pool', async () => {
    const { result } = await renderHook(() => usePracticeState());
    expect(result.current.state.answer).toBe('зебра');
    expect(result.current.state.status).toBe('playing');
    expect(result.current.streak).toBe(0);
  });

  it('bumps the streak and auto-advances to a new round after a win', async () => {
    jest.useFakeTimers();
    const { result } = await renderHook(() => usePracticeState());

    await act(async () => {
      'ЗЕБРА'.split('').forEach((letter) => result.current.handleKeyPress(letter));
      result.current.handleKeyPress('ENTER');
    });

    expect(result.current.state.status).toBe('won');
    expect(result.current.streak).toBe(1);

    await act(async () => {
      jest.advanceTimersByTime(AUTO_ADVANCE_DELAY_MS);
    });

    expect(result.current.state.status).toBe('playing');
    expect(result.current.state.currentGuess).toBe('');
  });

  it('persists a new practice record once the streak beats it', async () => {
    jest.useFakeTimers();
    const { result } = await renderHook(() => usePracticeState());

    await act(async () => {
      'ЗЕБРА'.split('').forEach((letter) => result.current.handleKeyPress(letter));
      result.current.handleKeyPress('ENTER');
    });

    expect(result.current.record).toBe(1);
    await waitFor(async () => expect(await loadPracticeRecord()).toBe(1));
  });

  it('resets the streak and starts a fresh round on handleRetry', async () => {
    const { result } = await renderHook(() => usePracticeState());

    await act(async () => {
      'ХХХХХ'.split('').forEach((letter) => result.current.handleKeyPress(letter));
    });

    await act(async () => {
      result.current.handleRetry();
    });

    expect(result.current.streak).toBe(0);
    expect(result.current.state.status).toBe('playing');
    expect(result.current.state.currentGuess).toBe('');
  });
});
