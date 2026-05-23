import express
from "express";

import {
  getLogs,
} from "../controllers/logs.controller.js";

import {
  protect,
} from "../middleware/auth.middleware.js";

const router =
  express.Router();

router.get(
  "/",
  protect,
  getLogs
);

export default router;