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
