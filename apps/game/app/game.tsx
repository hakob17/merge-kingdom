import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useGame } from "@/game/store";
import { OfflineEarningsPopup } from "@/components/OfflineEarningsPopup";
import { CollectionBook } from "@/screens/CollectionBook";
import { KingdomView } from "@/screens/KingdomView";
import { Shop } from "@/screens/Shop";
import { BattlePassScreen } from "@/screens/BattlePassScreen";
import MergeBoard from "@/game/components/MergeBoard";
import GameHUD from "@/game/components/GameHUD";
import KingdomZone from "@/game/components/KingdomZone";

type Screen = "board" | "collection" | "kingdom" | "shop" | "battlepass";

export default function GameScreen() {
  const { state, offlineEarnings, dismissOfflineEarnings } = useGame();
  const [activeScreen, setActiveScreen] = useState<Screen>("board");

  if (activeScreen === "collection") {
    return <CollectionBook onClose={() => setActiveScreen("board")} />;
  }

  if (activeScreen === "kingdom") {
    return <KingdomView onClose={() => setActiveScreen("board")} />;
  }

  if (activeScreen === "shop") {
    return <Shop onClose={() => setActiveScreen("board")} />;
  }

  if (activeScreen === "battlepass") {
    return <BattlePassScreen onClose={() => setActiveScreen("board")} />;
  }

  return (
    <View style={styles.container}>
      <GameHUD />

      <Text style={styles.header}>Merge Board</Text>

      <MergeBoard />

      <Text style={styles.hint}>Tap empty cells to spawn {"\u00B7"} Drag to merge</Text>

      <KingdomZone />

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
        <Pressable
          style={styles.navButton}
          onPress={() => setActiveScreen("shop")}
        >
          <Text style={styles.navButtonText}>Shop</Text>
        </Pressable>
        <Pressable
          style={styles.navButton}
          onPress={() => setActiveScreen("battlepass")}
        >
          <Text style={styles.navButtonText}>Pass</Text>
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
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#e94560",
    marginBottom: 16,
    marginTop: 8,
  },
  hint: {
    marginTop: 12,
    fontSize: 12,
    color: "#666",
  },
  navBar: {
    flexDirection: "row",
    position: "absolute",
    bottom: 40,
    gap: 8,
  },
  navButton: {
    backgroundColor: "#16213e",
    paddingHorizontal: 16,
    paddingVertical: 10,
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
