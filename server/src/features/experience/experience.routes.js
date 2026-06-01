import express from "express";

import {
  createExperience,
  getExperiences,
  getSingleExperience,
  updateExperience,
  deleteExperience,
} from "./experience.controller.js";

import {
  upload,
} from "../../config/multer.js";

import { protect } from "../../shared/middleware/auth/auth.middleware.js";

const router = express.Router();

router.post(
  "/",

  protect,

  (req, res, next) => {

    req.uploadFolder =
      "uploads/experiences";

    next();
  },

  upload.array(
    "images",
    10
  ),

  createExperience
);

router.get("/", protect, getExperiences);

router.get("/:slug", protect, getSingleExperience);

router.put(
  "/:slug",

  protect,

  (req, res, next) => {

    req.uploadFolder =
      "uploads/experiences";

    next();
  },

  upload.array(
    "images",
    10
  ),

  updateExperience
);

router.delete("/:slug", protect, deleteExperience);

export default router;
