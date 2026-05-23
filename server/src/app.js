import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";

import {
  apiLimiter,
} from "./middleware/rateLimit.middleware.js";

import {
  apiGateway,
} from "./middleware/apiGateway.middleware.js";

import {
  securityMiddleware,
} from "./config/security.js";

import tokenRoutes from "./routes/token.routes.js";

import "./workers/analytics.worker.js";
import "./workers/logs.worker.js";

import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import heroRoutes from "./routes/hero.routes.js";
import projectRoutes from "./routes/project.routes.js";
import experienceRoutes from "./routes/experience.routes.js";
import certificateRoutes from "./routes/certificate.routes.js";
import publicRoutes from "./routes/public.routes.js";
import apiRoutes from "./routes/api.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import logsRoutes from "./routes/logs.routes.js";


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

app.use(apiLimiter);

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
app.use("/api/hero", heroRoutes);
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