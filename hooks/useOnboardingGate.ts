import { useEffect, useState } from 'react';
import { loadOnboardingSeen } from '../lib/storage';

export function useOnboardingGate() {
  const [loading, setLoading] = useState(true);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const value = await loadOnboardingSeen();
      if (cancelled) return;
      setSeen(value);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { loading, seen };
}
