import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import cookieParser from "cookie-parser";

import {
  apiLimiter,
  writeLimiter,
} from "./shared/middleware/rateLimit/rateLimit.middleware.js";

import {
  apiGateway,
} from "./shared/middleware/gateway/apiGateway.middleware.js";

import {
  securityMiddleware,
} from "./config/security.js";

import tokenRoutes from "./features/tokens/token.routes.js";

import "./jobs/analytics/analytics.worker.js";
import "./jobs/logs/logs.worker.js";
import "./jobs/tokens/tokens.worker.js";

import healthRoutes from "./features/health/health.routes.js";
import authRoutes from "./features/auth/auth.routes.js";
import userRoutes from "./features/users/user.routes.js";
import projectRoutes from "./features/projects/project.routes.js";
import experienceRoutes from "./features/experience/experience.routes.js";
import certificateRoutes from "./features/certificates/certificate.routes.js";
import publicRoutes from "./features/public/public.routes.js";
import apiRoutes from "./features/apiKeys/apiKey.routes.js";
import dashboardRoutes from "./features/dashboard/dashboard.routes.js";
import analyticsRoutes from "./features/analytics/analytics.routes.js";
import logsRoutes from "./features/logs/logs.routes.js";


dotenv.config();

const app = express();

securityMiddleware(app);

app.use(
  express.json({
    limit: "10mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);

app.use(cookieParser());

app.use(apiLimiter);
app.use(writeLimiter);

app.use(apiGateway);

app.use(
  "/uploads",

  express.static(
    path.join(
      process.cwd(),
      "uploads"
    )
  )
);

app.get("/", (req, res) => {
  return res.json({
    success: true,
    message: "Portfolio SaaS API Running",
  });
});

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/experience", experienceRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/keys", apiRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/token", tokenRoutes);
app.use("/api/logs", logsRoutes);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
