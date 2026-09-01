import { Modal, View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Stats } from '../../types/game';
import { resultModalStyles } from './ResultModal.styles';

type ResultModalProps = {
  visible: boolean;
  won: boolean;
  stats: Stats;
  onShare: () => void;
  onClose: () => void;
  onPractice: () => void;
};

export const ResultModal = ({ visible, won, stats, onShare, onClose, onPractice }: ResultModalProps) => {
  const winPercent = stats.gamesPlayed === 0 ? 0 : Math.round((stats.gamesWon / stats.gamesPlayed) * 100);
  const maxCount = Math.max(...stats.guessDistribution, 1);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className={resultModalStyles.backdrop}>
        <View className={resultModalStyles.card}>
          <Pressable
            onPress={onClose}
            hitSlop={8}
            accessibilityLabel="Закрити"
            className={resultModalStyles.closeButton}
          >
            <Ionicons name="close" size={22} color="#6b7280" />
          </Pressable>

          <Text className={resultModalStyles.headline}>{won ? 'Перемога!' : 'Гра закінчена'}</Text>

          <View className={resultModalStyles.statsRow}>
            <StatItem label="Ігор" value={stats.gamesPlayed} />
            <StatItem label="% перемог" value={winPercent} />
            <StatItem label="Серія" value={stats.currentStreak} />
            <StatItem label="Макс. серія" value={stats.maxStreak} />
          </View>

          <View className={resultModalStyles.distribution}>
            {stats.guessDistribution.map((count, i) => (
              <View key={i} className={resultModalStyles.distributionRow}>
                <Text className={resultModalStyles.distributionLabel}>{i + 1}</Text>
                <View
                  className={resultModalStyles.distributionBar}
                  style={{ width: `${Math.max((count / maxCount) * 100, 8)}%` }}
                >
                  <Text className={resultModalStyles.distributionCount}>{count}</Text>
                </View>
              </View>
            ))}
          </View>

          <Pressable onPress={onPractice} className={resultModalStyles.practiceButton}>
            <Text className={resultModalStyles.practiceButtonText}>Наступне слово</Text>
          </Pressable>

          <Pressable onPress={onShare} className={resultModalStyles.shareButton}>
            <Text className={resultModalStyles.shareButtonText}>Поділитись</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const StatItem = ({ label, value }: { label: string; value: number }) => {
  return (
    <View className={resultModalStyles.statItem}>
      <Text className={resultModalStyles.statValue}>{value}</Text>
      <Text className={resultModalStyles.statLabel}>{label}</Text>
    </View>
  );
};
