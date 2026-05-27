import cloudinary from "../config/cloudinary.js";

import { prisma } from "../config/db.js";

import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateTokens.js";

import { getISTTime } from "../utils/time.js";

const githubAuthorizeUrl =
  "https://github.com/login/oauth/authorize";

const githubTokenUrl =
  "https://github.com/login/oauth/access_token";

const githubApiUrl =
  "https://api.github.com";

const getServerUrl = () =>
  process.env.SERVER_URL ||
  `http://localhost:${process.env.PORT || 8000}`;

const getClientUrl = () =>
  process.env.CLIENT_URL ||
  "http://localhost:5173";

const getGithubRedirectUri = () =>
  process.env.GITHUB_CALLBACK_URL ||
  `${getServerUrl()}/api/auth/github/callback`;

const createRefreshToken = async (userId) => {
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

const getGithubAccessToken = async (code) => {
  const response = await fetch(
    githubTokenUrl,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        client_id:
          process.env.GITHUB_CLIENT_ID,
        client_secret:
          process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri:
          getGithubRedirectUri(),
      }),
    }
  );

  const data = await response.json();

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

const githubRequest = async (
  path,
  accessToken
) => {
  const response = await fetch(
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
      "GitHub profile request failed"
    );
  }

  return response.json();
};

const getGithubEmail = async (
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
      (email) => email.verified
    );

  return primaryEmail?.email;
};

const uploadGithubAvatar = async (
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
        folder: "github-avatars",
        public_id:
          `github-${username}`,
        overwrite: true,
        resource_type: "image",
      }
    );

  return result.secure_url;
};

const getAvailableUsername = async (
  username,
  currentUserId
) => {
  const normalizedUsername =
    username
      ?.toLowerCase()
      .replace(
        /[^a-z0-9_-]/g,
        "-"
      ) || "github-user";

  const where = {
    username:
      normalizedUsername,
  };

  if (currentUserId) {
    where.NOT = {
      id: currentUserId,
    };
  }

  const existingUser =
    await prisma.user.findFirst({
      where,
      select: {
        id: true,
      },
    });

  if (!existingUser) {
    return normalizedUsername;
  }

  return `${normalizedUsername}-${Date.now()}`;
};

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

export const githubLogin = (
  req,
  res
) => {
  if (
    !process.env.GITHUB_CLIENT_ID ||
    !process.env.GITHUB_CLIENT_SECRET
  ) {
    return res.status(500).json({
      success: false,
      message:
        "GitHub OAuth is not configured",
    });
  }

  const params =
    new URLSearchParams({
      client_id:
        process.env.GITHUB_CLIENT_ID,
      redirect_uri:
        getGithubRedirectUri(),
      scope:
        "read:user user:email",
      allow_signup: "true",
    });

  return res.redirect(
    `${githubAuthorizeUrl}?${params.toString()}`
  );
};

export const githubCallback =
  async (req, res) => {
    try {
      const { code } = req.query;

      if (!code) {
        return redirectWithError(
          res,
          "GitHub authorization code missing"
        );
      }

      const githubAccessToken =
        await getGithubAccessToken(
          code
        );

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

      const githubId =
        String(githubUser.id);

      const existingUser =
        (await prisma.user.findUnique({
          where: {
            github_id: githubId,
          },
        })) ||
        (await prisma.user.findFirst({
          where: {
            email,
          },
        }));

      const username =
        await getAvailableUsername(
          githubUser.login,
          existingUser?.id
        );

      const avatar =
        await uploadGithubAvatar(
          githubUser.avatar_url,
          username
        );

      const userData = {
        github_id: githubId,
        name:
          githubUser.name ||
          githubUser.login,
        username,
        email,
        avatar,
        last_login: getISTTime(),
      };

      const user = existingUser
        ? await prisma.user.update({
            where: {
              id: existingUser.id,
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
          })
        : await prisma.user.create({
            data: userData,
            select: {
              id: true,
              name: true,
              username: true,
              email: true,
              avatar: true,
              created_at: true,
            },
          });

      const accessToken =
        generateAccessToken(user.id);

      const refreshToken =
        await createRefreshToken(
          user.id
        );

      const params =
        new URLSearchParams({
          accessToken,
          refreshToken,
          user: JSON.stringify(user),
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
