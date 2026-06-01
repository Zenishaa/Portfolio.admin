import express from "express";

import {
  createOrUpdateHero,
  getHero,
  deleteHero,
} from "./hero.controller.js";

import { protect } from "../../shared/middleware/auth/auth.middleware.js";

const router = express.Router();

router.post(
  "/",
  protect,
  createOrUpdateHero
);

router.get(
  "/",
  protect,
  getHero
);

router.delete(
  "/",
  protect,
  deleteHero
);

export default router;
