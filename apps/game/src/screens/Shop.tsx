import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from "react-native";
import { IAP_PRODUCTS, type IAPProduct } from "@/services/iap";
import { useGame } from "@/game/store";

export function Shop({ onClose }: { onClose: () => void }) {
  const { state } = useGame();

  const gemPacks = IAP_PRODUCTS.filter((p) => p.id.startsWith("gems_"));
  const specialOffers = IAP_PRODUCTS.filter(
    (p) => !p.id.startsWith("gems_") && p.id !== "battle_pass_premium"
  );
  const battlePass = IAP_PRODUCTS.find((p) => p.id === "battle_pass_premium");

  // Only show starter pack if player is at or above trigger level and hasn't bought it
  const starterPack = IAP_PRODUCTS.find((p) => p.id === "starter_pack");
  const showStarterPack =
    starterPack &&
    state.player.level >= (starterPack.triggerLevel ?? 0);

  function handlePurchase(product: IAPProduct) {
    // In production: trigger real IAP flow via expo-in-app-purchases
    Alert.alert(
      "Purchase",
      `Buy ${product.name} for $${product.priceUSD.toFixed(2)}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Buy",
          onPress: () => {
            // processPurchase() would be called here after receipt verification
            Alert.alert("Success", `${product.name} purchased!`);
          },
        },
      ]
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={onClose} style={styles.backButton}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.title}>Shop</Text>
        <Text style={styles.gems}>{state.player.gems} gems</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Special Offers */}
        {showStarterPack && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Special Offer</Text>
            <Pressable
              style={[styles.productCard, styles.specialCard]}
              onPress={() => handlePurchase(starterPack!)}
            >
              <Text style={styles.productName}>{starterPack!.name}</Text>
              <Text style={styles.productDesc}>{starterPack!.description}</Text>
              <Text style={styles.productPrice}>
                ${starterPack!.priceUSD.toFixed(2)}
              </Text>
              <Text style={styles.bestValue}>BEST VALUE</Text>
            </Pressable>
          </View>
        )}

        {/* Remove Ads */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Premium</Text>
          {specialOffers
            .filter((p) => p.id !== "starter_pack")
            .map((product) => (
              <Pressable
                key={product.id}
                style={styles.productCard}
                onPress={() => handlePurchase(product)}
              >
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productDesc}>{product.description}</Text>
                <Text style={styles.productPrice}>
                  ${product.priceUSD.toFixed(2)}
                </Text>
              </Pressable>
            ))}

          {/* Battle Pass */}
          {battlePass && (
            <Pressable
              style={[styles.productCard, styles.battlePassCard]}
              onPress={() => handlePurchase(battlePass)}
            >
              <Text style={styles.productName}>{battlePass.name}</Text>
              <Text style={styles.productDesc}>{battlePass.description}</Text>
              <Text style={styles.productPrice}>
                ${battlePass.priceUSD.toFixed(2)}/season
              </Text>
            </Pressable>
          )}
        </View>

        {/* Gem Packs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gem Packs</Text>
          <View style={styles.gemGrid}>
            {gemPacks.map((product) => (
              <Pressable
                key={product.id}
                style={styles.gemCard}
                onPress={() => handlePurchase(product)}
              >
                <Text style={styles.gemAmount}>{product.gemsGranted}</Text>
                <Text style={styles.gemLabel}>gems</Text>
                <Text style={styles.gemPrice}>
                  ${product.priceUSD.toFixed(2)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1a1a2e" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButton: { padding: 8 },
  backText: { color: "#e94560", fontSize: 16, fontWeight: "600" },
  title: { fontSize: 22, fontWeight: "bold", color: "#e94560" },
  gems: { fontSize: 16, color: "#DAA520", fontWeight: "600" },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#c4c4c4",
    marginBottom: 12,
  },
  productCard: {
    backgroundColor: "#16213e",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#333",
  },
  specialCard: {
    borderColor: "#DAA520",
    borderWidth: 2,
  },
  battlePassCard: {
    borderColor: "#e94560",
    borderWidth: 2,
  },
  productName: { fontSize: 16, fontWeight: "bold", color: "#fff" },
  productDesc: { fontSize: 13, color: "#888", marginTop: 4 },
  productPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#DAA520",
    marginTop: 8,
  },
  bestValue: {
    position: "absolute",
    top: 8,
    right: 12,
    fontSize: 10,
    fontWeight: "bold",
    color: "#1a1a2e",
    backgroundColor: "#DAA520",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: "hidden",
  },
  gemGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  gemCard: {
    width: "47%",
    backgroundColor: "#16213e",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333",
  },
  gemAmount: { fontSize: 28, fontWeight: "bold", color: "#DAA520" },
  gemLabel: { fontSize: 12, color: "#888", marginTop: 2 },
  gemPrice: { fontSize: 16, fontWeight: "bold", color: "#fff", marginTop: 8 },
});
