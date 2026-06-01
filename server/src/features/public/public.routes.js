import express from "express";

import {
  getPublicPortfolio,
} from "./public.controller.js";

import {
  validateApiKey,
} from "../../shared/middleware/auth/apiKey.middleware.js";

const router = express.Router();

router.get(
  "/",
  validateApiKey,
  getPublicPortfolio
);

export default router;
