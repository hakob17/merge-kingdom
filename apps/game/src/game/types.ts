import type { ChainType, ZoneId } from "./constants";

export interface MergeItem {
  id: string;
  chain: ChainType;
  tier: number; // 0-4 index into the chain array
  row: number;
  col: number;
}

export interface BoardState {
  items: MergeItem[];
  coins: number;
  level: number;
}

export interface Building {
  id: string;
  name: string;
  tier: number;
  income: number;
  zoneId: ZoneId;
  slotIndex: number;
  builtAt: number; // timestamp
}

export interface KingdomZone {
  id: ZoneId;
  buildings: Building[];
  unlocked: boolean;
}

export interface KingdomState {
  zones: KingdomZone[];
  totalCoinsEarned: number;
  lastCollectedAt: number; // timestamp for idle calc
}

export interface CollectionEntry {
  chain: ChainType;
  tier: number;
  discovered: boolean;
  discoveredAt: number | null;
}

export interface PlayerProfile {
  id: string;
  name: string;
  level: number;
  xp: number;
  coins: number;
  gems: number;
  createdAt: number;
}

export interface GameState {
  board: BoardState;
  kingdom: KingdomState;
  player: PlayerProfile;
  collection: CollectionEntry[];
  idleIncomePerSecond: number;
}
