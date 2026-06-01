import jwt from "jsonwebtoken";

import {
  prisma,
} from "../../config/db.js";

import {
  generateAccessToken,
  generateRefreshToken,
} from "../../utils/generateTokens.js";

export const refreshAccessToken =
  async (req, res) => {
    try {

      const {
        refreshToken,
      } = req.body;

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message:
            "Refresh token required",
        });
      }

      const storedToken =
        await prisma.refreshToken.findFirst({
          where: {
            token:
              refreshToken,
          },
        });

      if (!storedToken) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid refresh token",
        });
      }

      jwt.verify(

        refreshToken,

        process.env
          .JWT_REFRESH_SECRET,

        async (
          error,
          decoded
        ) => {

          if (error) {
            return res.status(401).json({
              success: false,
              message:
                "Refresh token expired",
            });
          }

          const accessToken =
            generateAccessToken(
              decoded.userId
            );

          return res.status(200).json({
            success: true,
            accessToken,
          });
        }
      );

    } catch (error) {

      console.log(error);

      return res.status(500).json({
        success: false,
        message:
          "Server Error",
      });
    }
  };
