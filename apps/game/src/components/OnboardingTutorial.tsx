import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  Dimensions,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface TutorialStep {
  title: string;
  description: string;
  highlight?: "board" | "kingdom" | "merge";
}

const STEPS: TutorialStep[] = [
  {
    title: "Welcome to Merge Kingdom!",
    description: "Tap empty cells on the board to spawn items.",
    highlight: "board",
  },
  {
    title: "Merge to Build",
    description:
      "Drag identical items together to merge them into something better!",
    highlight: "merge",
  },
  {
    title: "Build Your Kingdom",
    description:
      "Merged materials become buildings that earn coins — even while you sleep!",
    highlight: "kingdom",
  },
];

interface Props {
  onComplete: () => void;
}

export function OnboardingTutorial({ onComplete }: Props) {
  const [step, setStep] = useState(0);

  const currentStep = STEPS[step];
  const isLast = step === STEPS.length - 1;

  function handleNext() {
    if (isLast) {
      onComplete();
    } else {
      setStep(step + 1);
    }
  }

  return (
    <Modal transparent animationType="fade">
      <View style={styles.overlay}>
        {/* Step indicator */}
        <View style={styles.dots}>
          {STEPS.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === step && styles.dotActive]}
            />
          ))}
        </View>

        {/* Content card */}
        <View style={styles.card}>
          <Text style={styles.title}>{currentStep.title}</Text>
          <Text style={styles.description}>{currentStep.description}</Text>

          <Pressable style={styles.button} onPress={handleNext}>
            <Text style={styles.buttonText}>
              {isLast ? "Let's Go!" : "Next"}
            </Text>
          </Pressable>

          {!isLast && (
            <Pressable onPress={onComplete} style={styles.skipButton}>
              <Text style={styles.skipText}>Skip Tutorial</Text>
            </Pressable>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 80,
  },
  dots: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#555",
  },
  dotActive: {
    backgroundColor: "#e94560",
    width: 24,
  },
  card: {
    backgroundColor: "#16213e",
    borderRadius: 20,
    padding: 28,
    width: SCREEN_WIDTH - 48,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e94560",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#e94560",
    marginBottom: 12,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#c4c4c4",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },
  button: {
    backgroundColor: "#e94560",
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 25,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  skipButton: {
    marginTop: 16,
    padding: 8,
  },
  skipText: {
    color: "#666",
    fontSize: 14,
  },
});
