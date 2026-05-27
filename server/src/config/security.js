import helmet from "helmet";

import cors from "cors";

import compression
from "compression";

import hpp from "hpp";

import morgan from "morgan";

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  process.env.CLIENT_URL,
].filter(Boolean);

export const securityMiddleware =
  (app) => {

    app.use(
      helmet({
        crossOriginResourcePolicy:
          false,
      })
    );

    app.use(
      cors({

        origin: allowedOrigins,

        credentials: true,
      })
    );

    app.use(
      compression()
    );

    app.use(
      hpp()
    );

    app.use(
      morgan("dev")
    );
  };
