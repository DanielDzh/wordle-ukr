import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Tile } from '../../components/grid/Tile';
import { markOnboardingSeen } from '../../lib/storage';
import { onboardingStyles } from './OnboardingScreen.styles';

const STEPS = [
  {
    title: 'Як грати',
    body: 'Вгадайте українське слово з 5 літер за 6 спроб. Після кожної спроби кольори підказують, наскільки ви близькі.',
  },
  {
    title: 'Що означають кольори',
    body: 'Зелений — літера на своєму місці. Жовтий — літера є в слові, але на іншому місці. Сірий — літери немає в слові.',
  },
  {
    title: 'Слово дня',
    body: 'Кожного дня — нове слово. Вигравайте день у день, щоб наростити серію перемог (streak).',
  },
];

type Props = {
  navigation: { replace: (screen: 'Game') => void };
  route: unknown;
};

export function OnboardingScreen({ navigation }: Props) {
  const [step, setStep] = useState(0);
  const isLastStep = step === STEPS.length - 1;
  const insets = useSafeAreaInsets();

  const finish = async () => {
    await markOnboardingSeen();
    navigation.replace('Game');
  };

  const handleNext = () => {
    if (isLastStep) {
      finish();
    } else {
      setStep((s) => s + 1);
    }
  };

  return (
    <View
      className={onboardingStyles.container}
      style={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }}
    >
      <View className={onboardingStyles.content}>
        <Text className={onboardingStyles.title}>{STEPS[step].title}</Text>
        <Text className={onboardingStyles.body}>{STEPS[step].body}</Text>
        {step === 1 ? (
          <View className={onboardingStyles.tileRow}>
            <Tile letter="А" state="correct" />
            <Tile letter="Б" state="present" />
            <Tile letter="В" state="absent" />
          </View>
        ) : null}
      </View>

      <View className={onboardingStyles.footer}>
        <Pressable onPress={finish}>
          <Text className={onboardingStyles.skipText}>Пропустити</Text>
        </Pressable>
        <Pressable onPress={handleNext} className={onboardingStyles.nextButton}>
          <Text className={onboardingStyles.nextButtonText}>
            {isLastStep ? 'Почати гру' : 'Далі'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
