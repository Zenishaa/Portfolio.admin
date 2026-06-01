import express from "express";

import {
  createProject,
  getProjects,
  getSingleProject,
  updateProject,
  deleteProject,
} from "./project.controller.js";

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
      "uploads/projects";

    next();
  },

  upload.single("thumbnail"),

  createProject
);

router.get(
  "/",
  protect,
  getProjects
);

router.get(
  "/:slug",
  protect,
  getSingleProject
);

router.put(
  "/:slug",

  protect,

  (req, res, next) => {

    req.uploadFolder =
      "uploads/projects";

    next();
  },

  upload.single("thumbnail"),

  updateProject
);

router.delete(
  "/:slug",
  protect,
  deleteProject
);

export default router;
