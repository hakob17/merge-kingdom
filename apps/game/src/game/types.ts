import type { ChainType } from "./constants";

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
  builtAt: number; // timestamp
}

export interface KingdomState {
  buildings: Building[];
  totalCoinsEarned: number;
  lastCollectedAt: number; // timestamp for idle calc
}
