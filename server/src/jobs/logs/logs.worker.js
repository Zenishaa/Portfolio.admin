import { Worker } from "bullmq";

import {
  queueConnection,
} from "../../config/queue.js";

import { prisma } from "../../config/db.js";

const logsWorker =
  new Worker(
    "logsQueue",

    async (job) => {

      const {
        user_id,
        api_key_id,
        route,
        method,
        status_code,
        request_data,
        response_data,
        ip_address,
        response_time,
      } = job.data;

      await prisma.logs.create({
        data: {
          user_id:
            user_id || null,

          api_key_id:
            api_key_id || null,

          route,

          method,

          status_code,

          request_data,

          response_data,

          ip_address,

          response_time,
        },
      });

      console.log(
        `Log stored for ${route}`
      );
    },

    {
      connection:
        queueConnection,
    }
  );

logsWorker.on(
  "completed",
  (job) => {

    console.log(
      `Logs job ${job.id} completed`
    );
  }
);

logsWorker.on(
  "failed",
  (job, err) => {

    console.log(
      `Logs job ${job?.id} failed`
    );

    console.log(err);
  }
);
