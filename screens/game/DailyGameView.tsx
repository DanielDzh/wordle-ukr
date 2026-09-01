import { useEffect, useState } from 'react';
import { Pressable, Share, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ActionBar } from '../../components/keyboard/ActionBar';
import { Grid, TOTAL_REVEAL_MS, TOTAL_WIN_ANIMATION_MS } from '../../components/grid/Grid';
import { Header } from '../../components/header/Header';
import { Keyboard } from '../../components/keyboard/Keyboard';
import { ResultModal } from '../../components/modal/ResultModal';
import { getDayNumber } from '../../lib/daily-word';
import { buildShareText } from '../../lib/share-text';
import { useGameState } from '../../hooks/useGameState';
import type { RootStackParamList } from '../../navigation/AppNavigator';
import { gameScreenStyles } from './GameScreen.styles';

type DailyGameViewProps = {
  onStartPractice: () => void;
};

export const DailyGameView = ({ onStartPractice }: DailyGameViewProps) => {
  const { state, stats, letterStates, shakeTrigger, hintsRemaining, handleKeyPress, handleHint } = useGameState();
  const isGameOver = state.status !== 'playing';
  const won = state.status === 'won';
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // The modal is dismissible (onClose) so the player can look back at the board,
  // and it must wait for the tile-flip/bounce animation to finish before it
  // appears — otherwise it would cover the very animation it's celebrating.
  const [dismissed, setDismissed] = useState(false);
  const [resultReady, setResultReady] = useState(false);

  useEffect(() => {
    // The daily word (and this screen) only changes on a fresh app launch, so
    // status never transitions back to 'playing' within this component's
    // lifetime — no need to reset resultReady/dismissed once set.
    if (!isGameOver) return;
    const delay = won ? TOTAL_WIN_ANIMATION_MS : TOTAL_REVEAL_MS;
    const timeout = setTimeout(() => setResultReady(true), delay);
    return () => clearTimeout(timeout);
  }, [isGameOver, won]);

  const handleShare = () => {
    const dayNumber = getDayNumber(new Date());
    const message = buildShareText(state.guesses, dayNumber, won);
    Share.share({ message });
  };

  const handleOpenSettings = () => navigation.navigate('Settings');
  const handleShowResult = () => setDismissed(false);
  const handleEnter = () => handleKeyPress('ENTER');
  const handleCloseResult = () => setDismissed(true);

  return (
    <View className={gameScreenStyles.container} style={{ paddingBottom: insets.bottom + 8 }}>
      <Header
        title="Wordle UA"
        streak={stats.currentStreak}
        onSettingsPress={handleOpenSettings}
        onStatsPress={isGameOver ? handleShowResult : undefined}
      />
      <Grid guesses={state.guesses} currentGuess={state.currentGuess} shakeTrigger={shakeTrigger} won={won} />
      <View className={gameScreenStyles.controls}>
        <Keyboard onKeyPress={handleKeyPress} letterStates={letterStates} disabled={isGameOver} />
        <ActionBar
          onEnter={handleEnter}
          onHint={handleHint}
          hintsRemaining={hintsRemaining}
          disabled={isGameOver}
        />
        {isGameOver ? (
          <Pressable onPress={onStartPractice} className={gameScreenStyles.practiceButton}>
            <Text className={gameScreenStyles.practiceButtonText}>Наступне слово</Text>
          </Pressable>
        ) : null}
      </View>
      <ResultModal
        visible={resultReady && !dismissed}
        won={won}
        stats={stats}
        onShare={handleShare}
        onClose={handleCloseResult}
        onPractice={onStartPractice}
      />
    </View>
  );
};
