import rateLimit from "express-rate-limit";

import {
  RedisStore,
} from "rate-limit-redis";

import {
  redis,
} from "../../../config/redis.js";

export const apiLimiter =
  rateLimit({

    store:
      new RedisStore({
        sendCommand:
          (...args) =>
            redis.sendCommand(args),
      }),

    windowMs:
      15 * 60 * 1000,

    max: 25,

    standardHeaders: true,

    legacyHeaders: false,

    message: {
      success: false,
      message:
        "Too many requests",
    },
  });

export const authLimiter =
  rateLimit({

    store:
      new RedisStore({
        sendCommand:
          (...args) =>
            redis.sendCommand(args),
      }),

    windowMs:
      15 * 60 * 1000,

    max: 1000,

    message: {
      success: false,
      message:
        "Too many login attempts",
    },
  });
