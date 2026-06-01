import { prisma } from "../../config/db.js";

import { redis } from "../../config/redis.js";

import {
  uploadToCloudinary,
} from "../../utils/cloudinaryUpload.js";

export const createCertificate =
  async (req, res) => {
    try {

      const userId =
        req.user.userId;

      const {
        title,
        slug,
        type,
        link,
        archive_status,
        issued_by,
        issue_date,
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
        await prisma.certificates.findUnique({
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

      let uploadedImages =
        [];

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
                    "certificates"
                  );

                return uploaded.secure_url;
              }
            )
          );
      }

      const certificate =
        await prisma.certificates.create({
          data: {
            user_id:
              userId,

            title,

            slug,

            type,

            link,

            images:
              uploadedImages,

            archive_status,

            issued_by,

            issue_date:
              issue_date
                ? new Date(
                    issue_date
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
          "Certificate created",
        certificate,
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

export const getCertificates =
  async (req, res) => {
    try {

      const userId =
        req.user.userId;

      const certificates =
        await prisma.certificates.findMany({
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
        certificates,
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

export const getSingleCertificate =
  async (req, res) => {
    try {

      const userId =
        req.user.userId;

      const slug =
        req.params.slug;

      const certificate =
        await prisma.certificates.findFirst({
          where: {
            slug,
            user_id:
              userId,
          },
        });

      if (!certificate) {
        return res.status(404).json({
          success: false,
          message:
            "Certificate not found",
        });
      }

      return res.status(200).json({
        success: true,
        certificate,
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

export const updateCertificate =
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

      const existingCertificate =
        await prisma.certificates.findFirst({
          where: {
            slug:
              currentSlug,

            user_id:
              userId,
          },
        });

      if (
        !existingCertificate
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Certificate not found",
        });
      }

      if (
        newSlug &&
        newSlug !==
          currentSlug
      ) {

        const slugExists =
          await prisma.certificates.findFirst({
            where: {
              slug:
                newSlug,

              NOT: {
                id:
                  existingCertificate.id,
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

      let uploadedImages =
        existingCertificate.images || [];

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
                    "certificates"
                  );

                return uploaded.secure_url;
              }
            )
          );
      }

      const updatedCertificate =
        await prisma.certificates.update({
          where: {
            id:
              existingCertificate.id,
          },

          data: {
            title:
              req.body.title ||
              existingCertificate.title,

            slug:
              req.body.slug ||
              existingCertificate.slug,

            type:
              req.body.type ||
              existingCertificate.type,

            link:
              req.body.link ||
              existingCertificate.link,

            archive_status:
              req.body
                .archive_status ||
              existingCertificate.archive_status,

            issued_by:
              req.body
                .issued_by ||
              existingCertificate.issued_by,

            images:
              uploadedImages,

            issue_date:
              req.body
                .issue_date
                ? new Date(
                    req.body.issue_date
                  )
                : existingCertificate.issue_date,
          },
        });

      await redis.del(
        `portfolio:${userId}`
      );

      return res.status(200).json({
        success: true,
        message:
          "Certificate updated",

        certificate:
          updatedCertificate,
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

export const deleteCertificate =
  async (req, res) => {
    try {

      const userId =
        req.user.userId;

      const slug =
        req.params.slug;

      const existingCertificate =
        await prisma.certificates.findFirst({
          where: {
            slug,
            user_id:
              userId,
          },
        });

      if (
        !existingCertificate
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Certificate not found",
        });
      }

      await prisma.certificates.delete({
        where: {
          id:
            existingCertificate.id,
        },
      });

      await redis.del(
        `portfolio:${userId}`
      );

      return res.status(200).json({
        success: true,
        message:
          "Certificate deleted",
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
