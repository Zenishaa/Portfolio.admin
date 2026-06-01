import express from "express";

import {
  refreshAccessToken,
} from "./token.controller.js";

const router =
  express.Router();

router.post(
  "/refresh",
  refreshAccessToken
);

export default router;
