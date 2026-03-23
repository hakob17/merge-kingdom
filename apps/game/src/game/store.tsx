import React, { createContext, useContext, useReducer, useEffect, useRef, useCallback } from "react";
import { AppState, AppStateStatus } from "react-native";
import { calculateIdleIncome } from "@merge-kingdom/shared";
import {
  BUILDINGS,
  KINGDOM_ZONES,
  COLLECTION_ENTRIES,
  LEVEL_XP,
  MAX_LEVEL,
  IDLE_COLLECT_INTERVAL_MS,
  IDLE_MAX_OFFLINE_HOURS,
} from "./constants";
import type {
  GameState,
  BoardState,
  KingdomState,
  PlayerProfile,
  CollectionEntry,
  Building,
  MergeItem,
} from "./types";
import type { ChainType, ZoneId } from "./constants";

// --- Actions ---

type GameAction =
  | { type: "COLLECT_IDLE_INCOME" }
  | { type: "RETURN_FROM_OFFLINE"; offlineCoins: number }
  | { type: "ADD_COINS"; amount: number }
  | { type: "SPEND_COINS"; amount: number }
  | { type: "ADD_XP"; amount: number }
  | { type: "DISCOVER_ITEM"; chain: ChainType; tier: number }
  | { type: "PLACE_BUILDING"; name: string; tier: number; zoneId: ZoneId; slotIndex: number }
  | { type: "MERGE_ITEMS"; item1Id: string; item2Id: string; mergedItem: MergeItem }
  | { type: "SPAWN_ITEM"; item: MergeItem }
  | { type: "SET_BOARD_ITEMS"; items: MergeItem[] }
  | { type: "RESTORE_STATE"; state: GameState };

// --- Initial State ---

function createInitialCollection(): CollectionEntry[] {
  return COLLECTION_ENTRIES.map((e) => ({
    chain: e.chain,
    tier: e.tier,
    discovered: false,
    discoveredAt: null,
  }));
}

function createInitialKingdom(): KingdomState {
  return {
    zones: KINGDOM_ZONES.map((z) => ({
      id: z.id,
      buildings: [],
      unlocked: z.unlockLevel <= 1,
    })),
    totalCoinsEarned: 0,
    lastCollectedAt: Date.now(),
  };
}

function createInitialPlayer(): PlayerProfile {
  return {
    id: `player_${Date.now()}`,
    name: "Ruler",
    level: 1,
    xp: 0,
    coins: 50,
    gems: 0,
    createdAt: Date.now(),
  };
}

export function createInitialState(): GameState {
  return {
    board: { items: [], coins: 50, level: 1 },
    kingdom: createInitialKingdom(),
    player: createInitialPlayer(),
    collection: createInitialCollection(),
    idleIncomePerSecond: 0,
  };
}

// --- Helpers ---

function computeIdleIncomePerSecond(kingdom: KingdomState): number {
  return kingdom.zones.reduce(
    (sum, zone) => sum + zone.buildings.reduce((zs, b) => zs + b.income, 0),
    0
  );
}

function computeLevel(xp: number): number {
  for (let i = LEVEL_XP.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_XP[i]) return i + 1;
  }
  return 1;
}

function unlockZones(kingdom: KingdomState, level: number): KingdomState {
  const updated = kingdom.zones.map((z) => {
    const def = KINGDOM_ZONES.find((kz) => kz.id === z.id)!;
    return { ...z, unlocked: z.unlocked || level >= def.unlockLevel };
  });
  return { ...kingdom, zones: updated };
}

// --- Reducer ---

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "COLLECT_IDLE_INCOME": {
      const now = Date.now();
      const earned = calculateIdleIncome(
        state.idleIncomePerSecond,
        state.kingdom.lastCollectedAt,
        now,
        IDLE_MAX_OFFLINE_HOURS
      );
      if (earned <= 0) return state;
      return {
        ...state,
        board: { ...state.board, coins: state.board.coins + earned },
        player: { ...state.player, coins: state.player.coins + earned },
        kingdom: {
          ...state.kingdom,
          totalCoinsEarned: state.kingdom.totalCoinsEarned + earned,
          lastCollectedAt: now,
        },
      };
    }

    case "RETURN_FROM_OFFLINE": {
      const now = Date.now();
      return {
        ...state,
        board: { ...state.board, coins: state.board.coins + action.offlineCoins },
        player: { ...state.player, coins: state.player.coins + action.offlineCoins },
        kingdom: {
          ...state.kingdom,
          totalCoinsEarned: state.kingdom.totalCoinsEarned + action.offlineCoins,
          lastCollectedAt: now,
        },
      };
    }

    case "ADD_COINS":
      return {
        ...state,
        board: { ...state.board, coins: state.board.coins + action.amount },
        player: { ...state.player, coins: state.player.coins + action.amount },
        kingdom: {
          ...state.kingdom,
          totalCoinsEarned: state.kingdom.totalCoinsEarned + action.amount,
        },
      };

    case "SPEND_COINS":
      return {
        ...state,
        board: { ...state.board, coins: Math.max(0, state.board.coins - action.amount) },
        player: { ...state.player, coins: Math.max(0, state.player.coins - action.amount) },
      };

    case "ADD_XP": {
      const newXp = state.player.xp + action.amount;
      const newLevel = computeLevel(newXp);
      const updatedKingdom = unlockZones(state.kingdom, newLevel);
      return {
        ...state,
        player: { ...state.player, xp: newXp, level: newLevel },
        board: { ...state.board, level: newLevel },
        kingdom: updatedKingdom,
      };
    }

    case "DISCOVER_ITEM": {
      const idx = state.collection.findIndex(
        (c) => c.chain === action.chain && c.tier === action.tier
      );
      if (idx === -1 || state.collection[idx].discovered) return state;
      const updated = [...state.collection];
      updated[idx] = { ...updated[idx], discovered: true, discoveredAt: Date.now() };
      return { ...state, collection: updated };
    }

    case "PLACE_BUILDING": {
      const buildingDef = BUILDINGS[action.tier];
      if (!buildingDef) return state;
      const newBuilding: Building = {
        id: `building_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        name: action.name,
        tier: action.tier,
        income: buildingDef.income,
        zoneId: action.zoneId,
        slotIndex: action.slotIndex,
        builtAt: Date.now(),
      };
      const zones = state.kingdom.zones.map((z) =>
        z.id === action.zoneId ? { ...z, buildings: [...z.buildings, newBuilding] } : z
      );
      const newKingdom = { ...state.kingdom, zones };
      return {
        ...state,
        kingdom: newKingdom,
        idleIncomePerSecond: computeIdleIncomePerSecond(newKingdom),
      };
    }

    case "MERGE_ITEMS": {
      const { item1Id, item2Id, mergedItem } = action;
      const items = state.board.items.filter(
        (i) => i.id !== item1Id && i.id !== item2Id
      );
      items.push(mergedItem);
      const bonusCoins = Math.pow(2, mergedItem.tier);
      const xpGain = mergedItem.tier * 5 + 5;
      const newXp = state.player.xp + xpGain;
      const newLevel = computeLevel(newXp);
      const updatedKingdom = unlockZones(state.kingdom, newLevel);
      // Discover the new item
      const collection = [...state.collection];
      const colIdx = collection.findIndex(
        (c) => c.chain === mergedItem.chain && c.tier === mergedItem.tier
      );
      if (colIdx !== -1 && !collection[colIdx].discovered) {
        collection[colIdx] = { ...collection[colIdx], discovered: true, discoveredAt: Date.now() };
      }
      return {
        ...state,
        board: { ...state.board, items, coins: state.board.coins + bonusCoins, level: newLevel },
        player: { ...state.player, coins: state.player.coins + bonusCoins, xp: newXp, level: newLevel },
        kingdom: {
          ...updatedKingdom,
          totalCoinsEarned: state.kingdom.totalCoinsEarned + bonusCoins,
        },
        collection,
      };
    }

    case "SPAWN_ITEM":
      return {
        ...state,
        board: { ...state.board, items: [...state.board.items, action.item] },
      };

    case "SET_BOARD_ITEMS":
      return {
        ...state,
        board: { ...state.board, items: action.items },
      };

    case "RESTORE_STATE":
      return {
        ...action.state,
        idleIncomePerSecond: computeIdleIncomePerSecond(action.state.kingdom),
      };

    default:
      return state;
  }
}

// --- Context ---

interface GameContextValue {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  offlineEarnings: number | null;
  dismissOfflineEarnings: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be inside GameProvider");
  return ctx;
}

// --- Provider ---

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialState);
  const [offlineEarnings, setOfflineEarnings] = React.useState<number | null>(null);
  const lastActiveRef = useRef(Date.now());

  // Idle income tick while app is in foreground
  useEffect(() => {
    if (state.idleIncomePerSecond <= 0) return;
    const interval = setInterval(() => {
      dispatch({ type: "COLLECT_IDLE_INCOME" });
    }, IDLE_COLLECT_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [state.idleIncomePerSecond]);

  // Detect app returning from background → offline earnings popup
  useEffect(() => {
    const handler = (nextState: AppStateStatus) => {
      if (nextState === "active") {
        const now = Date.now();
        const earned = calculateIdleIncome(
          state.idleIncomePerSecond,
          lastActiveRef.current,
          now,
          IDLE_MAX_OFFLINE_HOURS
        );
        if (earned > 0) {
          setOfflineEarnings(earned);
          dispatch({ type: "RETURN_FROM_OFFLINE", offlineCoins: earned });
        }
      } else if (nextState === "background" || nextState === "inactive") {
        lastActiveRef.current = Date.now();
      }
    };
    const sub = AppState.addEventListener("change", handler);
    return () => sub.remove();
  }, [state.idleIncomePerSecond]);

  const dismissOfflineEarnings = useCallback(() => setOfflineEarnings(null), []);

  return (
    <GameContext.Provider value={{ state, dispatch, offlineEarnings, dismissOfflineEarnings }}>
      {children}
    </GameContext.Provider>
  );
}
