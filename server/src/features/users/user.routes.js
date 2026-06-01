import express from "express";

import { getCurrentUser } from "./user.controller.js";

import { protect } from "../../shared/middleware/auth/auth.middleware.js";

const router = express.Router();

router.get(
  "/me",
  protect,
  getCurrentUser
);

export default router;
