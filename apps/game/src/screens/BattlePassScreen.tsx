import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import {
  generateSeason,
  createInitialBattlePassState,
  canClaimReward,
  type BattlePassReward,
} from "@/services/battlepass";

// For now use a static season; in production load from server
const CURRENT_SEASON = generateSeason(1, Date.now() - 5 * 24 * 60 * 60 * 1000);

export function BattlePassScreen({ onClose }: { onClose: () => void }) {
  // In production, load from game state / server
  const bpState = createInitialBattlePassState(CURRENT_SEASON.id);

  const daysLeft = Math.max(
    0,
    Math.ceil((CURRENT_SEASON.endDate - Date.now()) / (24 * 60 * 60 * 1000))
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={onClose} style={styles.backButton}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.title}>{CURRENT_SEASON.name}</Text>
        <Text style={styles.daysLeft}>{daysLeft}d left</Text>
      </View>

      <View style={styles.progressBar}>
        <Text style={styles.progressText}>
          Tier {bpState.currentTier}/30 — {bpState.currentXp}/{CURRENT_SEASON.xpPerTier} XP
        </Text>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.min(
                  100,
                  (bpState.currentXp / CURRENT_SEASON.xpPerTier) * 100
                )}%`,
              },
            ]}
          />
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {CURRENT_SEASON.tiers.map((tier) => (
          <TierRow
            key={tier.tier}
            reward={tier}
            currentTier={bpState.currentTier}
            isPremium={bpState.isPremium}
            freeClaimed={bpState.claimedFreeTiers.includes(tier.tier)}
            premiumClaimed={bpState.claimedPremiumTiers.includes(tier.tier)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

function TierRow({
  reward,
  currentTier,
  isPremium,
  freeClaimed,
  premiumClaimed,
}: {
  reward: BattlePassReward;
  currentTier: number;
  isPremium: boolean;
  freeClaimed: boolean;
  premiumClaimed: boolean;
}) {
  const unlocked = reward.tier <= currentTier;

  return (
    <View style={[styles.tierRow, !unlocked && styles.tierLocked]}>
      <Text style={styles.tierNumber}>{reward.tier}</Text>

      {/* Free track */}
      <View
        style={[
          styles.rewardCard,
          freeClaimed && styles.rewardClaimed,
          !unlocked && styles.rewardLocked,
        ]}
      >
        <Text style={styles.rewardName}>{reward.free.name}</Text>
        <Text style={styles.rewardLabel}>FREE</Text>
        {unlocked && !freeClaimed && (
          <Text style={styles.claimText}>Claim</Text>
        )}
        {freeClaimed && <Text style={styles.claimedText}>Claimed</Text>}
      </View>

      {/* Premium track */}
      <View
        style={[
          styles.rewardCard,
          styles.premiumCard,
          premiumClaimed && styles.rewardClaimed,
          (!unlocked || !isPremium) && styles.rewardLocked,
        ]}
      >
        <Text style={styles.rewardName}>{reward.premium.name}</Text>
        <Text style={[styles.rewardLabel, styles.premiumLabel]}>PREMIUM</Text>
        {unlocked && isPremium && !premiumClaimed && (
          <Text style={styles.claimText}>Claim</Text>
        )}
        {premiumClaimed && <Text style={styles.claimedText}>Claimed</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1a1a2e" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 12,
  },
  backButton: { padding: 8 },
  backText: { color: "#e94560", fontSize: 16, fontWeight: "600" },
  title: { fontSize: 22, fontWeight: "bold", color: "#e94560" },
  daysLeft: { fontSize: 14, color: "#DAA520", fontWeight: "600" },
  progressBar: { paddingHorizontal: 16, marginBottom: 16 },
  progressText: { color: "#c4c4c4", fontSize: 13, marginBottom: 6 },
  progressTrack: {
    height: 8,
    backgroundColor: "#16213e",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#e94560",
    borderRadius: 4,
  },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  tierRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  tierLocked: { opacity: 0.5 },
  tierNumber: {
    width: 28,
    fontSize: 14,
    fontWeight: "bold",
    color: "#888",
    textAlign: "center",
  },
  rewardCard: {
    flex: 1,
    backgroundColor: "#16213e",
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: "#333",
  },
  premiumCard: {
    borderColor: "#DAA520",
  },
  rewardClaimed: {
    opacity: 0.6,
    borderColor: "#2d6a4f",
  },
  rewardLocked: {
    opacity: 0.4,
  },
  rewardName: { fontSize: 12, color: "#fff", fontWeight: "600" },
  rewardLabel: { fontSize: 9, color: "#666", marginTop: 2 },
  premiumLabel: { color: "#DAA520" },
  claimText: {
    fontSize: 11,
    color: "#e94560",
    fontWeight: "bold",
    marginTop: 4,
  },
  claimedText: {
    fontSize: 11,
    color: "#2d6a4f",
    fontWeight: "600",
    marginTop: 4,
  },
});
