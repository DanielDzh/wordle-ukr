import { View } from 'react-native';
import { SplashTile } from './SplashTile';
import { animatedSplashStyles } from './AnimatedSplash.styles';

// Mirrors the app icon: tiles spelling "СЛОВО" ("word"), same brand colors.
const TILES: { letter: string; color: 'green' | 'yellow' | 'gray' }[] = [
  { letter: 'С', color: 'green' },
  { letter: 'Л', color: 'gray' },
  { letter: 'О', color: 'yellow' },
  { letter: 'В', color: 'gray' },
  { letter: 'О', color: 'green' },
];

const STAGGER_MS = 250;

export const AnimatedSplash = () => {
  return (
    <View className={animatedSplashStyles.container}>
      <View className={animatedSplashStyles.row}>
        {TILES.map((tile, index) => (
          <SplashTile key={index} letter={tile.letter} color={tile.color} delay={index * STAGGER_MS} />
        ))}
      </View>
    </View>
  );
};
