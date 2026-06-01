import {
  Calendar,
  ImagePlus,
  Plus,
  X,
  ArrowLeft,
} from "lucide-react";

import {
  useState,
} from "react";

import type {
  ChangeEvent,
} from "react";

import {
  createProject,
} from "@features/projects/services/project.service";

import { toast } from "react-hot-toast";
import { isAxiosError } from "axios";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "@layouts/DashboardLayout";

const LINK_OPTIONS = [
  { value: "github", label: "GitHub" },
  { value: "live", label: "Live Demo" },
  { value: "figma", label: "Figma" },
  { value: "youtube", label: "YouTube" },
  { value: "docs", label: "Documentation" },
];

const createSlug = (
  value: string
) =>
  value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");

function CreateProject() {
  const navigate = useNavigate();

  /* =========================
      MAIN STATES
  ========================= */

  const [title, setTitle] = useState("");

  const slug = createSlug(title);

  const [
    description,
    setDescription,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    publisher,
    setPublisher,
  ] = useState("");

  const [type, setType] = useState("project");

  const [status, setStatus] = useState("ongoing");

  const [
    featured,
    setFeatured,
  ] = useState(false);

  const [dateTime, setDateTime] = useState("");

  /* =========================
      THUMBNAIL
  ========================= */

  const [thumbnail, setThumbnail] = useState<File | null>(null);

  const [
    thumbnailPreview,
    setThumbnailPreview,
  ] = useState("");

  /* =========================
      TAGS
  ========================= */

  const [tags, setTags] = useState<
    string[]
  >([]);

  const [tagInput, setTagInput] = useState("");

  /* =========================
      CONTRIBUTORS
  ========================= */

  const [
    contributors,
    setContributors,
  ] = useState<string[]>([]);

  const [
    contributorInput,
    setContributorInput,
  ] = useState("");

  /* =========================
      LINKS
  ========================= */

  const [links, setLinks] =
    useState([
      {
        key: "github",
        value: "",
      },
    ]);

  /* =========================
      URL VALIDATION
  ========================= */

  const isValidUrl = (
    url: string
  ) => {
    try {
      new URL(url);

      return true;
    } catch {
      return false;
    }
  };

  /* =========================
      TAG FUNCTIONS
  ========================= */

  const addTag = () => {
    if (
      tagInput.trim() &&
      !tags.includes(tagInput)
    ) {
      setTags([
        ...tags,
        tagInput.trim(),
      ]);

      setTagInput("");
    }
  };

  const removeTag = (
    tag: string
  ) => {
    setTags(
      tags.filter(
        (t) => t !== tag
      )
    );
  };

  /* =========================
      CONTRIBUTOR FUNCTIONS
  ========================= */

  const addContributor = () => {
    if (
      contributorInput.trim()
    ) {
      setContributors([
        ...contributors,
        contributorInput.trim(),
      ]);

      setContributorInput("");
    }
  };

  const removeContributor = (
    contributor: string
  ) => {
    setContributors(
      contributors.filter(
        (c) =>
          c !== contributor
      )
    );
  };

  /* =========================
      LINK FUNCTIONS
  ========================= */

  const addLink = () => {
    setLinks([
      ...links,
      {
        key: "github",
        value: "",
      },
    ]);
  };

  const updateLink = (
    index: number,
    field: string,
    value: string
  ) => {
    const updatedLinks = [
      ...links,
    ];

    updatedLinks[index] = {
      ...updatedLinks[index],
      [field]: value,
    };

    setLinks(updatedLinks);
  };

  const removeLink = (
    index: number
  ) => {
    const updatedLinks = [
      ...links,
    ];

    updatedLinks.splice(index, 1);

    setLinks(updatedLinks);
  };

  /* =========================
      THUMBNAIL
  ========================= */

  const handleThumbnailUpload = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      e.target.files?.[0];

    if (file) {
      setThumbnail(file);

      const imageUrl =
        URL.createObjectURL(file);

      setThumbnailPreview(
        imageUrl
      );
    }
  };

const handleSubmit = async (
  e?: React.FormEvent
) => {

  if (e) {
    e.preventDefault();
  }

  if (!title.trim()) {

    toast.error(
      "Project title is required"
    );

    return;
  }

  if (!slug.trim()) {

    toast.error(
      "Project slug is required"
    );

    return;
  }

  if (!description.trim()) {

    toast.error(
      "Project description is required"
    );

    return;
  }

  const invalidLink =
    links.find(
      (link) =>
        link.value &&
        !isValidUrl(
          link.value
        )
    );

  if (invalidLink) {

    toast.error(
      `Invalid URL in ${invalidLink.key}`
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
      "description",
      description.trim()
    );

    formData.append(
      "publisher",
      publisher.trim()
    );

    formData.append(
      "status",
      status
    );

    formData.append(
      "type",
      type
    );

    formData.append(
      "featured",
      String(featured)
    );

    if (dateTime) {

      formData.append(
        "date_time",
        dateTime
      );
    }

    formData.append(
      "authors_contributors",
      JSON.stringify(
        contributors
      )
    );

    formData.append(
      "tags",
      JSON.stringify(
        tags
      )
    );

    formData.append(
      "links",
      JSON.stringify(
        links.filter(
          (link) =>
            link.value.trim()
        )
      )
    );

    if (thumbnail) {

      formData.append(
        "thumbnail",
        thumbnail
      );
    }

    const response =
      await createProject(
        formData
      );

    if (
      response?.success
    ) {

      toast.success(
        response.message ||
        "Project created successfully"
      );

      navigate("/projects");
    }

  } catch (error: unknown) {

    console.error(
      error
    );

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
      "Failed to create project"
    );

  } finally {

    setLoading(false);
  }
};

  return (
    <DashboardLayout>

      {/* =========================
          HEADER
      ========================= */}

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
            onClick={() => navigate("/projects")}
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
            Back to Projects
          </button>

          <h1
            className="
              text-3xl
              font-bold
            "
          >
            Create Project
          </h1>

          <p
            className="
              mt-2
              text-[var(--text-secondary)]
            "
          >
            Create and publish a new
            portfolio project.
          </p>

        </div>

        {/* Publish */}

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
          {
            loading
              ? "Publishing..."
              : "Publish Project"
          }
        </button>

      </div>

      {/* =========================
          MAIN GRID
      ========================= */}

      <div
        className="
          mt-8
          grid
          grid-cols-1
          gap-6
          xl:grid-cols-3
        "
      >
        {/* =========================
            LEFT
        ========================= */}

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
            {/* TITLE */}

            <div>

              <label
                className="
                  mb-2
                  block
                  text-sm
                  font-medium
                "
              >
                Project Title *
              </label>

              <input
                required
                type="text"
                value={title}
                onChange={(e) =>
                  setTitle(
                    e.target.value
                  )
                }
                placeholder="Enter project title"
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

            {/* DESCRIPTION */}

            <div className="mt-6">

              <label
                className="
                  mb-2
                  block
                  text-sm
                  font-medium
                "
              >
                Description *
              </label>

              <textarea
                required
                rows={7}
                value={description}
                onChange={(e) =>
                  setDescription(
                    e.target.value
                  )
                }
                placeholder="Write project description..."
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

            {/* CONTRIBUTORS */}

            <div className="mt-6">

              <label
                className="
                  mb-3
                  block
                  text-sm
                  font-medium
                "
              >
                Authors / Contributors
              </label>

              <div className="flex gap-3">

                <input
                  type="text"
                  value={
                    contributorInput
                  }
                  onChange={(e) =>
                    setContributorInput(
                      e.target.value
                    )
                  }
                  placeholder="Add contributor"
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

                <button
                  type="button"
                  onClick={
                    addContributor
                  }
                  className="
                    flex
                    items-center
                    justify-center
                    rounded-2xl
                    bg-[var(--button-primary)]
                    px-5
                    text-white
                    dark:text-black
                  "
                >
                  <Plus size={18} />
                </button>

              </div>

              {/* Contributors */}

              <div
                className="
                  mt-4
                  flex
                  flex-wrap
                  gap-3
                "
              >
                {contributors.map(
                  (
                    contributor,
                    index
                  ) => (
                    <div
                      key={index}
                      className="
                        flex
                        items-center
                        gap-2
                        rounded-full
                        bg-[var(--bg-secondary)]
                        px-4
                        py-2
                        text-sm
                      "
                    >
                      {contributor}

                      <button
                        type="button"
                        onClick={() =>
                          removeContributor(
                            contributor
                          )
                        }
                      >
                        <X size={14} />
                      </button>

                    </div>
                  )
                )}
              </div>

            </div>

            {/* TAGS */}

            <div className="mt-6">

              <label
                className="
                  mb-3
                  block
                  text-sm
                  font-medium
                "
              >
                Technologies / Tags
              </label>

              <div className="flex gap-3">

                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) =>
                    setTagInput(
                      e.target.value
                    )
                  }
                  placeholder="Add tag"
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

                <button
                  type="button"
                  onClick={addTag}
                  className="
                    flex
                    items-center
                    justify-center
                    rounded-2xl
                    bg-[var(--button-primary)]
                    px-5
                    text-white
                    dark:text-black
                  "
                >
                  <Plus size={18} />
                </button>

              </div>

              {/* Tags */}

              <div
                className="
                  mt-4
                  flex
                  flex-wrap
                  gap-3
                "
              >
                {tags.map(
                  (
                    tag,
                    index
                  ) => (
                    <div
                      key={index}
                      className="
                        flex
                        items-center
                        gap-2
                        rounded-full
                        bg-[var(--bg-secondary)]
                        px-4
                        py-2
                        text-sm
                      "
                    >
                      {tag}

                      <button
                        type="button"
                        onClick={() =>
                          removeTag(
                            tag
                          )
                        }
                      >
                        <X size={14} />
                      </button>

                    </div>
                  )
                )}
              </div>

            </div>

            {/* LINKS */}

            <div className="mt-6">

              <div
                className="
                  mb-3
                  flex
                  items-center
                  justify-between
                "
              >
                <label
                  className="
                    text-sm
                    font-medium
                  "
                >
                  Project Links *
                </label>

                <button
                  type="button"
                  onClick={addLink}
                  className="
                    flex
                    items-center
                    gap-2
                    rounded-xl
                    bg-[var(--button-primary)]
                    px-4
                    py-2
                    text-sm
                    font-medium
                    text-white
                    dark:text-black
                  "
                >
                  <Plus size={16} />

                  Add Link
                </button>

              </div>

              <div className="space-y-4">

                {links.map(
                  (
                    link,
                    index
                  ) => {
                    const selectedKeys = links.map(l => l.key);
                    
                    return (
                    <div
                      key={index}
                      className="
                        grid
                        grid-cols-1
                        gap-4
                        rounded-2xl
                        border
                        border-[var(--border-color)]
                        bg-[var(--bg-main)]
                        p-4
                        md:grid-cols-12
                      "
                    >
                      {/* Key */}

                      <div className="md:col-span-3">

                        <select
                          value={
                            link.key
                          }
                          onChange={(e) =>
                            updateLink(
                              index,
                              "key",
                              e.target
                                .value
                            )
                          }
                          className="
                            w-full
                            rounded-xl
                            border
                            border-[var(--border-color)]
                            bg-[var(--bg-card)]
                            px-4
                            py-3
                            outline-none
                          "
                        >
                          <option value="">
                            Select
                          </option>
                          {LINK_OPTIONS.map((opt) => {
                            const isUsed = selectedKeys.includes(opt.value);
                            const isThis = link.key === opt.value;
                            if (isUsed && !isThis) return null;
                            return (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            );
                          })}
                        </select>

                      </div>

                      {/* URL */}

                      <div className="md:col-span-8">

                        <input
                          required
                          type="url"
                          value={
                            link.value
                          }
                          onChange={(e) =>
                            updateLink(
                              index,
                              "value",
                              e.target
                                .value
                            )
                          }
                          placeholder="Enter URL"
                          className={`
                            w-full
                            rounded-xl
                            border
                            px-4
                            py-3
                            outline-none
                            ${
                              link.value &&
                              !isValidUrl(
                                link.value
                              )
                                ? "border-red-400"
                                : "border-[var(--border-color)]"
                            }
                            bg-[var(--bg-card)]
                          `}
                        />

                        {link.value &&
                          !isValidUrl(
                            link.value
                          ) && (
                            <p
                              className="
                                mt-2
                                text-xs
                                text-red-500
                              "
                            >
                              Invalid URL format
                            </p>
                          )}

                      </div>

                      {/* Delete */}

                      <button
                        type="button"
                        onClick={() =>
                          removeLink(
                            index
                          )
                        }
                        className="
                          flex
                          items-center
                          justify-center
                          rounded-xl
                          border
                          border-red-200
                          text-red-500
                          transition-all
                          duration-300
                          hover:bg-red-50
                        "
                      >
                        <X size={18} />
                      </button>

                    </div>
                  )
                })}

              </div>

            </div>

          </div>
        </div>

        {/* RIGHT SIDE */}

        <div className="space-y-6">

          {/* THUMBNAIL */}

          <div
            className="
              rounded-[32px]
              border
              border-[var(--border-color)]
              bg-[var(--bg-card)]
              p-6
            "
          >
            <h2
              className="
                text-lg
                font-semibold
              "
            >
              Thumbnail *
            </h2>

            <input
              type="file"
              id="thumbnail-upload"
              accept="image/*"
              className="hidden"
              onChange={
                handleThumbnailUpload
              }
            />

            <label
              htmlFor="thumbnail-upload"
              className="
                mt-5
                flex
                h-64
                cursor-pointer
                flex-col
                items-center
                justify-center
                overflow-hidden
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
              {thumbnailPreview ? (
                <img
                  src={
                    thumbnailPreview
                  }
                  alt="Thumbnail"
                  className="
                    h-full
                    w-full
                    object-cover
                  "
                />
              ) : (
                <>
                  <ImagePlus
                    size={42}
                    className="
                      text-[var(--text-secondary)]
                    "
                  />

                  <p
                    className="
                      mt-4
                      text-sm
                      text-[var(--text-secondary)]
                    "
                  >
                    Click to upload
                    thumbnail
                  </p>

                  <p
                    className="
                      mt-1
                      text-xs
                      text-[var(--text-muted)]
                    "
                  >
                    PNG, JPG, WEBP
                  </p>
                </>
              )}
            </label>

          </div>

          {/* SETTINGS */}

          <div
            className="
              rounded-[32px]
              border
              border-[var(--border-color)]
              bg-[var(--bg-card)]
              p-6
            "
          >
            <h2
              className="
                text-lg
                font-semibold
              "
            >
              Project Settings
            </h2>

            {/* TYPE */}

            <div className="mt-5">

              <label
                className="
                  mb-2
                  block
                  text-sm
                  font-medium
                "
              >
                Type *
              </label>

              <select
                required
                value={type}
                onChange={(e) => {
                  const selectedType =
                    e.target.value;

                  setType(
                    selectedType
                  );

                  if (
                    selectedType ===
                    "project"
                  ) {
                    setStatus(
                      "ongoing"
                    );
                  }

                  if (
                    selectedType ===
                    "research"
                  ) {
                    setStatus(
                      "published"
                    );
                  }
                }}
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
                <option value="project">
                  Project
                </option>

                <option value="research">
                  Research
                </option>
              </select>

            </div>

            {/* STATUS */}

            <div className="mt-5">

              <label
                className="
                  mb-2
                  block
                  text-sm
                  font-medium
                "
              >
                Status *
              </label>

              <select
                required
                value={status}
                onChange={(e) =>
                  setStatus(
                    e.target.value
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
                {type ===
                  "project" && (
                  <>
                    <option value="ongoing">
                      Ongoing
                    </option>

                    <option value="completed">
                      Completed
                    </option>
                  </>
                )}

                {type ===
                  "research" && (
                  <>
                    <option value="published">
                      Published
                    </option>

                    <option value="drafted">
                      Drafted
                    </option>

                    <option value="underreview">
                      Under Review
                    </option>
                  </>
                )}
              </select>

            </div>

            {/* PUBLISHER */}

            {type ===
              "research" && (
              <div className="mt-5">

                <label
                  className="
                    mb-2
                    block
                    text-sm
                    font-medium
                  "
                >
                  Publisher Name
                </label>

                <input
                  type="text"
                  value={publisher}
                  onChange={(e) =>
                    setPublisher(
                      e.target
                        .value
                    )
                  }
                  placeholder="IEEE, Springer..."
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
            )}

            {/* DATE FIELD */}

            {type ===
              "project" &&
              status ===
                "completed" && (
                <div className="mt-5">

                  <label
                    className="
                      mb-2
                      block
                      text-sm
                      font-medium
                    "
                  >
                    Completion Date
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
                    <Calendar
                      size={18}
                    />

                    <input
                      type="date"
                      value={
                        dateTime
                      }
                      onChange={(
                        e
                      ) =>
                        setDateTime(
                          e.target
                            .value
                        )
                      }
                      className="
                        w-full
                        bg-transparent
                        outline-none
                      "
                    />

                  </div>

                </div>
              )}

            {type ===
              "research" &&
              status ===
                "published" && (
                <div className="mt-5">

                  <label
                    className="
                      mb-2
                      block
                      text-sm
                      font-medium
                    "
                  >
                    Published Date
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
                    <Calendar
                      size={18}
                    />

                    <input
                      type="date"
                      value={
                        dateTime
                      }
                      onChange={(
                        e
                      ) =>
                        setDateTime(
                          e.target
                            .value
                        )
                      }
                      className="
                        w-full
                        bg-transparent
                        outline-none
                      "
                    />

                  </div>

                </div>
              )}

            {type ===
              "research" &&
              status ===
                "underreview" && (
                <div className="mt-5">

                  <label
                    className="
                      mb-2
                      block
                      text-sm
                      font-medium
                    "
                  >
                    Submitted Date
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
                    <Calendar
                      size={18}
                    />

                    <input
                      type="date"
                      value={
                        dateTime
                      }
                      onChange={(
                        e
                      ) =>
                        setDateTime(
                          e.target
                            .value
                        )
                      }
                      className="
                        w-full
                        bg-transparent
                        outline-none
                      "
                    />

                  </div>

                </div>
              )}

            {/* FEATURED */}

            <div
              className="
                mt-6
                flex
                items-center
                justify-between
              "
            >
              <div>

                <h3 className="font-medium">
                  Featured Project
                </h3>

                <p
                  className="
                    mt-1
                    text-sm
                    text-[var(--text-secondary)]
                  "
                >
                  Highlight publicly
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setFeatured(
                    !featured
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
                    featured
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
                    ${
                      featured
                        ? "right-1"
                        : "left-1"
                    }
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

export default CreateProject;
