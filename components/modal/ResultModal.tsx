import { Modal, View, Text, Pressable } from 'react-native';
import type { Stats } from '../../types/game';
import { resultModalStyles } from './ResultModal.styles';

type ResultModalProps = {
  visible: boolean;
  won: boolean;
  stats: Stats;
  onShare: () => void;
  onClose: () => void;
};

export function ResultModal({ visible, won, stats, onShare, onClose }: ResultModalProps) {
  const winPercent = stats.gamesPlayed === 0 ? 0 : Math.round((stats.gamesWon / stats.gamesPlayed) * 100);
  const maxCount = Math.max(...stats.guessDistribution, 1);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className={resultModalStyles.backdrop}>
        <View className={resultModalStyles.card}>
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

          <Pressable onPress={onShare} className={resultModalStyles.shareButton}>
            <Text className={resultModalStyles.shareButtonText}>Поділитись</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function StatItem({ label, value }: { label: string; value: number }) {
  return (
    <View className={resultModalStyles.statItem}>
      <Text className={resultModalStyles.statValue}>{value}</Text>
      <Text className={resultModalStyles.statLabel}>{label}</Text>
    </View>
  );
}
