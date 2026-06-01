import express from "express";

import {
  createApiKey,
  getApiKeys,
  regenerateApiKey,
  toggleApiStatus,
  deleteApiKey,
} from "./apiKey.controller.js";

import { protect } from "../../shared/middleware/auth/auth.middleware.js";

const router = express.Router();

router.post(
  "/",
  protect,
  createApiKey
);

router.get(
  "/",
  protect,
  getApiKeys
);

router.put(
  "/regenerate/:id",
  protect,
  regenerateApiKey
);

router.put(
  "/toggle/:id",
  protect,
  toggleApiStatus
);

router.delete(
  "/:id",
  protect,
  deleteApiKey
);

export default router;
