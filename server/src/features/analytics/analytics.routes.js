import express from "express";

import {
  trackGithubClick,
  trackLiveDemoClick,
  trackResumeDownload,
  trackProjectClick,
  trackContactSubmission,
} from "./analytics.controller.js";

import {
  validateApiKey,
} from "../../shared/middleware/auth/apiKey.middleware.js";

const router = express.Router();

router.post(
  "/github-click",
  validateApiKey,
  trackGithubClick
);

router.post(
  "/live-demo-click",
  validateApiKey,
  trackLiveDemoClick
);

router.post(
  "/resume-download",
  validateApiKey,
  trackResumeDownload
);

router.post(
  "/project-click",
  validateApiKey,
  trackProjectClick
);

router.post(
  "/contact-submission",
  validateApiKey,
  trackContactSubmission
);

export default router;
