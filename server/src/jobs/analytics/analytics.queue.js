import { Queue } from "bullmq";

import {
  queueConnection,
} from "../../config/queue.js";

export const analyticsQueue =
  new Queue(
    "analyticsQueue",
    {
      connection: queueConnection,
    }
  );
