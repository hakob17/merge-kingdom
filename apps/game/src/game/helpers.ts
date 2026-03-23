import { BOARD_SIZE, CELL_SIZE, CELL_GAP, MERGE_CHAINS } from "./constants";
import type { ChainType } from "./constants";
import type { MergeItem } from "./types";

/** Convert grid (row, col) to pixel position on canvas */
export function cellToPixel(row: number, col: number) {
  return {
    x: CELL_GAP + col * (CELL_SIZE + CELL_GAP),
    y: CELL_GAP + row * (CELL_SIZE + CELL_GAP),
  };
}

/** Convert pixel position to grid (row, col). Returns null if out of bounds. */
export function pixelToCell(px: number, py: number): { row: number; col: number } | null {
  const col = Math.floor((px - CELL_GAP) / (CELL_SIZE + CELL_GAP));
  const row = Math.floor((py - CELL_GAP) / (CELL_SIZE + CELL_GAP));
  if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) return null;
  // Check if we're actually inside the cell (not in the gap)
  const cellX = CELL_GAP + col * (CELL_SIZE + CELL_GAP);
  const cellY = CELL_GAP + row * (CELL_SIZE + CELL_GAP);
  if (px < cellX || px > cellX + CELL_SIZE || py < cellY || py > cellY + CELL_SIZE) return null;
  return { row, col };
}

/** Get item at a specific cell */
export function getItemAt(items: MergeItem[], row: number, col: number): MergeItem | undefined {
  return items.find((i) => i.row === row && i.col === col);
}

/** Check if two items can merge */
export function canMerge(a: MergeItem, b: MergeItem): boolean {
  if (a.id === b.id) return false;
  if (a.chain !== b.chain) return false;
  if (a.tier !== b.tier) return false;
  const maxTier = MERGE_CHAINS[a.chain].length - 1;
  return a.tier < maxTier;
}

/** Find adjacent items that match a given item (for cascade detection) */
export function findAdjacentMatches(items: MergeItem[], target: MergeItem): MergeItem[] {
  const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  return dirs
    .map(([dr, dc]) => getItemAt(items, target.row + dr, target.col + dc))
    .filter((item): item is MergeItem =>
      item !== undefined && item.chain === target.chain && item.tier === target.tier && item.id !== target.id
    );
}

/** Generate a unique item ID */
export function generateItemId(): string {
  return `item_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Get random chain type */
export function randomChain(): ChainType {
  const chains: ChainType[] = ["wood", "stone", "metal"];
  return chains[Math.floor(Math.random() * chains.length)];
}

/** Board pixel dimensions */
export const BOARD_PX = BOARD_SIZE * (CELL_SIZE + CELL_GAP) + CELL_GAP;
