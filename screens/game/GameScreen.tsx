import { useState } from 'react';
import { DailyGameView } from './DailyGameView';
import { PracticeGameView } from './PracticeGameView';

export function GameScreen() {
  const [mode, setMode] = useState<'daily' | 'practice'>('daily');

  if (mode === 'practice') {
    return <PracticeGameView onExitPractice={() => setMode('daily')} />;
  }

  return <DailyGameView onStartPractice={() => setMode('practice')} />;
}
