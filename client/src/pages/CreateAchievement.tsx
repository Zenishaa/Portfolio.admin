import { Calendar, ImagePlus, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";

import DashboardLayout from "../layouts/DashboardLayout";

function CreateAchievement() {
  const [title, setTitle] = useState("");

  // Slug is auto-generated from title and hidden from UI
  const [slug, setSlug] = useState("");

  const [type, setType] = useState<"achievement" | "certificate">("achievement");
  const [issuedBy, setIssuedBy] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [link, setLink] = useState("");
  const [isVisible, setIsVisible] = useState(true);

  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    const generatedSlug = title
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "");

    setSlug(generatedSlug);
  }, [title]);

  const isValidUrl = (url: string) => {
    if (!url.trim()) return true;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
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
          <h1 className="text-3xl font-bold">Create Achievement</h1>
          <p className="mt-2 text-[var(--text-secondary)]">
            Add a new achievement or certificate.
          </p>
        </div>

        <button
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
            dark:text-black
          "
        >
          Publish Achievement
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
              <label className="mb-2 block text-sm font-medium">Title *</label>
              <input
                required
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
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
            </div>

            <div className="mt-6">
              <label className="mb-2 block text-sm font-medium">Type *</label>
              <select
                value={type}
                onChange={(e) =>
                  setType(e.target.value as "achievement" | "certificate")
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
                <option value="achievement">Achievement</option>
                <option value="certificate">Certificate</option>
              </select>
            </div>

            <div className="mt-6">
              <label className="mb-2 block text-sm font-medium">Issued By</label>
              <input
                type="text"
                value={issuedBy}
                onChange={(e) => setIssuedBy(e.target.value)}
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
              <label className="mb-2 block text-sm font-medium">Issue Date</label>
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
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full bg-transparent outline-none"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="mb-2 block text-sm font-medium">Link</label>
              <input
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
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
              {link && !isValidUrl(link) && (
                <p className="mt-2 text-xs text-red-500">Invalid URL format</p>
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
            <h2 className="text-lg font-semibold">Images</h2>

            <input
              type="file"
              id="images-upload"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageUpload}
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
              <ImagePlus size={40} className="text-[var(--text-secondary)]" />
              <p className="mt-3 text-sm text-[var(--text-secondary)]">
                Click to upload multiple images
              </p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">PNG, JPG, WEBP</p>
            </label>

            {imagePreviews.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-3">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative overflow-hidden rounded-xl">
                    <img
                      src={preview}
                      alt={`preview-${index}`}
                      className="h-20 w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
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
                ))}
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
            <h2 className="text-lg font-semibold">Visibility</h2>

            <div className="mt-5 flex items-center justify-between">
              <div>
                <h3 className="font-medium">{isVisible ? "Public" : "Private"}</h3>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  Show this achievement on public portfolio
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsVisible(!isVisible)}
                className={`
                  relative
                  h-7
                  w-12
                  rounded-full
                  transition-all
                  duration-300
                  ${isVisible ? "bg-[var(--button-primary)]" : "bg-gray-300"}
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

export default CreateAchievement;