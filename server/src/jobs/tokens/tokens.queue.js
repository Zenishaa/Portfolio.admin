import { Queue } from "bullmq";

import {
  queueConnection,
} from "../../config/queue.js";

export const tokensQueue =
  new Queue(
    "tokensQueue",
    {
      connection:
        queueConnection,
    }
  );
