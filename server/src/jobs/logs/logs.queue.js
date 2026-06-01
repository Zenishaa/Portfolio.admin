import { Queue } from "bullmq";

import {
  queueConnection,
} from "../../config/queue.js";

export const logsQueue =
  new Queue(
    "logsQueue",
    {
      connection:
        queueConnection,
    }
  );
