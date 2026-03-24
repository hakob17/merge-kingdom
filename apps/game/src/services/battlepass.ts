/**
 * Battle Pass framework — 30-day seasons with free + premium reward tracks.
 */

export interface BattlePassReward {
  tier: number;
  free: RewardItem;
  premium: RewardItem;
}

export interface RewardItem {
  type: "coins" | "gems" | "cosmetic" | "boost" | "materials";
  amount?: number;
  id?: string;
  name: string;
}

export interface BattlePassSeason {
  id: string;
  name: string;
  startDate: number;
  endDate: number;
  tiers: BattlePassReward[];
  xpPerTier: number;
}

export interface PlayerBattlePassState {
  seasonId: string;
  currentTier: number;
  currentXp: number;
  isPremium: boolean;
  claimedFreeTiers: number[];
  claimedPremiumTiers: number[];
}

/** Generate a season with 30 tiers of rewards */
export function generateSeason(
  seasonNumber: number,
  startDate: number
): BattlePassSeason {
  const endDate = startDate + 30 * 24 * 60 * 60 * 1000;
  const tiers: BattlePassReward[] = Array.from({ length: 30 }, (_, i) => ({
    tier: i + 1,
    free: generateFreeReward(i + 1),
    premium: generatePremiumReward(i + 1),
  }));

  return {
    id: `season_${seasonNumber}`,
    name: `Season ${seasonNumber}`,
    startDate,
    endDate,
    tiers,
    xpPerTier: 100 + seasonNumber * 10,
  };
}

function generateFreeReward(tier: number): RewardItem {
  if (tier % 10 === 0) {
    return { type: "gems", amount: 20 * (tier / 10), name: `${20 * (tier / 10)} Gems` };
  }
  if (tier % 5 === 0) {
    return { type: "boost", id: "double_income_1h", name: "1h Double Income" };
  }
  return { type: "coins", amount: tier * 100, name: `${tier * 100} Coins` };
}

function generatePremiumReward(tier: number): RewardItem {
  if (tier === 30) {
    return { type: "cosmetic", id: `skin_season_exclusive`, name: "Exclusive Kingdom Skin" };
  }
  if (tier % 10 === 0) {
    return { type: "gems", amount: 50 * (tier / 10), name: `${50 * (tier / 10)} Gems` };
  }
  if (tier % 5 === 0) {
    return { type: "cosmetic", id: `frame_tier_${tier}`, name: `Tier ${tier} Frame` };
  }
  if (tier % 3 === 0) {
    return { type: "materials", amount: tier, name: `${tier} Rare Materials` };
  }
  return { type: "coins", amount: tier * 250, name: `${tier * 250} Coins` };
}

/** Advance XP and calculate tier-ups */
export function addBattlePassXp(
  state: PlayerBattlePassState,
  xp: number,
  xpPerTier: number
): { state: PlayerBattlePassState; tiersGained: number } {
  let newXp = state.currentXp + xp;
  let tiersGained = 0;
  let newTier = state.currentTier;

  while (newXp >= xpPerTier && newTier < 30) {
    newXp -= xpPerTier;
    newTier++;
    tiersGained++;
  }

  return {
    state: { ...state, currentXp: newXp, currentTier: newTier },
    tiersGained,
  };
}

/** Check if a reward can be claimed */
export function canClaimReward(
  state: PlayerBattlePassState,
  tier: number,
  isPremiumTrack: boolean
): boolean {
  if (tier > state.currentTier) return false;
  if (isPremiumTrack && !state.isPremium) return false;
  const claimed = isPremiumTrack ? state.claimedPremiumTiers : state.claimedFreeTiers;
  return !claimed.includes(tier);
}

export function claimReward(
  state: PlayerBattlePassState,
  tier: number,
  isPremiumTrack: boolean
): PlayerBattlePassState {
  if (!canClaimReward(state, tier, isPremiumTrack)) return state;

  if (isPremiumTrack) {
    return { ...state, claimedPremiumTiers: [...state.claimedPremiumTiers, tier] };
  }
  return { ...state, claimedFreeTiers: [...state.claimedFreeTiers, tier] };
}

export function createInitialBattlePassState(seasonId: string): PlayerBattlePassState {
  return {
    seasonId,
    currentTier: 0,
    currentXp: 0,
    isPremium: false,
    claimedFreeTiers: [],
    claimedPremiumTiers: [],
  };
}
