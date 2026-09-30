# Wordle UA

Wordle in Ukrainian — a daily word-guessing game built with Expo and React Native.

Guess the 5-letter Ukrainian word of the day in 6 tries. Each guess reveals which letters are correct, present elsewhere in the word, or absent — the on-screen keyboard tracks your progress with the same coloring.

## Screenshots

<!-- Add images to docs/screenshots/ and uncomment this block.
<p align="center">
  <img src="docs/screenshots/game.png" alt="Game screen" width="240" />
  <img src="docs/screenshots/stats.png" alt="Statistics" width="240" />
  <img src="docs/screenshots/onboarding.png" alt="Onboarding" width="240" />
</p>
-->

_Screenshots coming soon._

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

## AI-assisted workflow

This project is built with Claude Code as a pair programmer, with the process kept
in the repo so it is reviewable:

- **[`CLAUDE.md`](CLAUDE.md)** — project conventions the agent must follow: stack
  decisions, the NativeWind styling rule (styles in sibling files, never inline
  `className`), git strategy (`feature/*` → PR into `develop`), testing gotchas for
  RNTL v14, and working rules (no commits or merges without explicit approval,
  explain decisions step by step).
- **[`AGENTS.md`](AGENTS.md)** — pins the agent to the exact Expo SDK docs version,
  so generated code matches the installed SDK instead of outdated training data.
- **[`docs/superpowers/`](docs/superpowers)** — a written design spec and a
  step-by-step implementation plan for every week of work, written before
  implementation starts.
- **TDD** — game logic, stats, storage and hooks are developed test-first with Jest
  and React Native Testing Library (90+ tests); features land in `develop` via pull requests.

## Acknowledgements

The accepted-guess word list (`data/valid-words.ts`) is derived from three sources:

- [hermitdave/FrequencyWords](https://github.com/hermitdave/FrequencyWords) (`uk_50k.txt`), licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).
- [slavkaa/ukraine_dictionary](https://github.com/slavkaa/ukraine_dictionary), licensed under the MIT License.
- [uk.wiktionary.org](https://uk.wiktionary.org), "Категорія:Слова з 5 букв", licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).
