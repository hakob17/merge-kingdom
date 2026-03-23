import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Canvas, RoundedRect, Fill } from "@shopify/react-native-skia";
import { BOARD_SIZE, CELL_SIZE, CELL_GAP } from "@/game/constants";
import { useGame } from "@/game/store";
import { OfflineEarningsPopup } from "@/components/OfflineEarningsPopup";
import { CollectionBook } from "@/screens/CollectionBook";
import { KingdomView } from "@/screens/KingdomView";

type Screen = "board" | "collection" | "kingdom";

export default function GameScreen() {
  const { state, offlineEarnings, dismissOfflineEarnings } = useGame();
  const [activeScreen, setActiveScreen] = useState<Screen>("board");

  if (activeScreen === "collection") {
    return <CollectionBook onClose={() => setActiveScreen("board")} />;
  }

  if (activeScreen === "kingdom") {
    return <KingdomView onClose={() => setActiveScreen("board")} />;
  }

  return (
    <View style={styles.container}>
      {/* Stats bar */}
      <View style={styles.statsBar}>
        <Text style={styles.stat}>Lv. {state.player.level}</Text>
        <Text style={styles.stat}>{state.player.coins.toLocaleString()} coins</Text>
        <Text style={styles.stat}>{state.idleIncomePerSecond}/s</Text>
      </View>

      <Text style={styles.header}>Merge Board</Text>

      <View style={styles.boardContainer}>
        <Canvas
          style={{
            width: BOARD_SIZE * (CELL_SIZE + CELL_GAP) + CELL_GAP,
            height: BOARD_SIZE * (CELL_SIZE + CELL_GAP) + CELL_GAP,
          }}
        >
          <Fill color="#16213e" />
          {Array.from({ length: BOARD_SIZE * BOARD_SIZE }).map((_, i) => {
            const row = Math.floor(i / BOARD_SIZE);
            const col = i % BOARD_SIZE;
            const x = CELL_GAP + col * (CELL_SIZE + CELL_GAP);
            const y = CELL_GAP + row * (CELL_SIZE + CELL_GAP);
            return (
              <RoundedRect
                key={i}
                x={x}
                y={y}
                width={CELL_SIZE}
                height={CELL_SIZE}
                r={8}
                color="#0f3460"
              />
            );
          })}
        </Canvas>
      </View>

      <Text style={styles.hint}>Drag items to merge them!</Text>

      {/* Bottom navigation */}
      <View style={styles.navBar}>
        <Pressable
          style={styles.navButton}
          onPress={() => setActiveScreen("kingdom")}
        >
          <Text style={styles.navButtonText}>Kingdom</Text>
        </Pressable>
        <Pressable
          style={styles.navButton}
          onPress={() => setActiveScreen("collection")}
        >
          <Text style={styles.navButtonText}>Collection</Text>
        </Pressable>
      </View>

      {/* Offline earnings popup */}
      {offlineEarnings != null && offlineEarnings > 0 && (
        <OfflineEarningsPopup
          coins={offlineEarnings}
          onDismiss={dismissOfflineEarnings}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#1a1a2e",
    paddingTop: 60,
  },
  statsBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  stat: {
    color: "#DAA520",
    fontSize: 14,
    fontWeight: "600",
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#e94560",
    marginBottom: 24,
  },
  boardContainer: {
    borderRadius: 16,
    overflow: "hidden",
  },
  hint: {
    marginTop: 24,
    fontSize: 14,
    color: "#c4c4c4",
  },
  navBar: {
    flexDirection: "row",
    position: "absolute",
    bottom: 40,
    gap: 16,
  },
  navButton: {
    backgroundColor: "#16213e",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e94560",
  },
  navButtonText: {
    color: "#e94560",
    fontSize: 14,
    fontWeight: "600",
  },
});
