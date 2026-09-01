import { useEffect, useState } from 'react';
import { useColorScheme } from 'nativewind';
import { loadThemePreference, saveThemePreference } from '../lib/storage';
import type { ThemePreference } from '../types/theme';

export const useThemePreference = () => {
  const { setColorScheme } = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const saved = await loadThemePreference();
      if (cancelled || !saved) return;
      setPreferenceState(saved);
      setColorScheme(saved);
    })();

    return () => {
      cancelled = true;
    };
    // Runs once on mount only — setColorScheme's identity is stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setPreference = (next: ThemePreference) => {
    setPreferenceState(next);
    setColorScheme(next);
    saveThemePreference(next);
  };

  return { preference, setPreference };
};
