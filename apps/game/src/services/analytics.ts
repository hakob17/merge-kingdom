/**
 * Analytics + A/B testing framework for post-launch tuning.
 *
 * In production, integrate with:
 * - expo-analytics / Firebase Analytics for event tracking
 * - PostHog or Statsig for A/B testing
 */

export type AnalyticsEvent =
  | { name: "game_start" }
  | { name: "tutorial_complete"; durationMs: number }
  | { name: "merge"; chain: string; tier: number }
  | { name: "building_placed"; buildingName: string; zoneId: string }
  | { name: "zone_unlocked"; zoneId: string }
  | { name: "collection_discovered"; chain: string; tier: number }
  | { name: "idle_collected"; coins: number; offlineHours: number }
  | { name: "iap_initiated"; productId: string }
  | { name: "iap_completed"; productId: string; revenue: number }
  | { name: "ad_shown"; adType: "interstitial" | "rewarded" }
  | { name: "ad_reward_claimed"; rewardType: string }
  | { name: "battle_pass_tier_claimed"; tier: number; isPremium: boolean }
  | { name: "raid_attempted"; targetLevel: number }
  | { name: "raid_success"; loot: number }
  | { name: "share"; type: string }
  | { name: "session_start" }
  | { name: "session_end"; durationMs: number };

const eventQueue: Array<AnalyticsEvent & { timestamp: number }> = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;

/** Track an analytics event */
export function track(event: AnalyticsEvent) {
  const entry = { ...event, timestamp: Date.now() };
  eventQueue.push(entry);

  // In production: send to Firebase/PostHog
  console.log(`[Analytics] ${event.name}`, event);

  // Batch flush every 10 seconds
  if (!flushTimer) {
    flushTimer = setTimeout(flushEvents, 10_000);
  }
}

/** Flush queued events to the analytics backend */
async function flushEvents() {
  flushTimer = null;
  if (eventQueue.length === 0) return;

  const batch = eventQueue.splice(0);
  // In production:
  // await fetch(ANALYTICS_ENDPOINT, {
  //   method: 'POST',
  //   body: JSON.stringify({ events: batch }),
  // });
  console.log(`[Analytics] Flushed ${batch.length} events`);
}

// --- A/B Testing ---

export interface Experiment {
  key: string;
  variants: string[];
  defaultVariant: string;
}

const activeExperiments: Map<string, string> = new Map();

/** Get the variant for an experiment. Returns default if not assigned. */
export function getVariant(experimentKey: string): string {
  return activeExperiments.get(experimentKey) ?? "control";
}

/** Assign variants (called once at session start, from server config) */
export function setExperiments(assignments: Record<string, string>) {
  for (const [key, variant] of Object.entries(assignments)) {
    activeExperiments.set(key, variant);
  }
}

/** Pre-defined experiments for launch tuning */
export const EXPERIMENTS = {
  /** Idle rate multiplier: control (1x) vs generous (1.5x) */
  IDLE_RATE: "idle_rate_v1",
  /** Starter pack trigger: level 5 vs level 3 */
  STARTER_PACK_LEVEL: "starter_pack_level_v1",
  /** Interstitial frequency: 3min vs 5min */
  AD_FREQUENCY: "ad_frequency_v1",
} as const;
