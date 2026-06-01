import { prisma }
from "../../config/db.js";

export const getDashboardAnalytics =
  async (req, res) => {

    try {

      const userId =
        req.user.userId;

      /*
      ====================================
      FILTER
      ====================================
      */

      const filter =
        req.query.filter || "7d";

      let startDate =
        new Date();

      switch (filter) {

        case "7d":

          startDate.setDate(
            startDate.getDate() - 7
          );

          break;

        case "30d":

          startDate.setDate(
            startDate.getDate() - 30
          );

          break;

        case "90d":

          startDate.setDate(
            startDate.getDate() - 90
          );

          break;

        default:

          startDate.setDate(
            startDate.getDate() - 7
          );
      }

      /*
      ====================================
      TOTAL DASHBOARD COUNTS
      ====================================
      */

      const dashboard =
        await prisma.dashboard.findUnique({

          where: {
            user_id:
              userId,
          },
        });

      /*
      ====================================
      FETCH ANALYTICS EVENTS
      ====================================
      */

      const analytics =
        await prisma.dashboardAnalytics.findMany({

          where: {

            user_id:
              userId,

            created_at: {
              gte:
                startDate,
            },
          },

          orderBy: {
            created_at:
              "asc",
          },
        });

      /*
      ====================================
      SUMMARY COUNTS
      ====================================
      */

      const summary =
        {};

      analytics.forEach(
        (item) => {

          if (
            !summary[item.type]
          ) {

            summary[item.type] =
              0;
          }

          summary[item.type]++;
        }
      );

      /*
      ====================================
      GRAPH DATA
      ====================================
      */

      const graphData =
        {};

      analytics.forEach(
        (item) => {

          const date =
            item.created_at
              .toISOString()
              .split("T")[0];

          if (
            !graphData[date]
          ) {

            graphData[date] =
              {
                date,
              };
          }

          if (
            !graphData[date][item.type]
          ) {

            graphData[date][item.type] =
              0;
          }

          graphData[date][item.type]++;
        }
      );

      /*
      ====================================
      RESPONSE
      ====================================
      */

      return res.status(200).json({

        success: true,

        filter,

        dashboard,

        summary,

        totalEvents:
          analytics.length,

        graphData:
          Object.values(
            graphData
          ),
      });

    } catch (error) {

      return res.status(500).json({

        success: false,

        message:
          "Server Error",
      });
    }
  };
