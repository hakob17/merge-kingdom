import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import players from "./routes/players.js";
import leaderboard from "./routes/leaderboard.js";
import events from "./routes/events.js";
import raids from "./routes/raids.js";

const app = new Hono();

app.use("/*", logger());
app.use("/*", cors());

app.get("/health", (c) =>
  c.json({
    status: "ok",
    version: "0.1.0",
    database: process.env.DATABASE_URL ? "connected" : "not configured",
  })
);

if (process.env.DATABASE_URL) {
  app.route("/players", players);
  app.route("/leaderboard", leaderboard);
  app.route("/events", events);
  app.route("/raids", raids);
} else {
  console.warn("DATABASE_URL not set — API routes disabled, only /health available");
}

const port = Number(process.env.PORT || 3001);

console.log(`Merge Kingdom API starting on port ${port}`);
serve({ fetch: app.fetch, port });
