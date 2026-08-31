# Wordle UA

Wordle in Ukrainian — a daily word-guessing game built with Expo and React Native.

Guess the 5-letter Ukrainian word of the day in 6 tries. Each guess reveals which letters are correct, present elsewhere in the word, or absent — the on-screen keyboard tracks your progress with the same coloring.

## Stack

- [Expo](https://expo.dev) + TypeScript
- [React Navigation](https://reactnavigation.org) (NativeStack)
- [NativeWind](https://www.nativewind.dev) (Tailwind for React Native)
- [Reanimated](https://docs.swmansion.com/react-native-reanimated) for the tile-flip animation
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage) for local stats
- Jest + React Native Testing Library, TDD from the start

## Getting started

```bash
yarn install
```

Run on a simulator/emulator:

```bash
yarn ios       # iOS simulator
yarn android   # Android emulator
```

Or start the dev server and open in Expo Go:

```bash
yarn start
```

## Development

```bash
yarn test   # run the test suite
yarn lint   # run ESLint
```

See `CLAUDE.md` for project conventions (stack decisions, styling rules, git strategy) and `docs/superpowers/` for design specs and implementation plans.

## Acknowledgements

The accepted-guess word list (`data/valid-words.ts`) is derived from [hermitdave/FrequencyWords](https://github.com/hermitdave/FrequencyWords) (`uk_50k.txt`), licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).
