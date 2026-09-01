import { renderHook, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { markOnboardingSeen } from '../lib/storage';
import { useOnboardingGate } from './useOnboardingGate';

describe('useOnboardingGate', () => {
  afterEach(async () => {
    await AsyncStorage.clear();
  });

  it('reports seen=false once loading finishes, when nothing was marked', async () => {
    const { result } = await renderHook(() => useOnboardingGate());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.seen).toBe(false);
  });

  it('reports seen=true after onboarding was marked', async () => {
    await markOnboardingSeen();
    const { result } = await renderHook(() => useOnboardingGate());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.seen).toBe(true);
  });
});
