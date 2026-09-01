import { useState } from 'react';
import { DailyGameView } from './DailyGameView';
import { PracticeGameView } from './PracticeGameView';

export const GameScreen = () => {
  const [mode, setMode] = useState<'daily' | 'practice'>('daily');

  const handleStartPractice = () => setMode('practice');
  const handleExitPractice = () => setMode('daily');

  if (mode === 'practice') {
    return <PracticeGameView onExitPractice={handleExitPractice} />;
  }

  return <DailyGameView onStartPractice={handleStartPractice} />;
};
