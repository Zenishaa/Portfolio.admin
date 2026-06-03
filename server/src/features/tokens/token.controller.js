import jwt from "jsonwebtoken";

import {
  prisma,
} from "../../config/db.js";

import {
  generateAccessToken,
} from "../../utils/generateTokens.js";

import { generateRefreshToken } from "../../utils/generateTokens.js";

export const refreshAccessToken =
  async (req, res) => {
    try {
      const refreshToken = req.cookies?.refreshToken;

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

          // Refresh Token Rotation
          // 1. Delete the old token
          await prisma.refreshToken.delete({
            where: {
              id: storedToken.id,
            },
          });

          // 2. Generate new tokens
          const accessToken =
            generateAccessToken(
              decoded.userId
            );

          const newRefreshToken = generateRefreshToken(decoded.userId);

          // 3. Save new refresh token to DB
          await prisma.refreshToken.create({
            data: {
              user_id: decoded.userId,
              token: newRefreshToken,
              expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
          });

          // 4. Set new HttpOnly cookie
          res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
          });

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
