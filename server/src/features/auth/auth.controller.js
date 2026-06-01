import cloudinary from "../../config/cloudinary.js";

import { prisma } from "../../config/db.js";

import {
  generateAccessToken,
  generateRefreshToken,
} from "../../utils/generateTokens.js";

import { getISTTime } from "../../utils/time.js";

/* =========================================
    GITHUB CONFIG
========================================= */

const githubAuthorizeUrl =
  "https://github.com/login/oauth/authorize";

const githubTokenUrl =
  "https://github.com/login/oauth/access_token";

const githubApiUrl =
  "https://api.github.com";

/* =========================================
    URL HELPERS
========================================= */

const getServerUrl = () =>
  process.env.SERVER_URL ||
  `http://localhost:${process.env.PORT || 8000}`;

const getClientUrl = () =>
  process.env.CLIENT_URL ||
  "http://localhost:5173";

const getGithubRedirectUri = () =>
  process.env.GITHUB_CALLBACK_URL ||
  `${getServerUrl()}/api/auth/github/callback`;

/* =========================================
    REFRESH TOKEN
========================================= */

const createRefreshToken =
  async (userId) => {
    const refreshToken =
      generateRefreshToken(userId);

    await prisma.refreshToken.create({
      data: {
        user_id: userId,

        token: refreshToken,

        expires_at: new Date(
          Date.now() +
            7 *
              24 *
              60 *
              60 *
              1000
        ),
      },
    });

    return refreshToken;
  };

/* =========================================
    GET GITHUB ACCESS TOKEN
========================================= */

const getGithubAccessToken =
  async (code) => {
    const response =
      await fetch(
        githubTokenUrl,
        {
          method: "POST",

          headers: {
            Accept:
              "application/json",

            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            client_id:
              process.env
                .GITHUB_CLIENT_ID,

            client_secret:
              process.env
                .GITHUB_CLIENT_SECRET,

            code,

            redirect_uri:
              getGithubRedirectUri(),
          }),
        }
      );

    const data =
      await response.json();

    if (
      !response.ok ||
      !data.access_token
    ) {
      throw new Error(
        data.error_description ||
          "GitHub token exchange failed"
      );
    }

    return data.access_token;
  };

/* =========================================
    GITHUB REQUEST
========================================= */

const githubRequest =
  async (
    path,
    accessToken
  ) => {
    const response =
      await fetch(
        `${githubApiUrl}${path}`,
        {
          headers: {
            Accept:
              "application/vnd.github+json",

            Authorization:
              `Bearer ${accessToken}`,

            "X-GitHub-Api-Version":
              "2022-11-28",
          },
        }
      );

    if (!response.ok) {
      throw new Error(
        "GitHub request failed"
      );
    }

    return response.json();
  };

/* =========================================
    GET VERIFIED EMAIL
========================================= */

const getGithubEmail =
  async (
    githubUser,
    accessToken
  ) => {
    if (githubUser.email) {
      return githubUser.email;
    }

    const emails =
      await githubRequest(
        "/user/emails",
        accessToken
      );

    const primaryEmail =
      emails.find(
        (email) =>
          email.primary &&
          email.verified
      ) ||
      emails.find(
        (email) =>
          email.verified
      );

    return primaryEmail?.email;
  };

/* =========================================
    AVATAR UPLOAD
========================================= */

const uploadGithubAvatar =
  async (
    avatarUrl,
    username
  ) => {
    if (!avatarUrl) {
      return null;
    }

    const result =
      await cloudinary.uploader.upload(
        avatarUrl,
        {
          folder:
            "github-avatars",

          public_id:
            `github-${username}`,

          overwrite: true,

          resource_type:
            "image",
        }
      );

    return result.secure_url;
  };

/* =========================================
    USERNAME GENERATOR
========================================= */

const getAvailableUsername =
  async (username) => {
    const normalizedUsername =
      username
        ?.toLowerCase()
        .replace(
          /[^a-z0-9_-]/g,
          "-"
        ) || "github-user";

    const existingUser =
      await prisma.user.findFirst({
        where: {
          username:
            normalizedUsername,
        },

        select: {
          id: true,
        },
      });

    if (!existingUser) {
      return normalizedUsername;
    }

    return `${normalizedUsername}-${Date.now()}`;
  };

/* =========================================
    ERROR REDIRECT
========================================= */

const redirectWithError = (
  res,
  message
) => {
  const params =
    new URLSearchParams({
      error: message,
    });

  return res.redirect(
    `${getClientUrl()}/login?${params.toString()}`
  );
};

/* =========================================
    GITHUB LOGIN
========================================= */

export const githubLogin = (
  req,
  res
) => {
  try {
    if (
      !process.env
        .GITHUB_CLIENT_ID ||
      !process.env
        .GITHUB_CLIENT_SECRET
    ) {
      return res.status(500).json({
        success: false,

        message:
          "GitHub OAuth not configured",
      });
    }

    const params =
      new URLSearchParams({
        client_id:
          process.env
            .GITHUB_CLIENT_ID,

        redirect_uri:
          getGithubRedirectUri(),

        scope:
          "read:user user:email",

        allow_signup:
          "true",
      });

    return res.redirect(
      `${githubAuthorizeUrl}?${params.toString()}`
    );

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,

      message:
        "GitHub login failed",
    });
  }
};

/* =========================================
    GITHUB CALLBACK
========================================= */

export const githubCallback =
  async (req, res) => {
    try {
      const { code } =
        req.query;

      /* =====================
          VALIDATION
      ===================== */

      if (!code) {
        return redirectWithError(
          res,
          "GitHub authorization code missing"
        );
      }

      /* =====================
          ACCESS TOKEN
      ===================== */

      const githubAccessToken =
        await getGithubAccessToken(
          code
        );

      /* =====================
          GITHUB USER
      ===================== */

      const githubUser =
        await githubRequest(
          "/user",
          githubAccessToken
        );

      const email =
        await getGithubEmail(
          githubUser,
          githubAccessToken
        );

      if (!email) {
        return redirectWithError(
          res,
          "Verified GitHub email not found"
        );
      }

      /* =====================
          USER DETAILS
      ===================== */

      const githubId =
        String(githubUser.id);

      /* =====================
          FIND USER
      ===================== */

      const existingUser =
        (await prisma.user.findUnique(
          {
            where: {
              github_id:
                githubId,
            },
          }
        )) ||
        (await prisma.user.findUnique(
          {
            where: {
              email,
            },
          }
        ));

      /* =====================
          USERNAME
      ===================== */

      const username =
        existingUser?.username ||
        (await getAvailableUsername(
          githubUser.login
        ));

      /* =====================
          AVATAR
      ===================== */

      let avatar =
        existingUser?.avatar;

      if (!avatar) {
        avatar =
          await uploadGithubAvatar(
            githubUser.avatar_url,
            username
          );
      }

      /* =====================
          USER DATA
      ===================== */

      const userData = {
        github_id:
          githubId,

        name:
          githubUser.name ||
          githubUser.login,

        username,

        email,

        avatar,

        last_login:
          getISTTime(),
      };

      /* =====================
          CREATE / UPDATE
      ===================== */

      const user =
        existingUser
          ? await prisma.user.update(
              {
                where: {
                  id:
                    existingUser.id,
                },

                data: userData,

                select: {
                  id: true,

                  name: true,

                  username: true,

                  email: true,

                  avatar: true,

                  created_at: true,
                },
              }
            )
          : await prisma.user.create(
              {
                data: userData,

                select: {
                  id: true,

                  name: true,

                  username: true,

                  email: true,

                  avatar: true,

                  created_at: true,
                },
              }
            );

      /* =====================
          TOKENS
      ===================== */

      const accessToken =
        generateAccessToken(
          user.id
        );

      const refreshToken =
        await createRefreshToken(
          user.id
        );

      /* =====================
          REDIRECT
      ===================== */

      const params =
        new URLSearchParams({
          accessToken,

          refreshToken,
        });

      return res.redirect(
        `${getClientUrl()}/auth/github/callback?${params.toString()}`
      );

    } catch (error) {
      console.log(error);

      return redirectWithError(
        res,
        "GitHub login failed"
      );
    }
  };
