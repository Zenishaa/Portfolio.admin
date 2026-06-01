import crypto from "crypto";

import { prisma } from "../../../config/db.js";

import {
  logsQueue,
} from "../../../jobs/logs/logs.queue.js";

export const apiGateway = async (
  req,
  res,
  next
) => {

  const startTime =
    Date.now();

  const requestId =
    crypto.randomUUID();

  req.requestId =
    requestId;

  res.setHeader(
    "X-Request-Id",
    requestId
  );

  let apiUserId = null;

  let apiKeyId = null;

  try {

    const apiKey =
      req.headers["x-api-key"];

    if (apiKey) {

      const api =
        await prisma.aPI.findFirst({
          where: {
            api_key: apiKey,
          },

          select: {
            id: true,
            user_id: true,
          },
        });

      if (api) {

        apiUserId =
          api.user_id;

        apiKeyId =
          api.id;
      }
    }

  } catch (error) {

    console.log(
      "Gateway API Key Lookup Failed"
    );

    console.log(error);
  }

  console.log(`
====================================

API Gateway Request

====================================

Request ID:
${requestId}

Method:
${req.method}

Route:
${req.originalUrl}

IP:
${req.ip}

Time:
${new Date().toLocaleString(
  "en-IN",
  {
    timeZone:
      "Asia/Kolkata",
  }
)}

====================================
`);

  const originalJson =
    res.json;

  let responseBody =
    null;

  res.json =
    function (body) {

      responseBody =
        body;

      return originalJson.call(
        this,
        body
      );
    };

  res.on(
    "finish",

    async () => {

      try {

        const responseTime =
            Date.now() - startTime;

          const ignoredRoutes = [
            "/api/logs",
            "/api/analytics",
            "/ping",
          ];

          if (
            ignoredRoutes.some(
              (route) =>
                req.originalUrl.startsWith(
                  route
                )
            )
          ) {

            return;
          }

        await logsQueue.add(
          "storeApiLog",

          {
            user_id:
              req.user?.userId ||
              apiUserId ||
              null,

            api_key_id:
              apiKeyId ||
              null,

            route:
              req.originalUrl,

            method:
              req.method,

            status_code:
              res.statusCode,

            request_data:
              req.body || null,

            response_data:
              responseBody || null,

            ip_address:
              req.ip,

            response_time:
              responseTime,
          },

          {
            attempts: 3,

            backoff: {
              type:
                "exponential",

              delay: 2000,
            },

            removeOnComplete: 100,

            removeOnFail: 500,
          }
        );

      } catch (error) {

        console.log(`
====================================

Gateway Logging Failed

====================================
`);

        console.log(error);
      }
    }
  );

  next();
};
