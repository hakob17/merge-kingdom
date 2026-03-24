/**
 * Simple migration script — creates tables if they don't exist.
 * For production, use drizzle-kit push or generate migrations.
 */
import pg from "pg";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const client = new pg.Client({ connectionString: DATABASE_URL });

const migration = `
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL DEFAULT 'Ruler',
  level INTEGER NOT NULL DEFAULT 1,
  xp INTEGER NOT NULL DEFAULT 0,
  coins INTEGER NOT NULL DEFAULT 50,
  gems INTEGER NOT NULL DEFAULT 0,
  last_collected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  total_coins_earned BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS buildings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  tier INTEGER NOT NULL,
  income INTEGER NOT NULL,
  zone_id TEXT NOT NULL,
  slot_index INTEGER NOT NULL,
  built_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS buildings_player_idx ON buildings(player_id);

CREATE TABLE IF NOT EXISTS collection_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  chain TEXT NOT NULL,
  tier INTEGER NOT NULL,
  discovered_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS collection_player_chain_tier_idx
  ON collection_entries(player_id, chain, tier);

CREATE TABLE IF NOT EXISTS board_states (
  player_id UUID PRIMARY KEY REFERENCES players(id) ON DELETE CASCADE,
  items JSONB NOT NULL DEFAULT '[]',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL UNIQUE REFERENCES players(id) ON DELETE CASCADE,
  player_name TEXT NOT NULL,
  score BIGINT NOT NULL,
  level INTEGER NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS leaderboard_score_idx ON leaderboard(score);
`;

async function main() {
  await client.connect();
  console.log("Running migrations...");
  await client.query(migration);
  console.log("Migrations complete.");
  await client.end();
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
