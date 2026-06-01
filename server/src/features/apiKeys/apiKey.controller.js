import crypto from "crypto";

import { prisma } from "../../config/db.js";

export const createApiKey = async (
  req,
  res
) => {
  try {
    const userId = req.user.userId;

    const {
      name,
      expires_at,
    } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "API key name is required",
      });
    }

    const apiKey =
      "portfolio_" +
      crypto.randomBytes(24).toString("hex");

    const api =
      await prisma.aPI.create({
        data: {
          user_id: userId,
          name,
          api_key: apiKey,
          expires_at: expires_at
            ? new Date(expires_at)
            : null,
        },
      });

    return res.status(201).json({
      success: true,
      message: "API key created",
      api,
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const getApiKeys = async (
  req,
  res
) => {
  try {
    const userId = req.user.userId;

    const apis =
      await prisma.aPI.findMany({
        where: {
          user_id: userId,
        },
        orderBy: {
          created_at: "desc",
        },
        select: {
          id: true,
          name: true,
          api_key: true,
          status: true,
          rate_limit: true,
          last_used_at: true,
          expires_at: true,
          created_at: true,
        },
      });

    return res.status(200).json({
      success: true,
      apis,
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const regenerateApiKey = async (
  req,
  res
) => {
  try {
    const userId = req.user.userId;

    const apiId = parseInt(req.params.id);

    const existingApi =
      await prisma.aPI.findFirst({
        where: {
          id: apiId,
          user_id: userId,
        },
      });

    if (!existingApi) {
      return res.status(404).json({
        success: false,
        message: "API key not found",
      });
    }

    const newApiKey =
      "portfolio_" +
      crypto.randomBytes(24).toString("hex");

    const updatedApi =
      await prisma.aPI.update({
        where: {
          id: existingApi.id,
        },
        data: {
          api_key: newApiKey,
        },
      });

    return res.status(200).json({
      success: true,
      message: "API key regenerated",
      api: updatedApi,
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const toggleApiStatus = async (
  req,
  res
) => {
  try {
    const userId = req.user.userId;

    const apiId = parseInt(req.params.id);

    const existingApi =
      await prisma.aPI.findFirst({
        where: {
          id: apiId,
          user_id: userId,
        },
      });

    if (!existingApi) {
      return res.status(404).json({
        success: false,
        message: "API key not found",
      });
    }

    const updatedApi =
      await prisma.aPI.update({
        where: {
          id: existingApi.id,
        },
        data: {
          status:
            existingApi.status === "active"
              ? "inactive"
              : "active",
        },
      });

    return res.status(200).json({
      success: true,
      message: "API status updated",
      api: updatedApi,
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const deleteApiKey = async (
  req,
  res
) => {
  try {
    const userId = req.user.userId;

    const apiId = parseInt(req.params.id);

    const existingApi =
      await prisma.aPI.findFirst({
        where: {
          id: apiId,
          user_id: userId,
        },
      });

    if (!existingApi) {
      return res.status(404).json({
        success: false,
        message: "API key not found",
      });
    }

    await prisma.aPI.delete({
      where: {
        id: existingApi.id,
      },
    });

    return res.status(200).json({
      success: true,
      message: "API key deleted",
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
