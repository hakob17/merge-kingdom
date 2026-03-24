/**
 * Ad integration service.
 *
 * In production, integrate with AdMob (expo-ads-admob) or similar.
 * This module manages ad timing and provides a mock-ready interface.
 */

const INTERSTITIAL_INTERVAL_MS = 3 * 60 * 1000; // 3 minutes
const REWARDED_COOLDOWN_MS = 30 * 1000; // 30s between rewarded ads

export type RewardedAdType =
  | "double_idle_income" // 2x idle earnings for 2 hours
  | "extra_board_space" // +2 board slots for current session
  | "instant_build"; // skip building wait time

interface AdState {
  lastInterstitialAt: number;
  lastRewardedAt: number;
  adsRemoved: boolean;
  doubleIncomeExpiresAt: number;
}

let adState: AdState = {
  lastInterstitialAt: 0,
  lastRewardedAt: 0,
  adsRemoved: false,
  doubleIncomeExpiresAt: 0,
};

export function setAdsRemoved(removed: boolean) {
  adState.adsRemoved = removed;
}

/** Check if an interstitial ad should be shown */
export function shouldShowInterstitial(): boolean {
  if (adState.adsRemoved) return false;
  return Date.now() - adState.lastInterstitialAt >= INTERSTITIAL_INTERVAL_MS;
}

/** Mark interstitial as shown */
export function markInterstitialShown() {
  adState.lastInterstitialAt = Date.now();
}

/** Check if a rewarded ad can be requested */
export function canShowRewarded(): boolean {
  return Date.now() - adState.lastRewardedAt >= REWARDED_COOLDOWN_MS;
}

/**
 * Show a rewarded ad and return the reward.
 * In production, this would call the ad SDK and await completion.
 */
export async function showRewardedAd(
  type: RewardedAdType
): Promise<{ granted: boolean; reward: RewardedAdType }> {
  if (!canShowRewarded()) {
    return { granted: false, reward: type };
  }

  // In production: await AdMob.showRewarded(adUnitId)
  // For now, simulate a successful ad view
  adState.lastRewardedAt = Date.now();

  if (type === "double_idle_income") {
    adState.doubleIncomeExpiresAt = Date.now() + 2 * 60 * 60 * 1000; // 2 hours
  }

  return { granted: true, reward: type };
}

/** Check if 2x idle income boost is active */
export function isDoubleIncomeActive(): boolean {
  return Date.now() < adState.doubleIncomeExpiresAt;
}

/** Get the idle income multiplier (1x or 2x) */
export function getIncomeMultiplier(): number {
  return isDoubleIncomeActive() ? 2 : 1;
}
