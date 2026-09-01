import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ActionBar } from '../../components/keyboard/ActionBar';
import { Grid, TOTAL_REVEAL_MS } from '../../components/grid/Grid';
import { Header } from '../../components/header/Header';
import { Keyboard } from '../../components/keyboard/Keyboard';
import { PracticeRetryModal } from '../../components/modal/PracticeRetryModal';
import { usePracticeState } from '../../hooks/usePracticeState';
import { practiceScreenStyles } from './PracticeGameView.styles';

type PracticeGameViewProps = {
  onExitPractice: () => void;
};

export const PracticeGameView = ({ onExitPractice }: PracticeGameViewProps) => {
  const { state, streak, record, letterStates, shakeTrigger, hintsRemaining, handleKeyPress, handleHint, handleRetry } =
    usePracticeState();
  const isLost = state.status === 'lost';
  const won = state.status === 'won';
  const insets = useSafeAreaInsets();

  // Same reasoning as DailyGameView: don't cover the tile-flip reveal of the
  // final wrong guess with the retry modal — let it finish first. Practice has
  // many losses per session (not just one), so each loss is identified by its
  // word (retry always picks a different one) — revealedForWord only ever
  // catches up to it asynchronously, inside the timeout, never synchronously
  // in the effect body.
  const [revealedForWord, setRevealedForWord] = useState<string | null>(null);

  useEffect(() => {
    if (!isLost) return;
    const timeout = setTimeout(() => setRevealedForWord(state.answer), TOTAL_REVEAL_MS);
    return () => clearTimeout(timeout);
  }, [isLost, state.answer]);

  const retryReady = isLost && revealedForWord === state.answer;
  const handleEnter = () => handleKeyPress('ENTER');

  return (
    <View className={practiceScreenStyles.container} style={{ paddingBottom: insets.bottom + 8 }}>
      <Header title="Практика" onBackPress={onExitPractice} />

      <View className={practiceScreenStyles.scoreRow}>
        <ScoreItem label="Рахунок" value={streak} />
        <ScoreItem label="Рекорд" value={record} />
      </View>

      <Grid guesses={state.guesses} currentGuess={state.currentGuess} shakeTrigger={shakeTrigger} won={won} />
      <View className={practiceScreenStyles.controls}>
        <Keyboard onKeyPress={handleKeyPress} letterStates={letterStates} disabled={isLost} />
        <ActionBar
          onEnter={handleEnter}
          onHint={handleHint}
          hintsRemaining={hintsRemaining}
          disabled={isLost}
        />
      </View>

      <PracticeRetryModal visible={retryReady} streak={streak} record={record} onRetry={handleRetry} />
    </View>
  );
};

const ScoreItem = ({ label, value }: { label: string; value: number }) => {
  return (
    <View className={practiceScreenStyles.scoreItem}>
      <Text className={practiceScreenStyles.scoreValue}>{value}</Text>
      <Text className={practiceScreenStyles.scoreLabel}>{label}</Text>
    </View>
  );
};
