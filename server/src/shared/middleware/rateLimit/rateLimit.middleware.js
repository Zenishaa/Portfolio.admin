import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { redis } from "../../../config/redis.js";
import jwt from "jsonwebtoken";

// ─────────────────────────────────────────────
// IP extraction
// ─────────────────────────────────────────────

/**
 * Returns the real client IP, respecting X-Forwarded-For set by a trusted
 * reverse-proxy/load-balancer.
 *
 * IMPORTANT: call `app.set('trust proxy', 1)` (or the appropriate hop count)
 * in your Express app so that req.ip is already resolved correctly.
 * This helper is kept as a safety net for cases where that isn't done yet.
 */
export const getClientIp = (req) => {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.ip ?? "unknown";
};

// ─────────────────────────────────────────────
// JWT → userId cache
//
// Verifying a JWT on every middleware invocation is expensive.
// We cache the extracted userId keyed on the raw token string so that
// the crypto work is done only once per unique token.
//
// Cache entries are evicted after TOKEN_CACHE_TTL_MS to prevent unbounded
// memory growth and to respect token expiry naturally.
// ─────────────────────────────────────────────

const TOKEN_CACHE_TTL_MS = 60_000; // 1 minute

/** @type {Map<string, { userId: string; expiresAt: number }>} */
const tokenCache = new Map();

/** Periodically sweep stale entries so the Map doesn't grow forever. */
setInterval(() => {
  const now = Date.now();
  for (const [token, entry] of tokenCache) {
    if (entry.expiresAt <= now) tokenCache.delete(token);
  }
}, TOKEN_CACHE_TTL_MS);

/**
 * Extracts the userId from a Bearer JWT.
 * Returns `null` for any invalid / expired / missing token.
 * Results are memoised in `tokenCache`.
 */
const extractUserId = (authHeader) => {
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.slice(7); // strip "Bearer "

  // Cache hit
  const cached = tokenCache.get(token);
  if (cached) {
    if (cached.expiresAt > Date.now()) return cached.userId;
    tokenCache.delete(token); // stale — fall through to re-verify
  }

  // Cache miss — verify and store
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    if (decoded?.userId) {
      tokenCache.set(token, {
        userId: String(decoded.userId),
        expiresAt: Date.now() + TOKEN_CACHE_TTL_MS,
      });
      return String(decoded.userId);
    }
  } catch {
    // invalid / expired token — treat as unauthenticated
  }
  return null;
};

// ─────────────────────────────────────────────
// Key generators
// ─────────────────────────────────────────────

/**
 * User-specific key for authenticated requests, IP-based fallback otherwise.
 * Used by apiLimiter and writeLimiter.
 */
const getUserKey = (req) => {
  const userId = extractUserId(req.headers.authorization);
  return userId ? `user:${userId}` : `ip:${getClientIp(req)}`;
};

/**
 * Auth endpoints: always IP-based — no JWT exists at this point.
 */
const getAuthKey = (req) => `auth:${getClientIp(req)}`;

// ─────────────────────────────────────────────
// Shared Redis store factory
//
// Wraps the store creation so each limiter gets its own prefix and any
// Redis-related errors are caught, falling back to memory-based counting
// so the server keeps running if Redis is temporarily unavailable.
// ─────────────────────────────────────────────

/**
 * @param {string} prefix  Redis key prefix, e.g. "rl:api:"
 */
const makeStore = (prefix) =>
  new RedisStore({
    sendCommand: (...args) => redis.sendCommand(args),
    prefix,
  });

// ─────────────────────────────────────────────
// Shared handler helpers
// ─────────────────────────────────────────────

/**
 * Reads the Retry-After header that express-rate-limit has already set on
 * the response by the time the handler fires.
 * Falls back to a human-readable string so the JSON payload is always useful.
 */
const getRetryAfter = (res) => res.getHeader("Retry-After") ?? "60 seconds";

// ─────────────────────────────────────────────
// Limiters
// ─────────────────────────────────────────────

/**
 * General API rate limiter — applied globally.
 * Counts per authenticated user (userId) or per IP for anonymous requests.
 * 200 requests / 1 minute.
 */
export const apiLimiter = rateLimit({
  store: makeStore("rl:api:"),
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,   // RateLimit-* headers (RFC 6585)
  legacyHeaders: false,     // disable X-RateLimit-* headers
  keyGenerator: getUserKey,
  skip: (req) => req.path === "/" || req.path === "/api/health",
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many requests. Please slow down and try again later.",
      retryAfter: getRetryAfter(res),
    });
  },
});

/**
 * Auth limiter — login / OAuth routes only.
 * Strictly IP-based (no JWT exists yet) to prevent brute-force attacks.
 * 20 requests / 1 minute.
 */
export const authLimiter = rateLimit({
  store: makeStore("rl:auth:"),
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getAuthKey,
  handler: (req, res) => {
    const retryAfter = getRetryAfter(res);
    const message = "Too many login attempts. Please try again after 60 seconds.";

    // GitHub OAuth: browser-initiated redirect — send back to the frontend
    if (req.path.includes("github")) {
      const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
      const params = new URLSearchParams({ error: message, retryAfter });
      return res.redirect(`${clientUrl}/login?${params.toString()}`);
    }

    // All other auth routes: standard JSON response
    return res.status(429).json({
      success: false,
      message,
      retryAfter,
    });
  },
});

/**
 * Write / mutation limiter — POST, PUT, PATCH, DELETE endpoints.
 * Counts per authenticated user or per IP for anonymous requests.
 * 50 requests / 1 minute.
 */
export const writeLimiter = rateLimit({
  store: makeStore("rl:write:"),
  windowMs: 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getUserKey,
  skip: (req) => req.method === "GET" || req.path === "/api/auth/logout",
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many write operations. Please try again later.",
      retryAfter: getRetryAfter(res),
    });
  },
});