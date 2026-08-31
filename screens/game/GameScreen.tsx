import { Share, View } from 'react-native';
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

  const handleShare = () => {
    const dayNumber = getDayNumber(new Date());
    const message = buildShareText(state.guesses, dayNumber, state.status === 'won');
    Share.share({ message });
  };

  return (
    <View className={gameScreenStyles.container}>
      <Grid guesses={state.guesses} />
      <Keyboard onKeyPress={handleKeyPress} letterStates={letterStates} />
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
