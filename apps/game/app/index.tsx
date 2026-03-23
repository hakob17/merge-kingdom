import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Merge Kingdom</Text>
      <Text style={styles.subtitle}>Build your empire, one merge at a time</Text>
      <Pressable style={styles.playButton} onPress={() => router.push("/game")}>
        <Text style={styles.playButtonText}>Play</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a1a2e",
    padding: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#e94560",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#c4c4c4",
    marginBottom: 48,
  },
  playButton: {
    backgroundColor: "#e94560",
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 30,
  },
  playButtonText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
  },
});
