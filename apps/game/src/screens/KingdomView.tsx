import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import { useGame } from "@/game/store";
import { KINGDOM_ZONES, BUILDINGS } from "@/game/constants";
import type { ZoneId } from "@/game/constants";

const ZONE_COLORS: Record<string, string> = {
  village: "#2d6a4f",
  town: "#1d3557",
  city: "#6a040f",
};

export function KingdomView({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useGame();
  const { kingdom, player, idleIncomePerSecond } = state;
  const [selectedZone, setSelectedZone] = useState<ZoneId>("village");

  const zone = kingdom.zones.find((z) => z.id === selectedZone)!;
  const zoneDef = KINGDOM_ZONES.find((z) => z.id === selectedZone)!;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onClose} style={styles.backButton}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.title}>Kingdom</Text>
        <Text style={styles.incomeText}>
          {idleIncomePerSecond}/s
        </Text>
      </View>

      {/* Player info bar */}
      <View style={styles.playerBar}>
        <Text style={styles.playerStat}>Lv. {player.level}</Text>
        <Text style={styles.playerStat}>{player.coins.toLocaleString()} coins</Text>
      </View>

      {/* Zone tabs */}
      <View style={styles.zoneTabs}>
        {KINGDOM_ZONES.map((z) => {
          const zoneState = kingdom.zones.find((ks) => ks.id === z.id)!;
          const isSelected = z.id === selectedZone;
          const isLocked = !zoneState.unlocked;

          return (
            <Pressable
              key={z.id}
              style={[
                styles.zoneTab,
                isSelected && styles.zoneTabActive,
                isLocked && styles.zoneTabLocked,
              ]}
              onPress={() => !isLocked && setSelectedZone(z.id)}
              disabled={isLocked}
            >
              <Text
                style={[
                  styles.zoneTabText,
                  isSelected && styles.zoneTabTextActive,
                  isLocked && styles.zoneTabTextLocked,
                ]}
              >
                {z.name}
                {isLocked ? ` (Lv.${z.unlockLevel})` : ""}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Zone description */}
      <Text style={styles.zoneDescription}>{zoneDef.description}</Text>

      {/* Building slots */}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>
          Buildings ({zone.buildings.length}/{zoneDef.buildingSlots})
        </Text>
        <View style={styles.slotsGrid}>
          {Array.from({ length: zoneDef.buildingSlots }).map((_, i) => {
            const building = zone.buildings.find((b) => b.slotIndex === i);

            if (building) {
              return (
                <View
                  key={i}
                  style={[
                    styles.slot,
                    { backgroundColor: ZONE_COLORS[selectedZone] || "#16213e" },
                  ]}
                >
                  <Text style={styles.buildingName}>{building.name}</Text>
                  <Text style={styles.buildingIncome}>
                    +{building.income}/s
                  </Text>
                  <Text style={styles.buildingTier}>
                    Tier {building.tier + 1}
                  </Text>
                </View>
              );
            }

            return (
              <View key={i} style={[styles.slot, styles.emptySlot]}>
                <Text style={styles.emptySlotText}>Empty</Text>
                <Text style={styles.emptySlotHint}>Merge to build</Text>
              </View>
            );
          })}
        </View>
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
    paddingBottom: 12,
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
  incomeText: {
    fontSize: 14,
    color: "#DAA520",
    fontWeight: "600",
  },
  playerBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 8,
    backgroundColor: "#16213e",
    marginHorizontal: 16,
    borderRadius: 8,
  },
  playerStat: {
    color: "#c4c4c4",
    fontSize: 14,
    fontWeight: "600",
  },
  zoneTabs: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginTop: 16,
    gap: 8,
  },
  zoneTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#16213e",
    alignItems: "center",
  },
  zoneTabActive: {
    backgroundColor: "#e94560",
  },
  zoneTabLocked: {
    opacity: 0.4,
  },
  zoneTabText: {
    color: "#c4c4c4",
    fontSize: 13,
    fontWeight: "600",
  },
  zoneTabTextActive: {
    color: "#fff",
  },
  zoneTabTextLocked: {
    color: "#666",
  },
  zoneDescription: {
    color: "#888",
    fontSize: 12,
    textAlign: "center",
    marginTop: 8,
    marginHorizontal: 16,
  },
  scroll: {
    flex: 1,
    marginTop: 16,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#c4c4c4",
    marginBottom: 12,
  },
  slotsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  slot: {
    width: 100,
    height: 100,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    padding: 8,
  },
  emptySlot: {
    backgroundColor: "#0f3460",
    borderWidth: 1,
    borderColor: "#333",
    borderStyle: "dashed",
  },
  buildingName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  buildingIncome: {
    fontSize: 12,
    color: "#DAA520",
    marginTop: 4,
  },
  buildingTier: {
    fontSize: 10,
    color: "#aaa",
    marginTop: 2,
  },
  emptySlotText: {
    color: "#555",
    fontSize: 14,
  },
  emptySlotHint: {
    color: "#444",
    fontSize: 10,
    marginTop: 4,
  },
});
