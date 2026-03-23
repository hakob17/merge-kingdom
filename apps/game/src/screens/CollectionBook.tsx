import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import { useGame } from "@/game/store";
import { MERGE_CHAINS, CHAIN_COLORS } from "@/game/constants";
import type { ChainType } from "@/game/constants";

export function CollectionBook({ onClose }: { onClose: () => void }) {
  const { state } = useGame();
  const { collection } = state;

  const chains = Object.entries(MERGE_CHAINS) as [ChainType, readonly string[]][];

  const discoveredCount = collection.filter((c) => c.discovered).length;
  const totalCount = collection.length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={onClose} style={styles.backButton}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.title}>Collection Book</Text>
        <Text style={styles.progress}>
          {discoveredCount}/{totalCount}
        </Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {chains.map(([chainKey, tiers]) => (
          <View key={chainKey} style={styles.chainSection}>
            <Text style={styles.chainTitle}>
              {chainKey.charAt(0).toUpperCase() + chainKey.slice(1)}
            </Text>
            <View style={styles.tierRow}>
              {tiers.map((name, tierIdx) => {
                const entry = collection.find(
                  (c) => c.chain === chainKey && c.tier === tierIdx
                );
                const discovered = entry?.discovered ?? false;
                const colors = CHAIN_COLORS[chainKey];

                return (
                  <View
                    key={tierIdx}
                    style={[
                      styles.tierCard,
                      {
                        backgroundColor: discovered
                          ? colors[tierIdx]
                          : "#1a1a2e",
                        borderColor: discovered ? colors[tierIdx] : "#333",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.tierName,
                        { color: discovered ? "#fff" : "#555" },
                      ]}
                    >
                      {discovered ? name : "???"}
                    </Text>
                    <Text style={styles.tierLevel}>Tier {tierIdx + 1}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  backText: {
    color: "#e94560",
    fontSize: 16,
    fontWeight: "600",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#e94560",
  },
  progress: {
    fontSize: 16,
    color: "#DAA520",
    fontWeight: "600",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  chainSection: {
    marginBottom: 24,
  },
  chainTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#c4c4c4",
    marginBottom: 12,
  },
  tierRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  tierCard: {
    width: 90,
    height: 90,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    padding: 4,
  },
  tierName: {
    fontSize: 13,
    fontWeight: "bold",
    textAlign: "center",
  },
  tierLevel: {
    fontSize: 10,
    color: "#888",
    marginTop: 4,
  },
});
