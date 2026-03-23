import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useGame } from "../store";
import { LEVEL_XP, MAX_LEVEL } from "../constants";

export default function GameHUD() {
  const { state } = useGame();
  const { player } = state;

  const currentLevelXp = LEVEL_XP[player.level - 1] ?? 0;
  const nextLevelXp = player.level < MAX_LEVEL ? (LEVEL_XP[player.level] ?? 999999) : currentLevelXp;
  const xpProgress = nextLevelXp > currentLevelXp
    ? (player.xp - currentLevelXp) / (nextLevelXp - currentLevelXp)
    : 1;

  return (
    <View style={styles.container}>
      <View style={styles.stat}>
        <Text style={styles.label}>Coins</Text>
        <Text style={styles.value}>{player.coins}</Text>
      </View>
      <View style={styles.levelContainer}>
        <Text style={styles.levelText}>Lv {player.level}</Text>
        <View style={styles.xpBarBg}>
          <View style={[styles.xpBarFill, { width: `${Math.min(100, xpProgress * 100)}%` }]} />
        </View>
      </View>
      <View style={styles.stat}>
        <Text style={styles.label}>Items</Text>
        <Text style={styles.value}>{state.board.items.length}/25</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  stat: {
    alignItems: "center",
  },
  label: {
    fontSize: 10,
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  value: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  levelContainer: {
    alignItems: "center",
    flex: 1,
    marginHorizontal: 16,
  },
  levelText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#e94560",
    marginBottom: 4,
  },
  xpBarBg: {
    width: "100%",
    height: 6,
    backgroundColor: "#0f3460",
    borderRadius: 3,
    overflow: "hidden",
  },
  xpBarFill: {
    height: "100%",
    backgroundColor: "#e94560",
    borderRadius: 3,
  },
});
