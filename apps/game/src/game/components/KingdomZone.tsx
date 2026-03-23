import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useGame } from "../store";
import { BUILDINGS, KINGDOM_ZONES } from "../constants";

const SLOT_SIZE = 52;
const SLOT_GAP = 8;

const BUILDING_COLORS = [
  "#8B6914", // Hut
  "#A0782C", // House
  "#CD950C", // Workshop
  "#DAA520", // Manor
  "#FFD700", // Castle
];

export default function KingdomZone() {
  const { state } = useGame();
  const villageZone = state.kingdom.zones.find((z) => z.id === "village");
  if (!villageZone || !villageZone.unlocked) return null;

  const zoneDef = KINGDOM_ZONES.find((z) => z.id === "village")!;
  const slots = Array.from({ length: zoneDef.buildingSlots });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Village</Text>
      <Text style={styles.subtitle}>
        {villageZone.buildings.length}/{zoneDef.buildingSlots} buildings
        {state.idleIncomePerSecond > 0 && (
          ` \u00B7 ${state.idleIncomePerSecond} coins/s`
        )}
      </Text>
      <View style={styles.slotsRow}>
        {slots.map((_, i) => {
          const building = villageZone.buildings.find((b) => b.slotIndex === i);
          return (
            <View
              key={i}
              style={[
                styles.slot,
                building && {
                  backgroundColor: BUILDING_COLORS[building.tier] ?? "#DAA520",
                  borderColor: "rgba(255,255,255,0.2)",
                },
              ]}
            >
              {building ? (
                <>
                  <Text style={styles.buildingIcon}>
                    {building.tier === 0
                      ? "\u2302"
                      : building.tier === 1
                      ? "\u2302"
                      : building.tier === 2
                      ? "\u2692"
                      : building.tier === 3
                      ? "\u265B"
                      : "\u2655"}
                  </Text>
                  <Text style={styles.buildingName} numberOfLines={1}>
                    {building.name}
                  </Text>
                  <Text style={styles.income}>+{building.income}/s</Text>
                </>
              ) : (
                <Text style={styles.emptySlot}>+</Text>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: 16,
    paddingTop: 16,
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#e94560",
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: "#888",
    marginBottom: 10,
  },
  slotsRow: {
    flexDirection: "row",
    gap: SLOT_GAP,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  slot: {
    width: SLOT_SIZE,
    height: SLOT_SIZE,
    borderRadius: 10,
    backgroundColor: "#0f3460",
    borderWidth: 1,
    borderColor: "#1a4a7a",
    justifyContent: "center",
    alignItems: "center",
  },
  emptySlot: {
    fontSize: 20,
    color: "#3a5a8a",
    fontWeight: "300",
  },
  buildingIcon: {
    fontSize: 18,
    color: "#fff",
  },
  buildingName: {
    fontSize: 8,
    color: "#fff",
    fontWeight: "600",
    marginTop: 1,
  },
  income: {
    fontSize: 8,
    color: "rgba(255,255,255,0.7)",
  },
});
