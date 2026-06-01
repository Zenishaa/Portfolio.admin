import express
from "express";

import {
  getLogs,
} from "./logs.controller.js";

import {
  protect,
} from "../../shared/middleware/auth/auth.middleware.js";

const router =
  express.Router();

router.get(
  "/",
  protect,
  getLogs
);

export default router;
