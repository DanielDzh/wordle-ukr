import { View } from 'react-native';
import { Grid } from '../../components/grid/Grid';
import { Keyboard } from '../../components/keyboard/Keyboard';
import { gameScreenStyles } from './GameScreen.styles';

export function GameScreen() {
  const handleKeyPress = (key: string) => {
    // Обробка вводу — Тиждень 2. Поки no-op.
    console.log('key pressed:', key);
  };

  return (
    <View className={gameScreenStyles.container}>
      <Grid guesses={[]} />
      <Keyboard onKeyPress={handleKeyPress} />
    </View>
  );
}
