import { Worker } from "bullmq";

import {
  queueConnection,
} from "../../config/queue.js";

import { prisma } from "../../config/db.js";

import { tokensQueue } from "./tokens.queue.js";

/* =========================================
    WORKER
========================================= */

const tokensWorker =
  new Worker(
    "tokensQueue",

    async (job) => {

      /* =====================
          PURGE EXPIRED (cron)
      ===================== */

      if (job.name === "purgeExpiredTokens") {

        const result =
          await prisma.refreshToken.deleteMany({
            where: {
              expires_at: {
                lt: new Date(),
              },
            },
          });

        console.log(
          `[Token Cleanup] Purged ${result.count} expired refresh token(s)`
        );

        return { deleted: result.count };
      }
    },

    {
      connection:
        queueConnection,
    }
  );

/* =========================================
    EVENTS
========================================= */

tokensWorker.on(
  "completed",
  (job, result) => {
    console.log(
      `[Token Cleanup] Job ${job.id} completed — deleted: ${result?.deleted ?? 0}`
    );
  }
);

tokensWorker.on(
  "failed",
  (job, err) => {
    console.error(
      `[Token Cleanup] Job ${job?.id} failed`
    );
    console.error(err);
  }
);

/* =========================================
    SCHEDULE DAILY CRON
    Runs every day at 03:00 AM server time
========================================= */

tokensQueue.add(
  "purgeExpiredTokens",
  {},
  {
    repeat: {
      pattern: "0 3 * * *", // Every day at 3:00 AM
    },
    jobId: "purgeExpiredTokens-cron", // Stable ID prevents duplicates on restart
  }
);

console.log("[Token Cleanup] Daily purge cron scheduled (3:00 AM)");
