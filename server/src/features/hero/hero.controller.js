import { prisma } from "../../config/db.js";
import { redis } from "../../config/redis.js";

export const createOrUpdateHero = async (req, res) => {
  try {
    const userId = req.user.userId;

    const {
      headline,
      sub_headline,
      description,
      resume_url,
      profile_image,
    } = req.body;

    const existingHero = await prisma.hero.findUnique({
      where: {
        user_id: userId,
      },
    });

    let hero;

    if (existingHero) {
      hero = await prisma.hero.update({
        where: {
          user_id: userId,
        },
        data: {
          headline,
          sub_headline,
          description,
          resume_url,
          profile_image,
        },
      });
    } else {
      hero = await prisma.hero.create({
        data: {
          user_id: userId,
          headline,
          sub_headline,
          description,
          resume_url,
          profile_image,
        },
      });
    }
    await redis.del(`portfolio:${userId}`);
    return res.status(200).json({
      success: true,
      message: "Hero section saved",
      hero,
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const getHero = async (req, res) => {
  try {
    const userId = req.user.userId;

    const hero = await prisma.hero.findUnique({
      where: {
        user_id: userId,
      },
    });

    return res.status(200).json({
      success: true,
      hero,
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const deleteHero = async (req, res) => {
  try {
    const userId = req.user.userId;

    const hero = await prisma.hero.findUnique({
      where: {
        user_id: userId,
      },
    });

    if (!hero) {
      return res.status(404).json({
        success: false,
        message: "Hero section not found",
      });
    }

    await prisma.hero.delete({
      where: {
        user_id: userId,
      },
    });

    await redis.del(`portfolio:${userId}`);
    return res.status(200).json({
      success: true,
      message: "Hero section deleted",
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
