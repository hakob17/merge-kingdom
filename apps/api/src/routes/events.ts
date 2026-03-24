import { Hono } from "hono";
import { desc, eq, and, gte, lte } from "drizzle-orm";
import { db, schema } from "../db/index.js";
import { deviceAuth } from "../middleware/device-auth.js";

const app = new Hono();

/**
 * Weekly Race events — merge-speed leaderboard.
 * A new race starts every Monday 00:00 UTC and ends Sunday 23:59 UTC.
 */

function getCurrentRaceWindow(): { start: Date; end: Date; raceId: string } {
  const now = new Date();
  const day = now.getUTCDay(); // 0 = Sunday
  const diff = day === 0 ? 6 : day - 1; // days since Monday
  const start = new Date(now);
  start.setUTCDate(now.getUTCDate() - diff);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 6);
  end.setUTCHours(23, 59, 59, 999);
  const raceId = `race_${start.toISOString().slice(0, 10)}`;
  return { start, end, raceId };
}

/** Get current race info and leaderboard */
app.get("/race", async (c) => {
  const { start, end, raceId } = getCurrentRaceWindow();

  const entries = await db
    .select()
    .from(schema.leaderboard)
    .where(gte(schema.leaderboard.updatedAt, start))
    .orderBy(desc(schema.leaderboard.score))
    .limit(50);

  const now = new Date();
  const totalMs = end.getTime() - start.getTime();
  const elapsedMs = now.getTime() - start.getTime();

  return c.json({
    raceId,
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    progressPercent: Math.min(100, Math.round((elapsedMs / totalMs) * 100)),
    leaderboard: entries.map((e, i) => ({
      rank: i + 1,
      playerId: e.playerId,
      playerName: e.playerName,
      score: e.score,
      level: e.level,
    })),
  });
});

/** Submit race score (called when player merges — tracked by merge count this week) */
app.post("/race/score", deviceAuth, async (c) => {
  const deviceId = c.get("deviceId");
  const body = await c.req.json<{ mergeCount: number }>();

  const [player] = await db
    .select()
    .from(schema.players)
    .where(eq(schema.players.deviceId, deviceId))
    .limit(1);

  if (!player) {
    return c.json({ error: "Player not found" }, 404);
  }

  // Update leaderboard with merge count as score for the race
  const now = new Date();
  await db
    .insert(schema.leaderboard)
    .values({
      playerId: player.id,
      playerName: player.name,
      score: body.mergeCount,
      level: player.level,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: schema.leaderboard.playerId,
      set: {
        score: body.mergeCount,
        level: player.level,
        updatedAt: now,
      },
    });

  return c.json({ ok: true });
});

export default app;
