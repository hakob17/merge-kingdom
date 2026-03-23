// Shared types and utilities for Merge Kingdom

/** Player profile synced across client and server */
export interface PlayerProfile {
  id: string;
  name: string;
  level: number;
  coins: number;
  gems: number;
  createdAt: number;
}

/** Idle income calculation — shared between client preview and server authority */
export function calculateIdleIncome(
  incomePerSecond: number,
  lastCollectedAt: number,
  now: number,
  maxOfflineHours = 8
): number {
  const elapsed = Math.max(0, now - lastCollectedAt) / 1000;
  const capped = Math.min(elapsed, maxOfflineHours * 3600);
  return Math.floor(incomePerSecond * capped);
}

/** Merge result — what happens when two items combine */
export interface MergeResult {
  success: boolean;
  newTier: number;
  bonusCoins: number;
  isMaxTier: boolean;
}

/** Calculate merge outcome */
export function resolveMerge(tier: number, maxTier: number): MergeResult {
  if (tier >= maxTier) {
    return { success: false, newTier: tier, bonusCoins: 0, isMaxTier: true };
  }
  const newTier = tier + 1;
  const bonusCoins = Math.pow(2, newTier);
  return {
    success: true,
    newTier,
    bonusCoins,
    isMaxTier: newTier >= maxTier,
  };
}
