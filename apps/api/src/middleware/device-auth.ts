import { createMiddleware } from "hono/factory";

/**
 * Simple device-based auth: client sends X-Device-Id header.
 * In production, replace with proper JWT/session auth.
 */
export const deviceAuth = createMiddleware<{
  Variables: { deviceId: string };
}>(async (c, next) => {
  const deviceId = c.req.header("X-Device-Id");
  if (!deviceId) {
    return c.json({ error: "X-Device-Id header is required" }, 401);
  }
  c.set("deviceId", deviceId);
  await next();
});
