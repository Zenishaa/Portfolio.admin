import express from "express";

import {
  createCertificate,
  getCertificates,
  getSingleCertificate,
  updateCertificate,
  deleteCertificate,
} from "./certificate.controller.js";

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
      "uploads/certificates";

    next();
  },

  upload.array(
    "images",
    10
  ),

  createCertificate
);

router.get("/", protect, getCertificates);

router.get("/:slug", protect, getSingleCertificate);

router.put(
  "/:slug",

  protect,

  (req, res, next) => {

    req.uploadFolder =
      "uploads/certificates";

    next();
  },

  upload.array(
    "images",
    10
  ),

  updateCertificate
);

router.delete("/:slug", protect, deleteCertificate);

export default router;
