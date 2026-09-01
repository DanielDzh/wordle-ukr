import * as Haptics from 'expo-haptics';
import { hapticLight, hapticMedium, hapticSuccess, hapticError } from './haptics';

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium' },
  NotificationFeedbackType: { Success: 'success', Error: 'error' },
}));

describe('haptics', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('hapticLight triggers a light impact', async () => {
    await hapticLight();
    expect(Haptics.impactAsync).toHaveBeenCalledWith('light');
  });

  it('hapticMedium triggers a medium impact', async () => {
    await hapticMedium();
    expect(Haptics.impactAsync).toHaveBeenCalledWith('medium');
  });

  it('hapticSuccess triggers a success notification', async () => {
    await hapticSuccess();
    expect(Haptics.notificationAsync).toHaveBeenCalledWith('success');
  });

  it('hapticError triggers an error notification', async () => {
    await hapticError();
    expect(Haptics.notificationAsync).toHaveBeenCalledWith('error');
  });
});
