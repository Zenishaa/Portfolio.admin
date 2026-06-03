import {
  ArrowLeft,
  Calendar,
  ImagePlus,
  X,
} from "lucide-react";

import {
  useState,
} from "react";

import type {
  ChangeEvent,
} from "react";

import { isAxiosError } from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import {
  createCertificate,
} from "@features/certificates/services/certificate.service";
import DashboardLayout from "@layouts/DashboardLayout";

const createSlug = (
  value: string
) =>
  value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");

function CreateCertificate() {
  const navigate =
    useNavigate();

  const [title, setTitle] =
    useState("");

  const slug =
    createSlug(title);

  const [type, setType] =
    useState<
      "achievement" | "certificate"
    >("certificate");

  const [
    issuedBy,
    setIssuedBy,
  ] = useState("");

  const [
    issueDate,
    setIssueDate,
  ] = useState("");

  const [link, setLink] =
    useState("");

  const [
    isVisible,
    setIsVisible,
  ] = useState(true);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [images, setImages] =
    useState<File[]>([]);

  const [
    imagePreviews,
    setImagePreviews,
  ] = useState<string[]>([]);

  const isValidUrl = (
    url: string
  ) => {
    if (!url.trim()) {
      return true;
    }

    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleImageUpload = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const files =
      event.target.files
        ? Array.from(
            event.target.files
          )
        : [];

    if (!files.length) {
      return;
    }

    const nextImages = [
      ...images,
      ...files,
    ];

    const nextPreviews = [
      ...imagePreviews,
      ...files.map((file) =>
        URL.createObjectURL(file)
      ),
    ];

    setImages(nextImages);
    setImagePreviews(
      nextPreviews
    );
  };

  const removeImage = (
    index: number
  ) => {
    const nextImages = [
      ...images,
    ];

    const nextPreviews = [
      ...imagePreviews,
    ];

    nextImages.splice(index, 1);
    nextPreviews.splice(
      index,
      1
    );

    setImages(nextImages);
    setImagePreviews(
      nextPreviews
    );
  };

  const handleSubmit =
    async () => {
      if (!title.trim()) {
        toast.error(
          "Certificate title is required"
        );

        return;
      }

      if (!slug.trim()) {
        toast.error(
          "Certificate slug is required"
        );

        return;
      }

      if (
        link &&
        !isValidUrl(link)
      ) {
        toast.error(
          "Certificate link is invalid"
        );

        return;
      }

      try {
        setLoading(true);

        const formData =
          new FormData();

        formData.append(
          "title",
          title.trim()
        );

        formData.append(
          "slug",
          slug.trim()
        );

        formData.append(
          "type",
          type
        );

        formData.append(
          "archive_status",
          isVisible
            ? "active"
            : "archived"
        );

        formData.append(
          "issued_by",
          issuedBy.trim()
        );

        if (link.trim()) {
          formData.append(
            "link",
            link.trim()
          );
        }

        if (issueDate) {
          formData.append(
            "issue_date",
            issueDate
          );
        }

        images.forEach((image) => {
          formData.append(
            "images",
            image
          );
        });

        const response =
          await createCertificate(
            formData
          );

        if (
          response?.success
        ) {
          toast.success(
            response.message ||
              "Certificate created successfully"
          );

          navigate(
            "/certificates"
          );
        }
      } catch (error) {
        console.error(error);

        const message =
          isAxiosError<{
            message?: string;
          }>(error)
            ? error.response
              ?.data
              ?.message
            : undefined;

        toast.error(
          message ||
            "Failed to create certificate"
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <DashboardLayout>
      <div
        className="
          flex
          flex-col
          gap-4
          lg:flex-row
          lg:items-center
          lg:justify-between
        "
      >
        <div>
          <button
            onClick={() =>
              navigate(
                "/certificates"
              )
            }
            className="
              mb-3
              flex
              items-center
              gap-2
              text-sm
              font-medium
              text-[var(--text-secondary)]
              transition-all
              duration-300
              hover:text-[var(--text-primary)]
            "
          >
            <ArrowLeft size={16} />
            Back to Certificates
          </button>

          <h1 className="text-3xl font-bold">
            Create Certificate
          </h1>

          <p className="mt-2 text-[var(--text-secondary)]">
            Add a new certificate or achievement.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="
            rounded-2xl
            bg-[var(--button-primary)]
            px-5
            py-3
            font-medium
            text-white
            transition-all
            duration-300
            hover:bg-[var(--button-primary-hover)]
            disabled:opacity-50
            dark:text-black
          "
        >
          {loading
            ? "Publishing..."
            : "Publish Certificate"}
        </button>
      </div>

      <div
        className="
          mt-8
          grid
          grid-cols-1
          gap-6
          xl:grid-cols-3
        "
      >
        <div className="xl:col-span-2">
          <div
            className="
              rounded-[32px]
              border
              border-[var(--border-color)]
              bg-[var(--bg-card)]
              p-6
            "
          >
            <div>
              <label className="mb-2 block text-sm font-medium">
                Title
              </label>

              <input
                type="text"
                value={title}
                onChange={(event) =>
                  setTitle(
                    event.target.value
                  )
                }
                placeholder="Enter title"
                className="
                  w-full
                  rounded-2xl
                  border
                  border-[var(--border-color)]
                  bg-[var(--bg-main)]
                  px-4
                  py-3
                  outline-none
                "
              />

              {slug && (
                <p className="mt-2 text-xs text-[var(--text-muted)]">
                  Slug: {slug}
                </p>
              )}
            </div>

            <div className="mt-6">
              <label className="mb-2 block text-sm font-medium">
                Type
              </label>

              <select
                value={type}
                onChange={(event) =>
                  setType(
                    event.target.value as
                      | "achievement"
                      | "certificate"
                  )
                }
                className="
                  w-full
                  rounded-2xl
                  border
                  border-[var(--border-color)]
                  bg-[var(--bg-main)]
                  px-4
                  py-3
                  outline-none
                "
              >
                <option value="certificate">
                  Certificate
                </option>
                <option value="achievement">
                  Achievement
                </option>
              </select>
            </div>

            <div className="mt-6">
              <label className="mb-2 block text-sm font-medium">
                Issued By
              </label>

              <input
                type="text"
                value={issuedBy}
                onChange={(event) =>
                  setIssuedBy(
                    event.target.value
                  )
                }
                placeholder="Google, Coursera, University, Event Name..."
                className="
                  w-full
                  rounded-2xl
                  border
                  border-[var(--border-color)]
                  bg-[var(--bg-main)]
                  px-4
                  py-3
                  outline-none
                "
              />
            </div>

            <div className="mt-6">
              <label className="mb-2 block text-sm font-medium">
                Issue Date
              </label>

              <div
                className="
                  flex
                  items-center
                  gap-3
                  rounded-2xl
                  border
                  border-[var(--border-color)]
                  bg-[var(--bg-main)]
                  px-4
                  py-3
                "
              >
                <Calendar size={18} />

                <input
                  type="date"
                  value={issueDate}
                  onChange={(event) =>
                    setIssueDate(
                      event.target.value
                    )
                  }
                  className="w-full bg-transparent outline-none"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="mb-2 block text-sm font-medium">
                Link
              </label>

              <input
                type="url"
                value={link}
                onChange={(event) =>
                  setLink(
                    event.target.value
                  )
                }
                placeholder="https://..."
                className={`
                  w-full
                  rounded-2xl
                  border
                  px-4
                  py-3
                  outline-none
                  ${
                    link && !isValidUrl(link)
                      ? "border-red-400"
                      : "border-[var(--border-color)]"
                  }
                  bg-[var(--bg-main)]
                `}
              />

              {link &&
                !isValidUrl(link) && (
                  <p className="mt-2 text-xs text-red-500">
                    Invalid URL format
                  </p>
                )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div
            className="
              rounded-[32px]
              border
              border-[var(--border-color)]
              bg-[var(--bg-card)]
              p-6
            "
          >
            <h2 className="text-lg font-semibold">
              Images
            </h2>

            <input
              type="file"
              id="images-upload"
              accept="image/*"
              multiple
              className="hidden"
              onChange={
                handleImageUpload
              }
            />

            <label
              htmlFor="images-upload"
              className="
                mt-5
                flex
                h-52
                cursor-pointer
                flex-col
                items-center
                justify-center
                rounded-3xl
                border-2
                border-dashed
                border-[var(--border-color)]
                bg-[var(--bg-main)]
                transition-all
                duration-300
                hover:border-[var(--button-primary)]
              "
            >
              <ImagePlus
                size={40}
                className="text-[var(--text-secondary)]"
              />
              <p className="mt-3 text-sm text-[var(--text-secondary)]">
                Click to upload multiple images
              </p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                PNG, JPG, WEBP
              </p>
            </label>

            {imagePreviews.length >
              0 && (
              <div className="mt-4 grid grid-cols-3 gap-3">
                {imagePreviews.map(
                  (
                    preview,
                    index
                  ) => (
                    <div
                      key={preview}
                      className="relative overflow-hidden rounded-xl"
                    >
                      <img
                        src={preview}
                        alt={`preview-${index + 1}`}
                        className="h-20 w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          removeImage(
                            index
                          )
                        }
                        className="
                          absolute
                          right-1
                          top-1
                          rounded-full
                          bg-black/70
                          p-1
                          text-white
                        "
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          <div
            className="
              rounded-[32px]
              border
              border-[var(--border-color)]
              bg-[var(--bg-card)]
              p-6
            "
          >
            <h2 className="text-lg font-semibold">
              Visibility
            </h2>

            <div className="mt-5 flex items-center justify-between">
              <div>
                <h3 className="font-medium">
                  {isVisible
                    ? "Public"
                    : "Private"}
                </h3>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  Show this certificate on public portfolio
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setIsVisible(
                    !isVisible
                  )
                }
                className={`
                  relative
                  h-7
                  w-12
                  rounded-full
                  transition-all
                  duration-300
                  ${
                    isVisible
                      ? "bg-[var(--button-primary)]"
                      : "bg-gray-300"
                  }
                `}
              >
                <div
                  className={`
                    absolute
                    top-1
                    h-5
                    w-5
                    rounded-full
                    bg-white
                    transition-all
                    duration-300
                    ${isVisible ? "right-1" : "left-1"}
                  `}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default CreateCertificate;
