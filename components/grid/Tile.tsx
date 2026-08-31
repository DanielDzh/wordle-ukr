import { useEffect, useRef, useState } from 'react';
import { Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import type { LetterState } from '../../types/game';
import { tileStyles } from './Tile.styles';

type TileProps = {
  letter: string;
  state: LetterState | 'empty';
  revealDelay?: number;
};

export function Tile({ letter, state, revealDelay = 0 }: TileProps) {
  const [displayState, setDisplayState] = useState(state);
  const rotation = useSharedValue(0);
  const prevState = useRef(state);

  useEffect(() => {
    const wasEmpty = prevState.current === 'empty';
    prevState.current = state;

    if (wasEmpty && state !== 'empty') {
      rotation.value = withDelay(revealDelay, withTiming(180, { duration: 250 }));
      const timeout = setTimeout(() => setDisplayState(state), revealDelay + 125);
      return () => clearTimeout(timeout);
    }

    setDisplayState(state);
  }, [state, revealDelay, rotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotateX: `${rotation.value}deg` }],
  }));

  const colors = tileStyles.states[displayState];

  return (
    <Animated.View style={animatedStyle} className={`${tileStyles.base} ${colors.bg}`}>
      <Text className={`${tileStyles.textBase} ${colors.text}`}>{letter}</Text>
    </Animated.View>
  );
}
