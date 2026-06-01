import {
  analyticsQueue,
} from "../../jobs/analytics/analytics.queue.js";

export const trackGithubClick =
  async (req, res) => {
    try {

      const user =
        req.apiUser;

      await analyticsQueue.add(
        "githubClick",
        {
          user_id: user.id,
        },
        {
          attempts: 3,
        }
      );

      return res.status(200).json({
        success: true,
        message:
          "Github click tracked",
      });

    } catch (error) {

      console.log(error);

      return res.status(500).json({
        success: false,
        message: "Server Error",
      });
    }
  };

export const trackLiveDemoClick =
  async (req, res) => {
    try {

      const user =
        req.apiUser;

      await analyticsQueue.add(
        "liveDemoClick",
        {
          user_id: user.id,
        },
        {
          attempts: 3,
        }
      );

      return res.status(200).json({
        success: true,
        message:
          "Live demo click tracked",
      });

    } catch (error) {

      console.log(error);

      return res.status(500).json({
        success: false,
        message: "Server Error",
      });
    }
  };

export const trackResumeDownload =
  async (req, res) => {
    try {

      const user =
        req.apiUser;

      await analyticsQueue.add(
        "resumeDownload",
        {
          user_id: user.id,
        },
        {
          attempts: 3,
        }
      );

      return res.status(200).json({
        success: true,
        message:
          "Resume download tracked",
      });

    } catch (error) {

      console.log(error);

      return res.status(500).json({
        success: false,
        message: "Server Error",
      });
    }
  };

export const trackProjectClick =
  async (req, res) => {
    try {

      const user =
        req.apiUser;

      await analyticsQueue.add(
        "projectClick",
        {
          user_id: user.id,
        },
        {
          attempts: 3,
        }
      );

      return res.status(200).json({
        success: true,
        message:
          "Project click tracked",
      });

    } catch (error) {

      console.log(error);

      return res.status(500).json({
        success: false,
        message: "Server Error",
      });
    }
  };

export const trackContactSubmission =
  async (req, res) => {
    try {

      const user =
        req.apiUser;

      await analyticsQueue.add(
        "contactSubmission",
        {
          user_id: user.id,
        },
        {
          attempts: 3,
        }
      );

      return res.status(200).json({
        success: true,
        message:
          "Contact submission tracked",
      });

    } catch (error) {

      console.log(error);

      return res.status(500).json({
        success: false,
        message: "Server Error",
      });
    }
  };
