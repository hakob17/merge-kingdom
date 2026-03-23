import {
  pgTable,
  uuid,
  text,
  integer,
  bigint,
  timestamp,
  boolean,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// --- Players ---

export const players = pgTable("players", {
  id: uuid("id").primaryKey().defaultRandom(),
  deviceId: text("device_id").notNull().unique(),
  name: text("name").notNull().default("Ruler"),
  level: integer("level").notNull().default(1),
  xp: integer("xp").notNull().default(0),
  coins: integer("coins").notNull().default(50),
  gems: integer("gems").notNull().default(0),
  lastCollectedAt: timestamp("last_collected_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  totalCoinsEarned: bigint("total_coins_earned", { mode: "number" })
    .notNull()
    .default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// --- Buildings ---

export const buildings = pgTable(
  "buildings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    playerId: uuid("player_id")
      .notNull()
      .references(() => players.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    tier: integer("tier").notNull(),
    income: integer("income").notNull(),
    zoneId: text("zone_id").notNull(), // village | town | city
    slotIndex: integer("slot_index").notNull(),
    builtAt: timestamp("built_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("buildings_player_idx").on(t.playerId)]
);

// --- Collection entries (discovered items) ---

export const collectionEntries = pgTable(
  "collection_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    playerId: uuid("player_id")
      .notNull()
      .references(() => players.id, { onDelete: "cascade" }),
    chain: text("chain").notNull(), // wood | stone | metal
    tier: integer("tier").notNull(),
    discoveredAt: timestamp("discovered_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("collection_player_chain_tier_idx").on(
      t.playerId,
      t.chain,
      t.tier
    ),
  ]
);

// --- Board state (serialized JSON for simplicity) ---

export const boardStates = pgTable("board_states", {
  playerId: uuid("player_id")
    .primaryKey()
    .references(() => players.id, { onDelete: "cascade" }),
  items: jsonb("items").notNull().default([]),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// --- Leaderboard snapshots ---

export const leaderboard = pgTable(
  "leaderboard",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    playerId: uuid("player_id")
      .notNull()
      .references(() => players.id, { onDelete: "cascade" }),
    playerName: text("player_name").notNull(),
    score: bigint("score", { mode: "number" }).notNull(), // totalCoinsEarned
    level: integer("level").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("leaderboard_player_idx").on(t.playerId),
    index("leaderboard_score_idx").on(t.score),
  ]
);
