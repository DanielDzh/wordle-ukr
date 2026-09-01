import { Modal, View, Text, Pressable } from 'react-native';
import { practiceRetryModalStyles } from './PracticeRetryModal.styles';

type PracticeRetryModalProps = {
  visible: boolean;
  streak: number;
  record: number;
  onRetry: () => void;
};

export const PracticeRetryModal = ({ visible, streak, record, onRetry }: PracticeRetryModalProps) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className={practiceRetryModalStyles.backdrop}>
        <View className={practiceRetryModalStyles.card}>
          <Text className={practiceRetryModalStyles.headline}>Гра закінчена</Text>

          <View className={practiceRetryModalStyles.statsRow}>
            <StatItem label="Рахунок" value={streak} />
            <StatItem label="Рекорд" value={record} />
          </View>

          <Pressable onPress={onRetry} className={practiceRetryModalStyles.retryButton}>
            <Text className={practiceRetryModalStyles.retryButtonText}>Спробувати знову</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const StatItem = ({ label, value }: { label: string; value: number }) => {
  return (
    <View className={practiceRetryModalStyles.statItem}>
      <Text className={practiceRetryModalStyles.statValue}>{value}</Text>
      <Text className={practiceRetryModalStyles.statLabel}>{label}</Text>
    </View>
  );
};
