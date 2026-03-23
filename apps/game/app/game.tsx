import { View, Text, StyleSheet } from "react-native";
import { Canvas, RoundedRect, Fill } from "@shopify/react-native-skia";
import { BOARD_SIZE, CELL_SIZE, CELL_GAP } from "@/game/constants";

export default function GameScreen() {
  return (
    <View style={styles.container}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1a1a2e",
    paddingTop: 60,
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
});
