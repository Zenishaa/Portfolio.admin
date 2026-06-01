import express from "express";

import {
  createExperience,
  getExperiences,
  getSingleExperience,
  updateExperience,
  deleteExperience,
} from "./experience.controller.js";

import { protect } from "../../shared/middleware/auth/auth.middleware.js";

const router = express.Router();

router.post("/", protect, createExperience);

router.get("/", protect, getExperiences);

router.get("/:slug", protect, getSingleExperience);

router.put("/:slug", protect, updateExperience);

router.delete("/:slug", protect, deleteExperience);

export default router;
