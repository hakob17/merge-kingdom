import { Hono } from "hono";
import { eq, ne, desc, sql } from "drizzle-orm";
import { db, schema } from "../db/index.js";
import { deviceAuth } from "../middleware/device-auth.js";

const app = new Hono().use("/*", deviceAuth);

const RAID_COOLDOWN_MS = 4 * 60 * 60 * 1000; // 4 hours between raids
const RAID_LOOT_MULTIPLIER = 0.1; // steal 10% of target's hourly income

/** Get available raid targets (random players, not self) */
app.get("/targets", async (c) => {
  const deviceId = c.get("deviceId");

  const [player] = await db
    .select()
    .from(schema.players)
    .where(eq(schema.players.deviceId, deviceId))
    .limit(1);

  if (!player) return c.json({ error: "Player not found" }, 404);

  // Get random opponents who have buildings
  const targets = await db
    .select({
      id: schema.players.id,
      name: schema.players.name,
      level: schema.players.level,
      buildingCount: sql<number>`(SELECT COUNT(*) FROM buildings WHERE player_id = ${schema.players.id})`,
    })
    .from(schema.players)
    .where(ne(schema.players.id, player.id))
    .orderBy(sql`RANDOM()`)
    .limit(5);

  return c.json({
    targets: targets.map((t) => ({
      playerId: t.id,
      name: t.name,
      level: t.level,
      buildingCount: t.buildingCount,
    })),
    cooldownMs: RAID_COOLDOWN_MS,
  });
});

/** Execute a raid against another player */
app.post("/attack", async (c) => {
  const deviceId = c.get("deviceId");
  const body = await c.req.json<{ targetPlayerId: string }>();

  const [player] = await db
    .select()
    .from(schema.players)
    .where(eq(schema.players.deviceId, deviceId))
    .limit(1);

  if (!player) return c.json({ error: "Player not found" }, 404);

  // Get target's buildings to calculate loot
  const targetBuildings = await db
    .select()
    .from(schema.buildings)
    .where(eq(schema.buildings.playerId, body.targetPlayerId));

  if (targetBuildings.length === 0) {
    return c.json({ error: "Target has no buildings to raid" }, 400);
  }

  const targetIncomePerHour =
    targetBuildings.reduce((sum, b) => sum + b.income, 0) * 3600;
  const loot = Math.floor(targetIncomePerHour * RAID_LOOT_MULTIPLIER);

  // Random success chance based on level difference
  const [target] = await db
    .select()
    .from(schema.players)
    .where(eq(schema.players.id, body.targetPlayerId))
    .limit(1);

  if (!target) return c.json({ error: "Target not found" }, 404);

  const levelDiff = player.level - target.level;
  const baseChance = 0.6;
  const successChance = Math.min(0.95, Math.max(0.2, baseChance + levelDiff * 0.05));
  const success = Math.random() < successChance;

  if (success) {
    // Grant loot to raider
    const now = new Date();
    await db
      .update(schema.players)
      .set({
        coins: player.coins + loot,
        totalCoinsEarned: player.totalCoinsEarned + loot,
        updatedAt: now,
      })
      .where(eq(schema.players.id, player.id));

    return c.json({
      success: true,
      loot,
      targetName: target.name,
      message: `Raided ${target.name}'s kingdom for ${loot} coins!`,
    });
  }

  return c.json({
    success: false,
    loot: 0,
    targetName: target.name,
    message: `Raid on ${target.name}'s kingdom failed! Their defenses held.`,
  });
});

export default app;
