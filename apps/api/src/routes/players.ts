import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { db, schema } from "../db/index.js";
import { calculateIdleIncome } from "@merge-kingdom/shared";
import { deviceAuth } from "../middleware/device-auth.js";

const IDLE_MAX_OFFLINE_HOURS = 8;

const app = new Hono().use("/*", deviceAuth);

/** Register or login — returns existing player or creates new one */
app.post("/sync", async (c) => {
  const deviceId = c.get("deviceId");
  const body = await c.req.json<{ name?: string }>();

  // Try to find existing player
  const existing = await db
    .select()
    .from(schema.players)
    .where(eq(schema.players.deviceId, deviceId))
    .limit(1);

  if (existing.length > 0) {
    const player = existing[0];

    // Calculate idle income server-side
    const now = new Date();
    const idleIncome = await computeServerIdleIncome(
      player.id,
      player.lastCollectedAt,
      now
    );

    if (idleIncome > 0) {
      const updatedCoins = player.coins + idleIncome;
      const updatedTotal = player.totalCoinsEarned + idleIncome;
      await db
        .update(schema.players)
        .set({
          coins: updatedCoins,
          totalCoinsEarned: updatedTotal,
          lastCollectedAt: now,
          updatedAt: now,
        })
        .where(eq(schema.players.id, player.id));

      return c.json({
        player: { ...player, coins: updatedCoins, totalCoinsEarned: updatedTotal, lastCollectedAt: now },
        offlineEarnings: idleIncome,
        isNew: false,
      });
    }

    return c.json({ player, offlineEarnings: 0, isNew: false });
  }

  // Create new player
  const [newPlayer] = await db
    .insert(schema.players)
    .values({
      deviceId,
      name: body.name || "Ruler",
    })
    .returning();

  return c.json({ player: newPlayer, offlineEarnings: 0, isNew: true }, 201);
});

/** Get player state (full: player + buildings + collection + board) */
app.get("/state", async (c) => {
  const deviceId = c.get("deviceId");

  const [player] = await db
    .select()
    .from(schema.players)
    .where(eq(schema.players.deviceId, deviceId))
    .limit(1);

  if (!player) {
    return c.json({ error: "Player not found. Call POST /players/sync first." }, 404);
  }

  const [playerBuildings, collection, boardState] = await Promise.all([
    db.select().from(schema.buildings).where(eq(schema.buildings.playerId, player.id)),
    db.select().from(schema.collectionEntries).where(eq(schema.collectionEntries.playerId, player.id)),
    db.select().from(schema.boardStates).where(eq(schema.boardStates.playerId, player.id)).limit(1),
  ]);

  return c.json({
    player,
    buildings: playerBuildings,
    collection,
    board: boardState[0] || { items: [], updatedAt: null },
  });
});

/** Save full game state (called periodically by client) */
app.put("/state", async (c) => {
  const deviceId = c.get("deviceId");
  const body = await c.req.json<{
    coins: number;
    xp: number;
    level: number;
    gems: number;
    name: string;
    totalCoinsEarned: number;
    boardItems: unknown[];
    buildings: Array<{
      name: string;
      tier: number;
      income: number;
      zoneId: string;
      slotIndex: number;
    }>;
    discoveries: Array<{ chain: string; tier: number }>;
  }>();

  const [player] = await db
    .select()
    .from(schema.players)
    .where(eq(schema.players.deviceId, deviceId))
    .limit(1);

  if (!player) {
    return c.json({ error: "Player not found" }, 404);
  }

  const now = new Date();

  // Update player fields
  await db
    .update(schema.players)
    .set({
      coins: body.coins,
      xp: body.xp,
      level: body.level,
      gems: body.gems,
      name: body.name,
      totalCoinsEarned: body.totalCoinsEarned,
      lastCollectedAt: now,
      updatedAt: now,
    })
    .where(eq(schema.players.id, player.id));

  // Upsert board state
  await db
    .insert(schema.boardStates)
    .values({ playerId: player.id, items: body.boardItems, updatedAt: now })
    .onConflictDoUpdate({
      target: schema.boardStates.playerId,
      set: { items: body.boardItems, updatedAt: now },
    });

  // Sync buildings: delete all and re-insert (simpler than diffing)
  await db.delete(schema.buildings).where(eq(schema.buildings.playerId, player.id));
  if (body.buildings.length > 0) {
    await db.insert(schema.buildings).values(
      body.buildings.map((b) => ({
        playerId: player.id,
        name: b.name,
        tier: b.tier,
        income: b.income,
        zoneId: b.zoneId,
        slotIndex: b.slotIndex,
      }))
    );
  }

  // Insert new collection discoveries (ignore duplicates)
  for (const d of body.discoveries) {
    await db
      .insert(schema.collectionEntries)
      .values({ playerId: player.id, chain: d.chain, tier: d.tier })
      .onConflictDoNothing();
  }

  // Update leaderboard
  await db
    .insert(schema.leaderboard)
    .values({
      playerId: player.id,
      playerName: body.name,
      score: body.totalCoinsEarned,
      level: body.level,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: schema.leaderboard.playerId,
      set: {
        playerName: body.name,
        score: body.totalCoinsEarned,
        level: body.level,
        updatedAt: now,
      },
    });

  return c.json({ ok: true });
});

/** Server-authoritative idle income collection */
app.post("/collect-idle", async (c) => {
  const deviceId = c.get("deviceId");

  const [player] = await db
    .select()
    .from(schema.players)
    .where(eq(schema.players.deviceId, deviceId))
    .limit(1);

  if (!player) {
    return c.json({ error: "Player not found" }, 404);
  }

  const now = new Date();
  const earned = await computeServerIdleIncome(
    player.id,
    player.lastCollectedAt,
    now
  );

  if (earned <= 0) {
    return c.json({ earned: 0, coins: player.coins });
  }

  const newCoins = player.coins + earned;
  const newTotal = player.totalCoinsEarned + earned;

  await db
    .update(schema.players)
    .set({
      coins: newCoins,
      totalCoinsEarned: newTotal,
      lastCollectedAt: now,
      updatedAt: now,
    })
    .where(eq(schema.players.id, player.id));

  return c.json({ earned, coins: newCoins });
});

// --- Helpers ---

async function computeServerIdleIncome(
  playerId: string,
  lastCollectedAt: Date,
  now: Date
): Promise<number> {
  // Sum all building incomes for this player
  const playerBuildings = await db
    .select()
    .from(schema.buildings)
    .where(eq(schema.buildings.playerId, playerId));

  const incomePerSecond = playerBuildings.reduce((sum, b) => sum + b.income, 0);
  if (incomePerSecond <= 0) return 0;

  return calculateIdleIncome(
    incomePerSecond,
    lastCollectedAt.getTime(),
    now.getTime(),
    IDLE_MAX_OFFLINE_HOURS
  );
}

export default app;
