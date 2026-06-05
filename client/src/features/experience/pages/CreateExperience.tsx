import {
  ArrowLeft,
  Calendar,
  ImagePlus,
  Plus,
  X,
} from "lucide-react";

import { useState } from "react";
import type { ChangeEvent } from "react";
import { isAxiosError } from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import { createExperience } from "@features/experience/services/experience.service";
import DashboardLayout from "@layouts/DashboardLayout";

const LINK_OPTIONS = [
  { value: "website", label: "Company Website" },
  { value: "github", label: "GitHub Repo" },
  { value: "linkedin", label: "LinkedIn Company" },
  { value: "demo", label: "Demo/Case Study" },
  { value: "other", label: "Other" },
];

const createSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");

interface LinkItem {
  key: string;
  value: string;
}

function CreateExperience() {
  const navigate = useNavigate();

  /* =========================
      MAIN STATES
  ========================= */
  const [title, setTitle] = useState("");
  const slug = createSlug(title);

  const [company, setCompany] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState("");
  const [mode, setMode] = useState<"on-site" | "remote" | "hybrid">("on-site");
  
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isCurrent, setIsCurrent] = useState(false);

  /* =========================
      WORKSPACE PHOTOS
  ========================= */
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  /* =========================
      LINKS
  ========================= */
  const [links, setLinks] = useState<LinkItem[]>([
    {
      key: "website",
      value: "",
    },
  ]);

  /* =========================
      URL VALIDATION
  ========================= */
  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  /* =========================
      IMAGE FUNCTIONS
  ========================= */
  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    if (!files.length) return;

    const nextImages = [...images, ...files];
    const nextPreviews = [
      ...imagePreviews,
      ...files.map((file) => URL.createObjectURL(file)),
    ];

    setImages(nextImages);
    setImagePreviews(nextPreviews);
  };

  const removeImage = (index: number) => {
    const nextImages = [...images];
    const nextPreviews = [...imagePreviews];

    nextImages.splice(index, 1);
    nextPreviews.splice(index, 1);

    setImages(nextImages);
    setImagePreviews(nextPreviews);
  };

  /* =========================
      LINK FUNCTIONS
  ========================= */
  const addLink = () => {
    setLinks([
      ...links,
      {
        key: "website",
        value: "",
      },
    ]);
  };

  const updateLink = (index: number, field: string, value: string) => {
    const updatedLinks = [...links];
    updatedLinks[index] = {
      ...updatedLinks[index],
      [field]: value,
    };
    setLinks(updatedLinks);
  };

  const removeLink = (index: number) => {
    const updatedLinks = [...links];
    updatedLinks.splice(index, 1);
    setLinks(updatedLinks);
  };

  /* =========================
      SUBMIT
  ========================= */
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!title.trim()) {
      toast.error("Job title is required");
      return;
    }

    if (!company.trim()) {
      toast.error("Company name is required");
      return;
    }

    if (!slug.trim()) {
      toast.error("Experience slug is required");
      return;
    }

    if (!startDate) {
      toast.error("Start date is required");
      return;
    }

    if (!isCurrent && endDate && new Date(startDate) > new Date(endDate)) {
      toast.error("Start date cannot be after end date");
      return;
    }

    const invalidLink = links.find(
      (link) => link.value && !isValidUrl(link.value)
    );

    if (invalidLink) {
      toast.error(`Invalid URL in ${invalidLink.key}`);
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("slug", slug.trim());
      formData.append("company", company.trim());
      formData.append("description", description.trim());
      formData.append("location", location.trim() || "");
      formData.append("mode", mode);
      formData.append("start_date", startDate);
      formData.append("is_current", String(isCurrent));
      
      if (!isCurrent && endDate) {
        formData.append("end_date", endDate);
      }

      formData.append(
        "links",
        JSON.stringify(
          links.filter((link) => link.value.trim())
        )
      );

      images.forEach((image) => {
        formData.append("images", image);
      });

      const response = await createExperience(formData);

      if (response?.success) {
        toast.success(response.message || "Experience created successfully");
        navigate("/experience");
      }
    } catch (error: unknown) {
      console.error(error);
      const message = isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;

      toast.error(message || "Failed to create experience");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      {/* =========================
          HEADER
      ========================= */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <button
            onClick={() => navigate("/experience")}
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
            Back to Experience
          </button>

          <h1 className="text-3xl font-bold">Add Experience</h1>
          <p className="mt-2 text-[var(--text-secondary)]">
            Add a new professional position to your profile.
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
          {loading ? "Publishing..." : "Publish Experience"}
        </button>
      </div>

      {/* =========================
          MAIN GRID
      ========================= */}
      <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* =========================
            LEFT COLUMN
        ========================= */}
        <div className="xl:col-span-2">
          <div className="rounded-[32px] border border-[var(--border-color)] bg-[var(--bg-card)] p-6">
            
            {/* JOB TITLE */}
            <div>
              <label className="mb-2 block text-sm font-medium">Job Title *</label>
              <input
                required
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Software Engineer"
                className="w-full rounded-2xl border border-[var(--border-color)] bg-[var(--bg-main)] px-4 py-3 outline-none"
              />
              {slug && (
                <p className="mt-2 text-xs text-[var(--text-muted)]">
                  Slug: {slug}
                </p>
              )}
            </div>

            {/* COMPANY NAME */}
            <div className="mt-6">
              <label className="mb-2 block text-sm font-medium">Company Name *</label>
              <input
                required
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Google, Reliance"
                className="w-full rounded-2xl border border-[var(--border-color)] bg-[var(--bg-main)] px-4 py-3 outline-none"
              />
            </div>

            {/* JOB DESCRIPTION */}
            <div className="mt-6">
              <label className="mb-2 block text-sm font-medium">Job Description</label>
              <textarea
                rows={7}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Outline your accomplishments, tech stack used, and daily responsibilities..."
                className="w-full rounded-2xl border border-[var(--border-color)] bg-[var(--bg-main)] px-4 py-3 outline-none"
              />
            </div>

            {/* LINKS */}
            <div className="mt-6 border-t border-[var(--border-color)] pt-6">
              <div className="mb-3 flex items-center justify-between">
                <label className="text-sm font-medium">Experience Links</label>
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
                {links.map((link, index) => {
                  const selectedKeys = links.map((l) => l.key);
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
                      {/* Label Key */}
                      <div className="md:col-span-3">
                        <select
                          value={link.key}
                          onChange={(e) => updateLink(index, "key", e.target.value)}
                          className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-3 outline-none"
                        >
                          <option value="">Select</option>
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

                      {/* URL Value */}
                      <div className="md:col-span-8">
                        <input
                          required
                          type="url"
                          value={link.value}
                          onChange={(e) => updateLink(index, "value", e.target.value)}
                          placeholder="Enter URL"
                          className={`
                            w-full
                            rounded-xl
                            border
                            px-4
                            py-3
                            outline-none
                            ${
                              link.value && !isValidUrl(link.value)
                                ? "border-red-400"
                                : "border-[var(--border-color)]"
                            }
                            bg-[var(--bg-card)]
                          `}
                        />
                        {link.value && !isValidUrl(link.value) && (
                          <p className="mt-2 text-xs text-red-500">Invalid URL format</p>
                        )}
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => removeLink(index)}
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
                          md:col-span-1
                        "
                      >
                        <X size={18} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

        {/* =========================
            RIGHT COLUMN
        ========================= */}
        <div className="space-y-6">
          
          {/* WORKSPACE PHOTOS */}
          <div className="rounded-[32px] border border-[var(--border-color)] bg-[var(--bg-card)] p-6">
            <h2 className="text-lg font-semibold">Workspace Photos</h2>
            <input
              type="file"
              id="experience-photos-upload"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageUpload}
            />

            <label
              htmlFor="experience-photos-upload"
              className="
                mt-5
                flex
                h-56
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
              <ImagePlus size={40} className="text-[var(--text-secondary)]" />
              <p className="mt-3 text-sm text-[var(--text-secondary)]">Click to upload photos</p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">PNG, JPG, WEBP</p>
            </label>

            {imagePreviews.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-2">
                {imagePreviews.map((preview, index) => (
                  <div key={preview} className="relative overflow-hidden rounded-xl">
                    <img
                      src={preview}
                      alt={`workspace-${index}`}
                      className="h-16 w-full object-cover border border-[var(--border-color)]"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute right-1 top-1 rounded-full bg-black/70 p-0.5 text-white"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* EXPERIENCE SETTINGS */}
          <div className="rounded-[32px] border border-[var(--border-color)] bg-[var(--bg-card)] p-6">
            <h2 className="text-lg font-semibold">Experience Settings</h2>

            {/* WORK MODE */}
            <div className="mt-5">
              <label className="mb-2 block text-sm font-medium">Work Mode</label>
              <select
                required
                value={mode}
                onChange={(e) => setMode(e.target.value as any)}
                className="w-full rounded-2xl border border-[var(--border-color)] bg-[var(--bg-main)] px-4 py-3 outline-none"
              >
                <option value="on-site">On-site</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>

            {/* LOCATION */}
            <div className="mt-5">
              <label className="mb-2 block text-sm font-medium">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. San Francisco, CA"
                className="w-full rounded-2xl border border-[var(--border-color)] bg-[var(--bg-main)] px-4 py-3 outline-none"
              />
            </div>

            {/* START DATE */}
            <div className="mt-5">
              <label className="mb-2 block text-sm font-medium">Start Date *</label>
              <div className="flex items-center gap-3 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-main)] px-4 py-3">
                <Calendar size={18} />
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-transparent outline-none"
                />
              </div>
            </div>

            {/* END DATE */}
            {!isCurrent && (
              <div className="mt-5">
                <label className="mb-2 block text-sm font-medium">End Date</label>
                <div className="flex items-center gap-3 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-main)] px-4 py-3">
                  <Calendar size={18} />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-transparent outline-none"
                  />
                </div>
              </div>
            )}

            {/* CURRENT ROLE TOGGLE */}
            <div className="mt-6 flex items-center justify-between border-t border-[var(--border-color)] pt-6">
              <div>
                <h3 className="font-medium">Current Role</h3>
                <p className="mt-1 text-xs text-[var(--text-secondary)]">
                  I currently work here
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsCurrent(!isCurrent)}
                className={`
                  relative
                  h-7
                  w-12
                  rounded-full
                  transition-all
                  duration-300
                  ${isCurrent ? "bg-[var(--button-primary)]" : "bg-gray-300"}
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
                    ${isCurrent ? "right-1" : "left-1"}
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

export default CreateExperience;
