import express from "express";

import {
  getDashboardAnalytics,
} from "./dashboard.controller.js";

import {
  protect,
} from "../../shared/middleware/auth/auth.middleware.js";

const router = express.Router();

router.get(
  "/",
  protect,
  getDashboardAnalytics
);

export default router;
