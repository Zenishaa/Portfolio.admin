import {
  ArrowLeft,
  Calendar,
  ImagePlus,
  Plus,
  X,
} from "lucide-react";

import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { isAxiosError } from "axios";
import { toast } from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";

import { getExperience, updateExperience } from "@features/experience/services/experience.service";
import DashboardLayout from "@layouts/DashboardLayout";
import PageLoader from "@shared/components/ui/PageLoader";

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

const LINK_OPTIONS = [
  { label: "Company Website", value: "website" },
  { label: "GitHub Repo", value: "github" },
  { label: "LinkedIn Company", value: "linkedin" },
  { label: "Demo/Case Study", value: "demo" },
  { label: "Other", value: "other" },
];

function EditExperience() {
  const { slug: routeSlug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [pageLoading, setPageLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [company, setCompany] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [mode, setMode] = useState<"on-site" | "remote" | "hybrid">("on-site");
  
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isCurrent, setIsCurrent] = useState(false);

  const [links, setLinks] = useState<LinkItem[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [replaceImages, setReplaceImages] = useState(false);

  const isValidUrl = (url: string) => {
    if (!url.trim()) return true;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    const fetchExperienceData = async () => {
      if (!routeSlug) return;
      try {
        const res = await getExperience(routeSlug);
        if (res?.success && res.experience) {
          const exp = res.experience;
          setTitle(exp.title || "");
          setSlug(exp.slug || "");
          setCompany(exp.company || "");
          setDescription(exp.description || "");
          setLocation(exp.location || "");
          setMode(exp.mode || "on-site");
          setIsCurrent(exp.is_current || false);

          if (exp.start_date) {
            const start = new Date(exp.start_date);
            setStartDate(start.toISOString().split("T")[0]);
          }

          if (exp.end_date) {
            const end = new Date(exp.end_date);
            setEndDate(end.toISOString().split("T")[0]);
          }

          // Parse Links
          if (exp.links) {
            if (Array.isArray(exp.links)) {
              setLinks(exp.links);
            } else if (typeof exp.links === "string") {
              try {
                const parsed = JSON.parse(exp.links);
                if (Array.isArray(parsed)) setLinks(parsed);
              } catch { /* ignore */ }
            }
          }

          // Parse Images
          if (exp.images) {
            let imgList: string[] = [];
            if (Array.isArray(exp.images)) {
              imgList = exp.images;
            } else if (typeof exp.images === "string") {
              try {
                const parsed = JSON.parse(exp.images);
                if (Array.isArray(parsed)) imgList = parsed;
              } catch { /* ignore */ }
            }
            setExistingImages(imgList);
            setImagePreviews(imgList);
          }
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to load experience details");
      } finally {
        setPageLoading(false);
      }
    };

    fetchExperienceData();
  }, [routeSlug]);

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    if (!files.length) return;

    if (!replaceImages) {
      // Prompt replacement mode on update
      setReplaceImages(true);
      setImages(files);
      setImagePreviews(files.map((file) => URL.createObjectURL(file)));
    } else {
      const nextImages = [...images, ...files];
      const nextPreviews = [
        ...imagePreviews,
        ...files.map((file) => URL.createObjectURL(file)),
      ];
      setImages(nextImages);
      setImagePreviews(nextPreviews);
    }
  };

  const removeImage = (index: number) => {
    if (!replaceImages) {
      // If editing existing images, we transition to replacing the entire set
      setReplaceImages(true);
      const nextPreviews = [...existingImages];
      nextPreviews.splice(index, 1);
      
      // We will simulate "replacing" by pushing all remaining existing images except this one (but wait, 
      // the backend doesn't support keeping old URLs when sending new files unless we upload new images. 
      // So if the user wants to delete one image, they must re-upload the ones they want to keep. 
      // Let's explain this or set up images state correctly).
      setImages([]);
      setImagePreviews(nextPreviews);
      toast.success("Transitioned to edit mode. Please upload the new set of images you want for this role.");
      return;
    }

    const nextImages = [...images];
    const nextPreviews = [...imagePreviews];

    nextImages.splice(index, 1);
    nextPreviews.splice(index, 1);

    setImages(nextImages);
    setImagePreviews(nextPreviews);
  };

  const resetImages = () => {
    setReplaceImages(false);
    setImages([]);
    setImagePreviews(existingImages);
  };

  const addLink = () => {
    setLinks([...links, { key: "", value: "" }]);
  };

  const updateLink = (index: number, field: "key" | "value", val: string) => {
    const updatedLinks = [...links];
    updatedLinks[index] = {
      ...updatedLinks[index],
      [field]: val,
    };
    setLinks(updatedLinks);
  };

  const removeLink = (index: number) => {
    const updatedLinks = [...links];
    updatedLinks.splice(index, 1);
    setLinks(updatedLinks);
  };

  const handleSubmit = async () => {
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

    // Validate links
    for (const link of links) {
      if (!link.key) {
        toast.error("Please select a label for all links");
        return;
      }
      if (!link.value.trim() || !isValidUrl(link.value)) {
        toast.error(`Invalid URL for link label: ${link.key}`);
        return;
      }
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
      
      // Handle date updates
      if (isCurrent) {
        formData.append("end_date", "");
      } else if (endDate) {
        formData.append("end_date", endDate);
      }

      // Append links
      const activeLinks = links.filter((l) => l.key && l.value.trim());
      formData.append("links", JSON.stringify(activeLinks));

      // Append images if they have been updated/replaced
      if (replaceImages) {
        images.forEach((image) => {
          formData.append("images", image);
        });
      }

      const response = await updateExperience(routeSlug!, formData);

      if (response?.success) {
        toast.success(response.message || "Experience updated successfully");
        navigate("/experience");
      }
    } catch (error) {
      console.error(error);
      const message = isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;

      toast.error(message || "Failed to update experience");
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return <PageLoader />;
  }

  return (
    <DashboardLayout>
      {/* TOP HEADER */}
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

          <h1 className="text-3xl font-bold">Edit Experience</h1>
          <p className="mt-2 text-[var(--text-secondary)]">
            Update your professional experience details.
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
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* FORM LAYOUT */}
      <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Left Side fields */}
        <div className="xl:col-span-2">
          <div className="rounded-[32px] border border-[var(--border-color)] bg-[var(--bg-card)] p-6">
            
            {/* JOB TITLE */}
            <div>
              <label className="mb-2 block text-sm font-medium">Job Title *</label>
              <input
                required
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setSlug(createSlug(e.target.value));
                }}
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
                placeholder="e.g. Google, Stripe"
                className="w-full rounded-2xl border border-[var(--border-color)] bg-[var(--bg-main)] px-4 py-3 outline-none"
              />
            </div>

            {/* DESCRIPTION */}
            <div className="mt-6">
              <label className="mb-2 block text-sm font-medium">Job Description</label>
              <textarea
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Outline your accomplishments, tech stack used, and daily responsibilities..."
                className="w-full rounded-2xl border border-[var(--border-color)] bg-[var(--bg-main)] px-4 py-3 outline-none"
              />
            </div>

            {/* LOCATION & MODE ROW */}
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. San Francisco, CA"
                  className="w-full rounded-2xl border border-[var(--border-color)] bg-[var(--bg-main)] px-4 py-3 outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Work Mode</label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value as any)}
                  className="w-full rounded-2xl border border-[var(--border-color)] bg-[var(--bg-main)] px-4 py-3 outline-none"
                >
                  <option value="on-site">On-site</option>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
            </div>

            {/* DATES ROW */}
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">Start Date *</label>
                <div className="flex items-center gap-3 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-main)] px-4 py-3">
                  <Calendar size={18} className="text-[var(--text-muted)]" />
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-transparent outline-none"
                  />
                </div>
              </div>

              {!isCurrent && (
                <div>
                  <label className="mb-2 block text-sm font-medium">End Date</label>
                  <div className="flex items-center gap-3 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-main)] px-4 py-3">
                    <Calendar size={18} className="text-[var(--text-muted)]" />
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-transparent outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* IS CURRENT OPTION */}
            <div className="mt-4 flex items-center gap-2">
              <input
                type="checkbox"
                id="isCurrentExp"
                checked={isCurrent}
                onChange={(e) => setIsCurrent(e.target.checked)}
                className="h-4 w-4 rounded border-[var(--border-color)] accent-[var(--button-primary)]"
              />
              <label htmlFor="isCurrentExp" className="text-sm font-medium cursor-pointer">
                I am currently working in this role
              </label>
            </div>

          </div>
        </div>

        {/* Right Side Fields: Images, Links */}
        <div className="space-y-6">
          
          {/* IMAGES UPLOAD */}
          <div className="rounded-[32px] border border-[var(--border-color)] bg-[var(--bg-card)] p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Workspace Photos</h2>
              {replaceImages && (
                <button
                  type="button"
                  onClick={resetImages}
                  className="text-xs font-semibold text-[var(--button-primary)] hover:underline"
                >
                  Undo Changes
                </button>
              )}
            </div>
            
            <input
              type="file"
              id="experience-images"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageUpload}
            />

            <label
              htmlFor="experience-images"
              className="
                mt-5
                flex
                h-48
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
              <ImagePlus size={36} className="text-[var(--text-secondary)]" />
              <p className="mt-3 text-sm text-[var(--text-secondary)]">Click to upload photos</p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">PNG, JPG, WEBP</p>
            </label>

            {replaceImages && (
              <p className="mt-2 text-xs text-amber-500 font-medium">
                Note: Uploading new photos will overwrite the existing ones.
              </p>
            )}

            {imagePreviews.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-2">
                {imagePreviews.map((preview, index) => (
                  <div key={preview} className="relative overflow-hidden rounded-xl">
                    <img
                      src={preview}
                      alt={`Workspace photo ${index + 1}`}
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

          {/* EXPERIENCE LINKS */}
          <div className="rounded-[32px] border border-[var(--border-color)] bg-[var(--bg-card)] p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Links</h2>
              <button
                type="button"
                onClick={addLink}
                className="flex items-center gap-1.5 rounded-xl bg-[var(--button-primary)] px-3 py-1.5 text-xs font-semibold text-white dark:text-black"
              >
                <Plus size={14} /> Add Link
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {links.map((link, index) => {
                const selectedKeys = links.map((l) => l.key);
                return (
                  <div key={index} className="flex flex-col gap-2 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-main)] p-3">
                    <div className="flex items-center gap-2">
                      <select
                        value={link.key}
                        onChange={(e) => updateLink(index, "key", e.target.value)}
                        className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-2 text-xs outline-none"
                      >
                        <option value="">Label</option>
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

                      <button
                        type="button"
                        onClick={() => removeLink(index)}
                        className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 border border-red-200 shrink-0"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    <input
                      type="url"
                      value={link.value}
                      onChange={(e) => updateLink(index, "value", e.target.value)}
                      placeholder="https://..."
                      className={`w-full rounded-xl border px-3 py-2 text-xs outline-none bg-[var(--bg-card)] ${
                        link.value && !isValidUrl(link.value)
                          ? "border-red-400"
                          : "border-[var(--border-color)]"
                      }`}
                    />
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}

export default EditExperience;
