import { createInitialGameState, gameReducer, isValidWord } from './game-reducer';

describe('isValidWord', () => {
  it('returns true for a word in the dictionary, case-insensitively', () => {
    expect(isValidWord('ЗЕБРА')).toBe(true);
    expect(isValidWord('зебра')).toBe(true);
  });

  it('returns false for a nonsense letter combination', () => {
    expect(isValidWord('ХХХХХ')).toBe(false);
  });
});

describe('gameReducer', () => {
  it('appends a typed letter to currentGuess', () => {
    const state = createInitialGameState('зебра');
    const next = gameReducer(state, { type: 'KEY_PRESS', key: 'З' });
    expect(next.currentGuess).toBe('З');
  });

  it('removes the last letter on DELETE', () => {
    let state = createInitialGameState('зебра');
    state = gameReducer(state, { type: 'KEY_PRESS', key: 'З' });
    state = gameReducer(state, { type: 'KEY_PRESS', key: 'Е' });
    state = gameReducer(state, { type: 'KEY_PRESS', key: 'DELETE' });
    expect(state.currentGuess).toBe('З');
  });

  it('ignores letters once currentGuess already has 5 characters', () => {
    let state = createInitialGameState('зебра');
    'ЗЕБРА'.split('').forEach((letter) => {
      state = gameReducer(state, { type: 'KEY_PRESS', key: letter });
    });
    state = gameReducer(state, { type: 'KEY_PRESS', key: 'Х' });
    expect(state.currentGuess).toBe('ЗЕБРА');
  });

  it('does nothing on ENTER when currentGuess is shorter than 5 letters', () => {
    let state = createInitialGameState('зебра');
    state = gameReducer(state, { type: 'KEY_PRESS', key: 'З' });
    state = gameReducer(state, { type: 'KEY_PRESS', key: 'ENTER' });
    expect(state.currentGuess).toBe('З');
    expect(state.guesses).toHaveLength(0);
  });

  it('does nothing on ENTER when the guess is not a real word', () => {
    let state = createInitialGameState('зебра');
    'ХХХХХ'.split('').forEach((letter) => {
      state = gameReducer(state, { type: 'KEY_PRESS', key: letter });
    });
    state = gameReducer(state, { type: 'KEY_PRESS', key: 'ENTER' });
    expect(state.currentGuess).toBe('ХХХХХ');
    expect(state.guesses).toHaveLength(0);
  });

  it('increments shakeTrigger by 1 each time, even from state hydrated before shakeTrigger existed', () => {
    // Simulates a daily-game state persisted by an older app version, before the
    // shakeTrigger field was added — AsyncStorage will happily return this shape.
    const legacyState = {
      ...createInitialGameState('зебра'),
      shakeTrigger: undefined as unknown as number,
    };
    let state = legacyState;
    'ХХХХХ'.split('').forEach((letter) => {
      state = gameReducer(state, { type: 'KEY_PRESS', key: letter });
    });
    state = gameReducer(state, { type: 'KEY_PRESS', key: 'ENTER' });
    expect(state.shakeTrigger).toBe(1);

    state = gameReducer(state, { type: 'KEY_PRESS', key: 'ENTER' });
    expect(state.shakeTrigger).toBe(2);
  });

  it('marks the game won when a 5-letter guess matches the answer', () => {
    let state = createInitialGameState('зебра');
    'ЗЕБРА'.split('').forEach((letter) => {
      state = gameReducer(state, { type: 'KEY_PRESS', key: letter });
    });
    state = gameReducer(state, { type: 'KEY_PRESS', key: 'ENTER' });
    expect(state.status).toBe('won');
    expect(state.currentGuess).toBe('');
    expect(state.guesses).toEqual([
      { letters: ['З', 'Е', 'Б', 'Р', 'А'], states: ['correct', 'correct', 'correct', 'correct', 'correct'] },
    ]);
  });

  it('marks the game lost after 6 wrong guesses', () => {
    let state = createInitialGameState('зебра');
    for (let i = 0; i < 6; i++) {
      'ЛИМОН'.split('').forEach((letter) => {
        state = gameReducer(state, { type: 'KEY_PRESS', key: letter });
      });
      state = gameReducer(state, { type: 'KEY_PRESS', key: 'ENTER' });
    }
    expect(state.status).toBe('lost');
    expect(state.guesses).toHaveLength(6);
  });

  it('ignores further key presses once the game is won', () => {
    let state = createInitialGameState('зебра');
    'ЗЕБРА'.split('').forEach((letter) => {
      state = gameReducer(state, { type: 'KEY_PRESS', key: letter });
    });
    state = gameReducer(state, { type: 'KEY_PRESS', key: 'ENTER' });
    const afterWin = state;
    state = gameReducer(state, { type: 'KEY_PRESS', key: 'А' });
    expect(state).toBe(afterWin);
  });
});
