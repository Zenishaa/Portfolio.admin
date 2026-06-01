import { Worker }
from "bullmq";

import {
  queueConnection,
} from "../../config/queue.js";

import { prisma }
from "../../config/db.js";

const analyticsWorker =
  new Worker(

    "analyticsQueue",

    async (job) => {

      const {
        user_id,
        metadata,
      } = job.data;

      let dashboard =
        await prisma.dashboard.findUnique({

          where: {
            user_id,
          },
        });

      if (!dashboard) {

        dashboard =
          await prisma.dashboard.create({

            data: {
              user_id,
            },
          });
      }

      switch (job.name) {

        /*
        ====================================
        PORTFOLIO VISIT
        ====================================
        */

        case "trackPortfolioVisit":

          await prisma.dashboard.update({

            where: {
              user_id,
            },

            data: {

              total_visit: {
                increment: 1,
              },
            },
          });

          await prisma.dashboardAnalytics.create({

            data: {

              user_id,

              type:
                "portfolio_visit",

              metadata:
                metadata || null,
            },
          });

          console.log(
            `Portfolio visit tracked for user ${user_id}`
          );

          break;

        /*
        ====================================
        GITHUB CLICK
        ====================================
        */

        case "githubClick":

          await prisma.dashboard.update({

            where: {
              user_id,
            },

            data: {

              github_clicks: {
                increment: 1,
              },
            },
          });

          await prisma.dashboardAnalytics.create({

            data: {

              user_id,

              type:
                "github_click",

              metadata:
                metadata || null,
            },
          });

          console.log(
            `Github click tracked for user ${user_id}`
          );

          break;

        /*
        ====================================
        LIVE DEMO CLICK
        ====================================
        */

        case "liveDemoClick":

          await prisma.dashboard.update({

            where: {
              user_id,
            },

            data: {

              live_demo_clicks: {
                increment: 1,
              },
            },
          });

          await prisma.dashboardAnalytics.create({

            data: {

              user_id,

              type:
                "live_demo_click",

              metadata:
                metadata || null,
            },
          });

          console.log(
            `Live demo click tracked for user ${user_id}`
          );

          break;

        /*
        ====================================
        RESUME DOWNLOAD
        ====================================
        */

        case "resumeDownload":

          await prisma.dashboard.update({

            where: {
              user_id,
            },

            data: {

              resume_download: {
                increment: 1,
              },
            },
          });

          await prisma.dashboardAnalytics.create({

            data: {

              user_id,

              type:
                "resume_download",

              metadata:
                metadata || null,
            },
          });

          console.log(
            `Resume download tracked for user ${user_id}`
          );

          break;

        /*
        ====================================
        PROJECT CLICK
        ====================================
        */

        case "projectClick":

          await prisma.dashboard.update({

            where: {
              user_id,
            },

            data: {

              project_clicks: {
                increment: 1,
              },
            },
          });

          await prisma.dashboardAnalytics.create({

            data: {

              user_id,

              type:
                "project_click",

              metadata:
                metadata || null,
            },
          });

          console.log(
            `Project click tracked for user ${user_id}`
          );

          break;

        /*
        ====================================
        CONTACT SUBMISSION
        ====================================
        */

        case "contactSubmission":

          await prisma.dashboard.update({

            where: {
              user_id,
            },

            data: {

              contact_submissions: {
                increment: 1,
              },
            },
          });

          await prisma.dashboardAnalytics.create({

            data: {

              user_id,

              type:
                "contact_submission",

              metadata:
                metadata || null,
            },
          });

          console.log(
            `Contact submission tracked for user ${user_id}`
          );

          break;

        /*
        ====================================
        UNKNOWN JOB
        ====================================
        */

        default:

          console.log(
            `Unknown analytics job: ${job.name}`
          );
      }
    },

    {
      connection:
        queueConnection,
    }
  );

/*
====================================
COMPLETED EVENT
====================================
*/

analyticsWorker.on(
  "completed",

  (job) => {

    console.log(
      `Analytics Job ${job.id} completed`
    );
  }
);

/*
====================================
FAILED EVENT
====================================
*/

analyticsWorker.on(
  "failed",

  (job, err) => {

    console.log(
      `Analytics Job ${job?.id} failed`
    );

    console.log(err);
  }
);

console.log(
  "Analytics Worker Started"
);
