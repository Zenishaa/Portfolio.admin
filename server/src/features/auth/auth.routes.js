import express from "express";

import {
  githubLogin,
  githubCallback,
} from "./auth.controller.js";

import {
  authLimiter,
} from "../../shared/middleware/rateLimit/rateLimit.middleware.js";

const router = express.Router();

router.get(
  "/github",
  authLimiter,
  githubLogin
);

router.get(
  "/github/callback",
  authLimiter,
  githubCallback
);

export default router;
