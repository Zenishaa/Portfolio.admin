import { prisma } from "../../../config/db.js";

export const validateApiKey = async (
  req,
  res,
  next
) => {
  try {

    const apiKey =
      req.headers["x-api-key"];

    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: "API key missing",
      });
    }

    const api =
      await prisma.aPI.findFirst({
        where: {
          api_key: apiKey,
          status: "active",
        },

        include: {
          user: true,
        },
      });

    if (!api) {
      return res.status(401).json({
        success: false,
        message: "Invalid API key",
      });
    }

    if (api.expires_at) {

      const currentDate =
        new Date();

      const expiryDate =
        new Date(api.expires_at);

      if (
        currentDate > expiryDate
      ) {
        // Automatically deactivate the key since it has expired
        await prisma.aPI.update({
          where: { id: api.id },
          data: { status: "inactive" },
        });

        return res.status(401).json({
          success: false,
          message:
            "API key expired and has been deactivated",
        });
      }
    }

    req.apiUser =
      api.user;

    req.apiKey =
      api;

    await prisma.aPI.update({
      where: {
        id: api.id,
      },

      data: {
        last_used_at:
          new Date(),
      },
    });

    next();

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
