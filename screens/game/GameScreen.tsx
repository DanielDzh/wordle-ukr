import { Share, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ActionBar } from '../../components/keyboard/ActionBar';
import { Grid } from '../../components/grid/Grid';
import { Keyboard } from '../../components/keyboard/Keyboard';
import { ResultModal } from '../../components/modal/ResultModal';
import { getDayNumber } from '../../lib/daily-word';
import { buildShareText } from '../../lib/share-text';
import { useGameState } from '../../hooks/useGameState';
import { gameScreenStyles } from './GameScreen.styles';

export function GameScreen() {
  const { state, stats, letterStates, handleKeyPress } = useGameState();
  const isGameOver = state.status !== 'playing';
  const insets = useSafeAreaInsets();

  const handleShare = () => {
    const dayNumber = getDayNumber(new Date());
    const message = buildShareText(state.guesses, dayNumber, state.status === 'won');
    Share.share({ message });
  };

  return (
    <View className={gameScreenStyles.container} style={{ paddingBottom: insets.bottom + 8 }}>
      <Grid guesses={state.guesses} currentGuess={state.currentGuess} />
      <View className={gameScreenStyles.controls}>
        <Keyboard onKeyPress={handleKeyPress} letterStates={letterStates} />
        <ActionBar onEnter={() => handleKeyPress('ENTER')} />
      </View>
      <ResultModal
        visible={isGameOver}
        won={state.status === 'won'}
        stats={stats}
        onShare={handleShare}
        onClose={() => {}}
      />
    </View>
  );
}
