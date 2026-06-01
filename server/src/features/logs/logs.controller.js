import { prisma }
from "../../config/db.js";

export const getLogs =
  async (req, res) => {

    try {

      const userId =
        req.user.userId;

      const page =
        Number(req.query.page) || 1;

      const limit =
        Number(req.query.limit) || 20;

      const skip =
        (page - 1) * limit;

      const logs =
        await prisma.logs.findMany({

          where: {
            user_id: userId,
          },

          orderBy: {
            created_at: "desc",
          },

          skip,

          take: limit,
        });

      const totalLogs =
        await prisma.logs.count({

          where: {
            user_id: userId,
          },
        });

      return res.status(200).json({

        success: true,

        currentPage:
          page,

        totalPages:
          Math.ceil(
            totalLogs / limit
          ),

        totalLogs,

        logs,
      });

    } catch (error) {

      console.log(error);

      return res.status(500).json({

        success: false,

        message:
          "Server Error",
      });
    }
  };
