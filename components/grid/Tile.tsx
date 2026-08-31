import { useEffect, useRef, useState } from 'react';
import { Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import type { LetterState } from '../../types/game';
import { tileStyles } from './Tile.styles';

type TileProps = {
  letter: string;
  state: LetterState | 'empty';
  revealDelay?: number;
  /** When set, the tile bounces once after this delay (ms) — used for the winning row. */
  bounceDelay?: number;
};

export function Tile({ letter, state, revealDelay = 0, bounceDelay }: TileProps) {
  const [displayState, setDisplayState] = useState(state);
  const rotation = useSharedValue(0);
  const translateY = useSharedValue(0);
  const prevState = useRef(state);

  useEffect(() => {
    const wasEmpty = prevState.current === 'empty';
    prevState.current = state;

    if (wasEmpty && state !== 'empty') {
      // Flip to edge-on (90deg), swap the color/content while invisible, then flip
      // back to 0deg — ending at 180deg (as an earlier version did) leaves the tile
      // visually upside down forever instead of completing the flip.
      rotation.value = withDelay(
        revealDelay,
        withSequence(withTiming(90, { duration: 125 }), withTiming(0, { duration: 125 })),
      );
      const timeout = setTimeout(() => setDisplayState(state), revealDelay + 125);
      return () => clearTimeout(timeout);
    }

    setDisplayState(state);
  }, [state, revealDelay, rotation]);

  useEffect(() => {
    if (bounceDelay === undefined) return;
    translateY.value = withDelay(
      bounceDelay,
      withSequence(withTiming(-14, { duration: 120 }), withTiming(0, { duration: 150 })),
    );
  }, [bounceDelay, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotateX: `${rotation.value}deg` }, { translateY: translateY.value }],
  }));

  const colors = tileStyles.states[displayState];

  return (
    <Animated.View style={animatedStyle} className={`${tileStyles.base} ${colors.bg}`}>
      <Text className={`${tileStyles.textBase} ${colors.text}`}>{letter}</Text>
    </Animated.View>
  );
}
