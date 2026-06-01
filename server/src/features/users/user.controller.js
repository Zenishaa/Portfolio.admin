import { prisma } from "../../config/db.js";
import { uploadToCloudinary } from "../../utils/cloudinaryUpload.js";

export const getCurrentUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.user.userId,
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        avatar: true,
        bio: true,
        users_links: true,
        skills: true,
        is_public: true,
        is_active: true,
        created_at: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const updateCurrentUser = async (req, res) => {
  try {
    const { name, username, bio, is_public, users_links, skills } = req.body;

    let avatarUrl = undefined;
    if (req.file) {
      const uploadedImage = await uploadToCloudinary(req.file.buffer, "avatars");
      avatarUrl = uploadedImage.secure_url;
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: req.user.userId,
      },
      data: {
        ...(name !== undefined && { name }),
        ...(username !== undefined && { username }),
        ...(bio !== undefined && { bio }),
        ...(avatarUrl !== undefined && { avatar: avatarUrl }),
        ...(is_public !== undefined && { is_public: is_public === 'true' || is_public === true }),
        ...(users_links !== undefined && { users_links: typeof users_links === 'string' ? JSON.parse(users_links) : users_links }),
        ...(skills !== undefined && { skills: typeof skills === 'string' ? JSON.parse(skills) : skills }),
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        avatar: true,
        bio: true,
        users_links: true,
        skills: true,
        is_public: true,
        is_active: true,
        created_at: true,
      },
    });

    return res.status(200).json({
      success: true,
      user: updatedUser,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.log(error);

    // Prisma unique constraint violation code
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: "Username is already taken",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
