import React, { useCallback, useRef, useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import {
  Canvas,
  RoundedRect,
  Fill,
  Group,
  Circle,
} from "@shopify/react-native-skia";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import {
  BOARD_SIZE,
  CELL_SIZE,
  CELL_GAP,
  MERGE_CHAINS,
  CHAIN_COLORS,
  BUILDINGS,
} from "../constants";
import type { MergeItem } from "../types";
import { useGame } from "../store";
import {
  cellToPixel,
  pixelToCell,
  getItemAt,
  canMerge,
  findAdjacentMatches,
  generateItemId,
  randomChain,
  BOARD_PX,
} from "../helpers";
import ParticleEffect from "./ParticleEffect";

interface MergeAnimation {
  id: string;
  x: number;
  y: number;
  color: string;
}

export default function MergeBoard() {
  const { state, dispatch } = useGame();
  const { items } = state.board;

  // Keep a ref to always have fresh items for cascade checks
  const itemsRef = useRef(items);
  itemsRef.current = items;

  // Drag state
  const dragOffsetX = useSharedValue(0);
  const dragOffsetY = useSharedValue(0);
  const isDragging = useSharedValue(false);
  const [dragItemId, setDragItemId] = useState<string | null>(null);
  const dragStartRef = useRef<{ itemId: string; startRow: number; startCol: number } | null>(null);

  // Animations
  const [particles, setParticles] = useState<MergeAnimation[]>([]);
  const [popItemIds, setPopItemIds] = useState<Set<string>>(new Set());

  const removeParticle = useCallback((id: string) => {
    setParticles((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const addParticleBurst = useCallback((row: number, col: number, color: string) => {
    const pos = cellToPixel(row, col);
    const pid = `p_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    setParticles((prev) => [
      ...prev,
      { id: pid, x: pos.x + CELL_SIZE / 2, y: pos.y + CELL_SIZE / 2, color },
    ]);
  }, []);

  const addPopEffect = useCallback((itemId: string) => {
    setPopItemIds((prev) => new Set(prev).add(itemId));
    setTimeout(() => {
      setPopItemIds((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }, 300);
  }, []);

  // --- Merge execution ---
  const executeMerge = useCallback(
    (draggedItem: MergeItem, targetItem: MergeItem, depth: number) => {
      const newTier = draggedItem.tier + 1;
      const mergedItem: MergeItem = {
        id: generateItemId(),
        chain: draggedItem.chain,
        tier: newTier,
        row: targetItem.row,
        col: targetItem.col,
      };

      dispatch({
        type: "MERGE_ITEMS",
        item1Id: draggedItem.id,
        item2Id: targetItem.id,
        mergedItem,
      });

      const color = CHAIN_COLORS[draggedItem.chain][newTier] ?? "#ffffff";
      addParticleBurst(targetItem.row, targetItem.col, color);
      addPopEffect(mergedItem.id);

      // Haptic intensity scales with cascade depth
      if (depth === 0) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }

      // Auto-place building if max tier reached
      const maxTier = MERGE_CHAINS[mergedItem.chain].length - 1;
      if (mergedItem.tier === maxTier) {
        setTimeout(() => {
          const currentItems = itemsRef.current;
          const villageZone = state.kingdom.zones.find((z) => z.id === "village");
          if (!villageZone?.unlocked) return;
          const usedSlots = new Set(villageZone.buildings.map((b) => b.slotIndex));
          for (let i = 0; i < 5; i++) {
            if (!usedSlots.has(i)) {
              const buildingDef = BUILDINGS[mergedItem.tier];
              if (buildingDef) {
                dispatch({
                  type: "PLACE_BUILDING",
                  name: buildingDef.name,
                  tier: mergedItem.tier,
                  zoneId: "village",
                  slotIndex: i,
                });
                dispatch({
                  type: "SET_BOARD_ITEMS",
                  items: currentItems.filter((it) => it.id !== mergedItem.id),
                });
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }
              break;
            }
          }
        }, 100);
      }

      // Check for cascades after state settles
      if (depth < 5) {
        setTimeout(() => {
          const currentItems = itemsRef.current;
          const freshItem = currentItems.find((i) => i.id === mergedItem.id);
          if (!freshItem) return;
          const adjacent = findAdjacentMatches(currentItems, freshItem);
          if (adjacent.length > 0) {
            executeMerge(freshItem, adjacent[0], depth + 1);
          }
        }, 250);
      }
    },
    [dispatch, addParticleBurst, addPopEffect, state.kingdom.zones]
  );

  // --- Tap to spawn ---
  const handleTap = useCallback(
    (x: number, y: number) => {
      const cell = pixelToCell(x, y);
      if (!cell) return;
      if (getItemAt(items, cell.row, cell.col)) return;

      const newItem: MergeItem = {
        id: generateItemId(),
        chain: randomChain(),
        tier: 0,
        row: cell.row,
        col: cell.col,
      };

      dispatch({ type: "SPAWN_ITEM", item: newItem });
      dispatch({ type: "DISCOVER_ITEM", chain: newItem.chain, tier: 0 });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      addPopEffect(newItem.id);
    },
    [items, dispatch, addPopEffect]
  );

  // --- Drag handlers (called from UI thread via runOnJS) ---
  const onDragStart = useCallback(
    (x: number, y: number) => {
      const cell = pixelToCell(x, y);
      if (!cell) return;
      const item = getItemAt(items, cell.row, cell.col);
      if (!item) return;

      dragStartRef.current = { itemId: item.id, startRow: cell.row, startCol: cell.col };
      setDragItemId(item.id);
    },
    [items]
  );

  const onDragEnd = useCallback(
    (x: number, y: number) => {
      const ds = dragStartRef.current;
      if (!ds) return;

      const targetCell = pixelToCell(x, y);
      const draggedItem = items.find((i) => i.id === ds.itemId);

      if (targetCell && draggedItem) {
        const targetItem = getItemAt(items, targetCell.row, targetCell.col);

        if (targetItem && canMerge(draggedItem, targetItem)) {
          executeMerge(draggedItem, targetItem, 0);
        } else if (!targetItem && (targetCell.row !== ds.startRow || targetCell.col !== ds.startCol)) {
          const updatedItems = items.map((i) =>
            i.id === ds.itemId ? { ...i, row: targetCell.row, col: targetCell.col } : i
          );
          dispatch({ type: "SET_BOARD_ITEMS", items: updatedItems });
          Haptics.selectionAsync();
        }
      }

      dragStartRef.current = null;
      setDragItemId(null);
    },
    [items, executeMerge, dispatch]
  );

  // --- Gestures ---
  const panGesture = Gesture.Pan()
    .minDistance(5)
    .onStart((e) => {
      runOnJS(onDragStart)(e.x, e.y);
    })
    .onUpdate((e) => {
      dragOffsetX.value = e.translationX;
      dragOffsetY.value = e.translationY;
    })
    .onEnd((e) => {
      isDragging.value = false;
      dragOffsetX.value = withSpring(0, { damping: 15, stiffness: 200 });
      dragOffsetY.value = withSpring(0, { damping: 15, stiffness: 200 });
      runOnJS(onDragEnd)(e.x, e.y);
    })
    .onBegin(() => {
      isDragging.value = true;
    });

  const tapGesture = Gesture.Tap().onEnd((e) => {
    runOnJS(handleTap)(e.x, e.y);
  });

  const composedGesture = Gesture.Race(panGesture, tapGesture);

  // Find drag item for overlay
  const dragItem = dragItemId ? items.find((i) => i.id === dragItemId) : null;

  return (
    <View style={styles.boardWrapper}>
      <GestureDetector gesture={composedGesture}>
        <Animated.View>
          <Canvas style={{ width: BOARD_PX, height: BOARD_PX }}>
            <Fill color="#16213e" />

            {/* Grid cells */}
            {Array.from({ length: BOARD_SIZE * BOARD_SIZE }).map((_, i) => {
              const row = Math.floor(i / BOARD_SIZE);
              const col = i % BOARD_SIZE;
              const pos = cellToPixel(row, col);
              return (
                <RoundedRect
                  key={`cell_${i}`}
                  x={pos.x}
                  y={pos.y}
                  width={CELL_SIZE}
                  height={CELL_SIZE}
                  r={8}
                  color="#0f3460"
                />
              );
            })}

            {/* Items */}
            {items.map((item) => {
              const pos = cellToPixel(item.row, item.col);
              const color = CHAIN_COLORS[item.chain][item.tier];
              const isPopping = popItemIds.has(item.id);
              const isDragTarget = item.id === dragItemId;

              return (
                <Group key={item.id} opacity={isDragTarget ? 0.4 : 1}>
                  {/* Item body */}
                  <RoundedRect
                    x={pos.x + 4}
                    y={pos.y + 4}
                    width={CELL_SIZE - 8}
                    height={CELL_SIZE - 8}
                    r={10}
                    color={color}
                  />
                  {/* Glossy highlight */}
                  <RoundedRect
                    x={pos.x + 8}
                    y={pos.y + 8}
                    width={CELL_SIZE - 16}
                    height={(CELL_SIZE - 16) * 0.4}
                    r={6}
                    color="rgba(255,255,255,0.15)"
                  />
                  {/* Tier badge */}
                  <Circle
                    cx={pos.x + CELL_SIZE - 14}
                    cy={pos.y + 14}
                    r={9}
                    color="rgba(0,0,0,0.4)"
                  />
                  {/* Center icon circle */}
                  <Circle
                    cx={pos.x + CELL_SIZE / 2}
                    cy={pos.y + CELL_SIZE / 2 + 2}
                    r={12}
                    color="rgba(255,255,255,0.2)"
                  />
                </Group>
              );
            })}

            {/* Particle effects */}
            {particles.map((p) => (
              <ParticleEffect
                key={p.id}
                x={p.x}
                y={p.y}
                color={p.color}
                onComplete={() => removeParticle(p.id)}
              />
            ))}
          </Canvas>
        </Animated.View>
      </GestureDetector>

      {/* Drag overlay */}
      {dragItem && (
        <DragOverlay
          item={dragItem}
          offsetX={dragOffsetX}
          offsetY={dragOffsetY}
          isDragging={isDragging}
        />
      )}

      {/* Tier labels rendered as RN Text above canvas */}
      {items.map((item) => {
        const pos = cellToPixel(item.row, item.col);
        const tierName = MERGE_CHAINS[item.chain][item.tier];
        const isDragTarget = item.id === dragItemId;
        return (
          <View
            key={`label_${item.id}`}
            style={[
              styles.itemLabel,
              {
                left: pos.x,
                top: pos.y,
                width: CELL_SIZE,
                height: CELL_SIZE,
                opacity: isDragTarget ? 0.4 : 1,
              },
            ]}
            pointerEvents="none"
          >
            <Text style={styles.tierNumber}>{item.tier + 1}</Text>
            <Text style={styles.chainInitial}>
              {item.chain[0].toUpperCase()}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

function DragOverlay({
  item,
  offsetX,
  offsetY,
  isDragging,
}: {
  item: MergeItem;
  offsetX: Animated.SharedValue<number>;
  offsetY: Animated.SharedValue<number>;
  isDragging: Animated.SharedValue<boolean>;
}) {
  const pos = cellToPixel(item.row, item.col);
  const color = CHAIN_COLORS[item.chain][item.tier];

  const animStyle = useAnimatedStyle(() => ({
    opacity: isDragging.value ? 0.95 : 0,
    transform: [
      { translateX: pos.x + offsetX.value + 4 },
      { translateY: pos.y + offsetY.value + 4 - 12 },
      { scale: isDragging.value ? 1.15 : 1 },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.dragOverlay,
        { width: CELL_SIZE - 8, height: CELL_SIZE - 8, backgroundColor: color },
        animStyle,
      ]}
      pointerEvents="none"
    >
      <Text style={styles.dragTierText}>{item.tier + 1}</Text>
      <Text style={styles.dragChainText}>{item.chain[0].toUpperCase()}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  boardWrapper: {
    position: "relative",
    borderRadius: 16,
    overflow: "hidden",
  },
  itemLabel: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  tierNumber: {
    position: "absolute",
    top: 6,
    right: 8,
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
  },
  chainInitial: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 4,
  },
  dragOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  dragTierText: {
    position: "absolute",
    top: 4,
    right: 6,
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  dragChainText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 20,
  },
});
