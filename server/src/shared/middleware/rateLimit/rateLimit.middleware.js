import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { redis } from "../../../config/redis.js";
import jwt from "jsonwebtoken";

/**
 * Extracts user ID from the Authorization header (JWT) if present.
 * Falls back to IP address for unauthenticated requests.
 * This ensures rate limits are per-user, not per-IP.
 */
const getUserKey = (req) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded?.userId) {
        return `user:${decoded.userId}`;
      }
    }
  } catch {
    // Token invalid/expired — fall through to IP-based key
  }
  // Fallback: use IP (supports proxied requests)
  return `ip:${req.ip}`;
};

/**
 * General API rate limiter — applied globally.
 * Generous limit for authenticated users doing normal operations.
 * 200 requests per 15 minutes per user/IP.
 */
export const apiLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redis.sendCommand(args),
    prefix: "rl:api:",
  }),
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getUserKey,
  skip: (req) => req.path === "/" || req.path === "/api/health",
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many requests. Please slow down and try again later.",
      retryAfter: res.getHeader("Retry-After"),
    });
  },
});

/**
 * Auth limiter — applied only to login/OAuth routes.
 * Stricter to prevent brute-force. IP-based only since user isn't authenticated yet.
 * 20 requests per 15 minutes per IP.
 */
export const authLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redis.sendCommand(args),
    prefix: "rl:auth:",
  }),
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  // Auth endpoints: always IP-based since no JWT exists yet
  keyGenerator: (req) => `auth:${req.ip}`,
  handler: (req, res) => {
    const retryAfter = res.getHeader("Retry-After");
    const message = "Too many login attempts. Please try again after 15 minutes.";

    // If it's a direct browser navigation (OAuth entry), redirect back to frontend
    if (req.path.includes("github")) {
      const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
      const params = new URLSearchParams({ error: message, retryAfter });
      return res.redirect(`${clientUrl}/login?${params.toString()}`);
    }

    // Otherwise return standard JSON for API calls
    res.status(429).json({
      success: false,
      message,
      retryAfter,
    });
  },
});

/**
 * Write/mutation limiter — for POST/PUT/DELETE heavy endpoints.
 * 50 requests per 15 minutes per user.
 */
export const writeLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redis.sendCommand(args),
    prefix: "rl:write:",
  }),
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getUserKey,
  skip: (req) => req.method === "GET",
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many write operations. Please try again later.",
      retryAfter: res.getHeader("Retry-After"),
    });
  },
});

