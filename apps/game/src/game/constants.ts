/** Grid dimensions */
export const BOARD_SIZE = 5;

/** Size of each cell in pixels */
export const CELL_SIZE = 60;

/** Gap between cells in pixels */
export const CELL_GAP = 6;

/** Merge chain definitions — each array is a tier progression */
export const MERGE_CHAINS = {
  wood: ["Log", "Plank", "Beam", "Frame", "Cabin"],
  stone: ["Pebble", "Rock", "Boulder", "Block", "Wall"],
  metal: ["Ore", "Ingot", "Plate", "Gear", "Engine"],
} as const;

export type ChainType = keyof typeof MERGE_CHAINS;

/** Colors for each chain type */
export const CHAIN_COLORS: Record<ChainType, string[]> = {
  wood: ["#8B6914", "#A0782C", "#B8860B", "#CD950C", "#DAA520"],
  stone: ["#708090", "#808A98", "#8B8F96", "#969BA3", "#A9B0B8"],
  metal: ["#71797E", "#848B91", "#A8A9AD", "#C0C0C0", "#D4D4D4"],
};

/** Building types unlocked by merge tier */
export const BUILDINGS = [
  { name: "Hut", cost: 5, income: 1 },
  { name: "House", cost: 15, income: 3 },
  { name: "Workshop", cost: 40, income: 8 },
  { name: "Manor", cost: 100, income: 20 },
  { name: "Castle", cost: 300, income: 60 },
] as const;

/** Kingdom zones — unlocked by player level */
export const KINGDOM_ZONES = [
  {
    id: "village",
    name: "Village",
    unlockLevel: 1,
    buildingSlots: 5,
    description: "A humble beginning. Build your first structures here.",
  },
  {
    id: "town",
    name: "Town",
    unlockLevel: 5,
    buildingSlots: 8,
    description: "Expand into a bustling town with more building space.",
  },
  {
    id: "city",
    name: "City",
    unlockLevel: 12,
    buildingSlots: 12,
    description: "A grand city with room for your finest constructions.",
  },
] as const;

export type ZoneId = (typeof KINGDOM_ZONES)[number]["id"];

/** XP required per level (cumulative). Level N requires LEVEL_XP[N-1] total XP. */
export const LEVEL_XP = [
  0, 50, 150, 300, 500, 800, 1200, 1700, 2400, 3200, 4200, 5400, 6800, 8500,
  10500,
] as const;

export const MAX_LEVEL = LEVEL_XP.length;

/** Idle income settings */
export const IDLE_MAX_OFFLINE_HOURS = 8;
export const IDLE_COLLECT_INTERVAL_MS = 1000; // tick every second while app is open

/** Collection book: all discoverable items */
export const COLLECTION_ENTRIES = Object.entries(MERGE_CHAINS).flatMap(
  ([chain, tiers]) =>
    tiers.map((name, tier) => ({
      chain: chain as ChainType,
      tier,
      name,
    }))
);
