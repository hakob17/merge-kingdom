/**
 * In-App Purchase product definitions and service.
 * Uses expo-in-app-purchases (or react-native-iap) under the hood.
 * This module defines products and provides a mock-ready purchase flow.
 */

export interface IAPProduct {
  id: string;
  name: string;
  description: string;
  priceUSD: number;
  type: "consumable" | "non_consumable" | "subscription";
  /** Gems granted on purchase (consumable) */
  gemsGranted?: number;
  /** Duration in days (subscription) */
  durationDays?: number;
  /** Special trigger condition */
  triggerLevel?: number;
}

export const IAP_PRODUCTS: IAPProduct[] = [
  // Gem packs (consumable)
  {
    id: "gems_tiny",
    name: "Handful of Gems",
    description: "80 gems",
    priceUSD: 0.99,
    type: "consumable",
    gemsGranted: 80,
  },
  {
    id: "gems_small",
    name: "Pouch of Gems",
    description: "500 gems",
    priceUSD: 4.99,
    type: "consumable",
    gemsGranted: 500,
  },
  {
    id: "gems_medium",
    name: "Chest of Gems",
    description: "1,200 gems",
    priceUSD: 9.99,
    type: "consumable",
    gemsGranted: 1200,
  },
  {
    id: "gems_large",
    name: "Vault of Gems",
    description: "2,800 gems",
    priceUSD: 19.99,
    type: "consumable",
    gemsGranted: 2800,
  },

  // Remove Ads (non-consumable)
  {
    id: "remove_ads",
    name: "Remove Ads",
    description: "Remove all interstitial ads forever",
    priceUSD: 2.99,
    type: "non_consumable",
  },

  // Starter Pack (one-time, shown at level 5)
  {
    id: "starter_pack",
    name: "Starter Pack",
    description: "500 gems + 5,000 coins + Remove Ads",
    priceUSD: 1.99,
    type: "non_consumable",
    gemsGranted: 500,
    triggerLevel: 5,
  },

  // Battle Pass (subscription-like, per season)
  {
    id: "battle_pass_premium",
    name: "Premium Battle Pass",
    description: "Unlock premium reward track for this season",
    priceUSD: 4.99,
    type: "non_consumable",
    durationDays: 30,
  },
];

/** State of purchased items */
export interface PurchaseState {
  adsRemoved: boolean;
  starterPackPurchased: boolean;
  battlePassActive: boolean;
  battlePassExpiresAt: number | null;
}

export function createInitialPurchaseState(): PurchaseState {
  return {
    adsRemoved: false,
    starterPackPurchased: false,
    battlePassActive: false,
    battlePassExpiresAt: null,
  };
}

/**
 * Process a completed purchase and return updated state + rewards.
 * In production, verify receipt server-side before granting.
 */
export function processPurchase(
  productId: string,
  currentState: PurchaseState
): { state: PurchaseState; gemsGranted: number; coinsGranted: number } {
  const product = IAP_PRODUCTS.find((p) => p.id === productId);
  if (!product) throw new Error(`Unknown product: ${productId}`);

  let gemsGranted = product.gemsGranted ?? 0;
  let coinsGranted = 0;
  const newState = { ...currentState };

  switch (productId) {
    case "remove_ads":
      newState.adsRemoved = true;
      break;

    case "starter_pack":
      newState.adsRemoved = true;
      newState.starterPackPurchased = true;
      coinsGranted = 5000;
      break;

    case "battle_pass_premium":
      newState.battlePassActive = true;
      newState.battlePassExpiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;
      break;
  }

  return { state: newState, gemsGranted, coinsGranted };
}
