import { Hono } from "hono";
import { desc } from "drizzle-orm";
import { db, schema } from "../db/index.js";

const app = new Hono();

/** Get top players by total coins earned */
app.get("/", async (c) => {
  const limit = Math.min(Number(c.req.query("limit") || 50), 100);
  const offset = Math.max(Number(c.req.query("offset") || 0), 0);

  const rows = await db
    .select()
    .from(schema.leaderboard)
    .orderBy(desc(schema.leaderboard.score))
    .limit(limit)
    .offset(offset);

  return c.json({
    entries: rows.map((r, i) => ({
      rank: offset + i + 1,
      playerId: r.playerId,
      playerName: r.playerName,
      score: r.score,
      level: r.level,
    })),
  });
});

export default app;
