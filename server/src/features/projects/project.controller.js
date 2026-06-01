import { prisma } from "../../config/db.js";

import { redis } from "../../config/redis.js";

import {
  uploadToCloudinary,
} from "../../utils/cloudinaryUpload.js";

export const createProject =
  async (req, res) => {
    try {

      const userId =
        req.user.userId;

      const {
        title,
        slug,
        authors_contributors,
        description,
        publisher,
        status,
        tags,
        links,
        featured,
        type,
        date_time,
      } = req.body;

      if (
        !title ||
        !slug ||
        !type
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Title, slug and type are required",
        });
      }

      const existingSlug =
        await prisma.projects.findUnique({
          where: {
            slug,
          },
        });

      if (existingSlug) {
        return res.status(400).json({
          success: false,
          message:
            "Slug already exists",
        });
      }

      let thumbnail =
        null;

      if (req.file) {

        const uploadedImage =
          await uploadToCloudinary(
            req.file.buffer,
            "projects"
          );

        thumbnail =
          uploadedImage.secure_url;
      }

      const project =
        await prisma.projects.create({
          data: {
            user_id:
              userId,

            title,

            slug,

            authors_contributors:
              authors_contributors
                ? JSON.parse(
                    authors_contributors
                  )
                : null,

            description,

            publisher,

            status,

            tags:
              tags
                ? JSON.parse(
                    tags
                  )
                : null,

            links:
              links
                ? JSON.parse(
                    links
                  )
                : null,

            thumbnail,

            featured:
              featured ===
              "true",

            type,

            date_time:
              date_time
                ? new Date(
                    date_time
                  )
                : null,
          },
        });

      await redis.del(
        `portfolio:${userId}`
      );

      return res.status(201).json({
        success: true,
        message:
          "Project created",
        project,
      });

    } catch (error) {

      console.log(error);

      return res.status(500).json({
        success: false,
        message:
          "Server Error",
      });
    }
  };

export const getProjects =
  async (req, res) => {
    try {

      const userId =
        req.user.userId;

      const projects =
        await prisma.projects.findMany({
          where: {
            user_id:
              userId,
          },

          orderBy: {
            created_at:
              "desc",
          },
        });

      return res.status(200).json({
        success: true,
        projects,
      });

    } catch (error) {

      console.log(error);

      return res.status(500).json({
        success: false,
        message:
          "Server Error",
      });
    }
  };

export const getSingleProject =
  async (req, res) => {
    try {

      const userId =
        req.user.userId;

      const slug =
        req.params.slug;

      const project =
        await prisma.projects.findFirst({
          where: {
            slug,
            user_id:
              userId,
          },
        });

      if (!project) {
        return res.status(404).json({
          success: false,
          message:
            "Project not found",
        });
      }

      return res.status(200).json({
        success: true,
        project,
      });

    } catch (error) {

      console.log(error);

      return res.status(500).json({
        success: false,
        message:
          "Server Error",
      });
    }
  };

export const updateProject =
  async (req, res) => {
    try {

      const userId =
        req.user.userId;

      const currentSlug =
        req.params.slug;

      const {
        slug:
          newSlug,
      } = req.body;

      const existingProject =
        await prisma.projects.findFirst({
          where: {
            slug:
              currentSlug,

            user_id:
              userId,
          },
        });

      if (
        !existingProject
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Project not found",
        });
      }

      if (
        newSlug &&
        newSlug !==
          currentSlug
      ) {

        const slugExists =
          await prisma.projects.findFirst({
            where: {
              slug:
                newSlug,

              NOT: {
                id:
                  existingProject.id,
              },
            },
          });

        if (slugExists) {
          return res.status(400).json({
            success: false,
            message:
              "This slug is already present, try different slug",
          });
        }
      }

      let thumbnail =
        existingProject.thumbnail;

      if (req.file) {

        const uploadedImage =
          await uploadToCloudinary(
            req.file.buffer,
            "projects"
          );

        thumbnail =
          uploadedImage.secure_url;
      }

      const updatedProject =
        await prisma.projects.update({
          where: {
            id:
              existingProject.id,
          },

          data: {
            title:
              req.body.title ||
              existingProject.title,

            slug:
              req.body.slug ||
              existingProject.slug,

            authors_contributors:
              req.body
                .authors_contributors
                ? JSON.parse(
                    req.body
                      .authors_contributors
                  )
                : existingProject.authors_contributors,

            description:
              req.body
                .description ||
              existingProject.description,

            publisher:
              req.body
                .publisher ||
              existingProject.publisher,

            status:
              req.body
                .status ||
              existingProject.status,

            tags:
              req.body.tags
                ? JSON.parse(
                    req.body.tags
                  )
                : existingProject.tags,

            links:
              req.body.links
                ? JSON.parse(
                    req.body.links
                  )
                : existingProject.links,

            thumbnail,

            featured:
              req.body.featured
                ? req.body
                    .featured ===
                  "true"
                : existingProject.featured,

            type:
              req.body.type ||
              existingProject.type,

            date_time:
              req.body
                .date_time
                ? new Date(
                    req.body
                      .date_time
                  )
                : existingProject.date_time,
          },
        });

      await redis.del(
        `portfolio:${userId}`
      );

      return res.status(200).json({
        success: true,
        message:
          "Project updated",
        project:
          updatedProject,
      });

    } catch (error) {

      console.log(error);

      return res.status(500).json({
        success: false,
        message:
          "Server Error",
      });
    }
  };

export const deleteProject =
  async (req, res) => {
    try {

      const userId =
        req.user.userId;

      const slug =
        req.params.slug;

      const existingProject =
        await prisma.projects.findFirst({
          where: {
            slug,
            user_id:
              userId,
          },
        });

      if (
        !existingProject
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Project not found",
        });
      }

      await prisma.projects.delete({
        where: {
          id:
            existingProject.id,
        },
      });

      await redis.del(
        `portfolio:${userId}`
      );

      return res.status(200).json({
        success: true,
        message:
          "Project deleted",
      });

    } catch (error) {

      console.log(error);

      return res.status(500).json({
        success: false,
        message:
          "Server Error",
      });
    }
  };
