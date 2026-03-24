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

app.get("/health", (c) => c.json({ status: "ok", version: "0.1.0" }));

app.route("/players", players);
app.route("/leaderboard", leaderboard);
app.route("/events", events);
app.route("/raids", raids);

const port = Number(process.env.PORT || 3001);

console.log(`Merge Kingdom API starting on port ${port}`);
serve({ fetch: app.fetch, port });
