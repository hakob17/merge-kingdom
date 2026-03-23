const API_BASE = __DEV__
  ? "http://localhost:3001"
  : "https://api.mergekingdom.app"; // TODO: set production URL

let deviceId: string | null = null;

export function setDeviceId(id: string) {
  deviceId = id;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  if (!deviceId) throw new Error("Device ID not set. Call setDeviceId first.");

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-Device-Id": deviceId,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API ${res.status}: ${body}`);
  }

  return res.json();
}

/** Sync player (login/register) — returns player + offline earnings */
export function syncPlayer(name?: string) {
  return request<{
    player: {
      id: string;
      deviceId: string;
      name: string;
      level: number;
      xp: number;
      coins: number;
      gems: number;
      totalCoinsEarned: number;
      lastCollectedAt: string;
    };
    offlineEarnings: number;
    isNew: boolean;
  }>("/players/sync", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

/** Get full player state from server */
export function getPlayerState() {
  return request<{
    player: Record<string, unknown>;
    buildings: Array<{
      name: string;
      tier: number;
      income: number;
      zoneId: string;
      slotIndex: number;
    }>;
    collection: Array<{ chain: string; tier: number }>;
    board: { items: unknown[]; updatedAt: string | null };
  }>("/players/state");
}

/** Save full game state to server */
export function savePlayerState(data: {
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
}) {
  return request<{ ok: boolean }>("/players/state", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/** Collect idle income (server-authoritative) */
export function collectIdleIncome() {
  return request<{ earned: number; coins: number }>("/players/collect-idle", {
    method: "POST",
  });
}

/** Get leaderboard */
export function getLeaderboard(limit = 50, offset = 0) {
  return request<{
    entries: Array<{
      rank: number;
      playerId: string;
      playerName: string;
      score: number;
      level: number;
    }>;
  }>(`/leaderboard?limit=${limit}&offset=${offset}`);
}
