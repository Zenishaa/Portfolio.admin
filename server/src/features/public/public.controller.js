import { prisma } from "../../config/db.js";

import { redis } from "../../config/redis.js";

import {
  analyticsQueue,
} from "../../jobs/analytics/analytics.queue.js";

export const getPublicPortfolio = async (
  req,
  res
) => {
  try {
    const user = req.apiUser;

    const cacheKey =
      `portfolio:${user.id}`;

    const cachedPortfolio =
      await redis.get(cacheKey);

    if (cachedPortfolio) {

      await analyticsQueue.add(
        "trackPortfolioVisit",
        {
          user_id: user.id,
          username: user.username,
          source: "redis-cache",
          timestamp: new Date(),
        },
        {
          attempts: 3,
          backoff: {
            type: "exponential",
            delay: 2000,
          },
        }
      );

      return res.status(200).json({
        success: true,
        source: "redis-cache",
        portfolio: JSON.parse(
          cachedPortfolio
        ),
      });
    }

    const portfolio =
      await prisma.user.findUnique({
        where: {
          id: user.id,
        },
        select: {
          id: true,
          name: true,
          username: true,
          avatar: true,
          bio: true,
          headline: true,

          users_links: true,
          skills: true,

          projects: {
            orderBy: {
              created_at: "desc",
            },
          },

          experiences: {
            orderBy: {
              start_date: "desc",
            },
          },

          certificates: {
            orderBy: {
              created_at: "desc",
            },
          },
        },
      });

    await redis.set(
      cacheKey,
      JSON.stringify(portfolio),
      {
        EX: 3600,
      }
    );

    await analyticsQueue.add(
      "trackPortfolioVisit",
      {
        user_id: user.id,
        username: user.username,
        ip_address: req.ip || req.headers["x-forwarded-for"],
        source: "postgresql",
        timestamp: new Date(),
      },
      {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 2000,
        },
      }
    );

    return res.status(200).json({
      success: true,
      source: "postgresql",
      portfolio,
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
