import { prisma } from "../../config/db.js";
import { redis } from "../../config/redis.js";
import {
  uploadToCloudinary,
} from "../../utils/cloudinaryUpload.js";

export const createExperience = async (req, res) => {
  try {
    const userId = req.user.userId;

    const {
      title,
      slug,
      description,
      start_date,
      end_date,
      is_current,
      links,
      company,
      location,
      mode,
    } = req.body;

    const existingSlug =
      await prisma.experience.findFirst({
        where: {
          slug,
          user_id: userId,
        },
      });

    if (existingSlug) {
      return res.status(400).json({
        success: false,
        message:
          "You already have an experience with this slug",
      });
    }

    let uploadedImages = [];

    if (
      req.files &&
      req.files.length > 0
    ) {
      uploadedImages =
        await Promise.all(
          req.files.map(
            async (file) => {
              const uploaded =
                await uploadToCloudinary(
                  file.buffer,
                  "experiences"
                );
              return uploaded.secure_url;
            }
          )
        );
    }

    const experience =
      await prisma.experience.create({
        data: {
          user_id: userId,
          title,
          slug,
          description,
          start_date: start_date ? new Date(start_date) : null,
          end_date: end_date ? new Date(end_date) : null,
          is_current: is_current === "true" || is_current === true,
          links: links ? JSON.parse(links) : null,
          images: uploadedImages.length > 0 ? uploadedImages : null,
          company,
          location,
          mode,
        },
      });
    await redis.del(`portfolio:${userId}`);
    return res.status(201).json({
      success: true,
      message: "Experience created",
      experience,
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const getExperiences = async (req, res) => {
  try {
    const userId = req.user.userId;

    const experiences =
      await prisma.experience.findMany({
        where: {
          user_id: userId,
        },
        orderBy: {
          start_date: "desc",
        },
      });

    return res.status(200).json({
      success: true,
      experiences,
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const getSingleExperience = async (req, res) => {
  try {
    const userId = req.user.userId;

    const slug = req.params.slug;

    const experience =
      await prisma.experience.findFirst({
        where: {
          slug,
          user_id: userId,
        },
      });

    if (!experience) {
      return res.status(404).json({
        success: false,
        message: "Experience not found",
      });
    }

    return res.status(200).json({
      success: true,
      experience,
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const updateExperience = async (req, res) => {
  try {
    const userId = req.user.userId;

    const currentSlug = req.params.slug;

    const {
      slug: newSlug,
    } = req.body;

    const existingExperience =
      await prisma.experience.findFirst({
        where: {
          slug: currentSlug,
          user_id: userId,
        },
      });

    if (!existingExperience) {
      return res.status(404).json({
        success: false,
        message: "Experience not found",
      });
    }

    if (
      newSlug &&
      newSlug !== currentSlug
    ) {
      const slugExists =
        await prisma.experience.findFirst({
          where: {
            slug: newSlug,
            user_id: userId,
            NOT: {
              id: existingExperience.id,
            },
          },
        });

      if (slugExists) {
        return res.status(400).json({
          success: false,
          message:
            "You already have an experience with this slug",
        });
      }
    }

    let uploadedImages =
      existingExperience.images || [];

    if (
      req.files &&
      req.files.length > 0
    ) {
      uploadedImages =
        await Promise.all(
          req.files.map(
            async (file) => {
              const uploaded =
                await uploadToCloudinary(
                  file.buffer,
                  "experiences"
                );
              return uploaded.secure_url;
            }
          )
        );
    }

    const updatedExperience =
      await prisma.experience.update({
        where: {
          id: existingExperience.id,
        },
        data: {
          ...req.body,
          start_date: req.body.start_date
            ? new Date(req.body.start_date)
            : existingExperience.start_date,
          end_date: req.body.end_date
            ? new Date(req.body.end_date)
            : existingExperience.end_date,
          is_current: req.body.is_current !== undefined 
            ? req.body.is_current === "true" || req.body.is_current === true
            : existingExperience.is_current,
          links: req.body.links
            ? JSON.parse(req.body.links)
            : existingExperience.links,
          images: uploadedImages.length > 0 ? uploadedImages : existingExperience.images,
        },
      });
    await redis.del(`portfolio:${userId}`);
    return res.status(200).json({
      success: true,
      message: "Experience updated",
      experience: updatedExperience,
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const deleteExperience = async (req, res) => {
  try {
    const userId = req.user.userId;

    const slug = req.params.slug;

    const existingExperience =
      await prisma.experience.findFirst({
        where: {
          slug,
          user_id: userId,
        },
      });

    if (!existingExperience) {
      return res.status(404).json({
        success: false,
        message: "Experience not found",
      });
    }

    await prisma.experience.delete({
      where: {
        id: existingExperience.id,
      },
    });

    await redis.del(`portfolio:${userId}`);
    return res.status(200).json({
      success: true,
      message: "Experience deleted",
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
