import { useEffect } from 'react';
import { Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { splashTileStyles } from './SplashTile.styles';

type SplashTileProps = {
  letter: string;
  color: keyof typeof splashTileStyles.colors;
  delay: number;
};

export function SplashTile({ letter, color, delay }: SplashTileProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(delay, withTiming(1, { duration: 400 }));
  }, [delay, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: 0.5 + progress.value * 0.5 }],
  }));

  return (
    <Animated.View
      style={animatedStyle}
      className={`${splashTileStyles.tile} ${splashTileStyles.colors[color]}`}
    >
      <Text className={splashTileStyles.letter}>{letter}</Text>
    </Animated.View>
  );
}
