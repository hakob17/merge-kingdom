import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  Animated,
} from "react-native";

interface Props {
  coins: number;
  onDismiss: () => void;
  onDoubleReward?: () => void;
}

export function OfflineEarningsPopup({ coins, onDismiss, onDoubleReward }: Props) {
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, opacityAnim]);

  return (
    <Modal transparent animationType="fade" onRequestClose={onDismiss}>
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.popup,
            { opacity: opacityAnim, transform: [{ scale: scaleAnim }] },
          ]}
        >
          <Text style={styles.title}>Welcome Back!</Text>
          <Text style={styles.subtitle}>While you were away, your kingdom earned</Text>
          <Text style={styles.coinAmount}>{coins.toLocaleString()}</Text>
          <Text style={styles.coinLabel}>coins</Text>

          <View style={styles.buttonRow}>
            <Pressable style={styles.collectButton} onPress={onDismiss}>
              <Text style={styles.collectButtonText}>Collect</Text>
            </Pressable>
            {onDoubleReward && (
              <Pressable
                style={[styles.collectButton, styles.doubleButton]}
                onPress={onDoubleReward}
              >
                <Text style={styles.collectButtonText}>2x (Ad)</Text>
              </Pressable>
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  popup: {
    backgroundColor: "#16213e",
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    width: 300,
    borderWidth: 2,
    borderColor: "#e94560",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#e94560",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#c4c4c4",
    textAlign: "center",
    marginBottom: 16,
  },
  coinAmount: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#DAA520",
  },
  coinLabel: {
    fontSize: 16,
    color: "#DAA520",
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  collectButton: {
    backgroundColor: "#e94560",
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 20,
  },
  doubleButton: {
    backgroundColor: "#DAA520",
  },
  collectButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
});
