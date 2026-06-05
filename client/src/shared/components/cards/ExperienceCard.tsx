import {
  Calendar,
  ExternalLink,
  MapPin,
  Pencil,
  Trash2,
  Briefcase,
  Monitor,
} from "lucide-react";

import { useState } from "react";

export interface ExperienceLink {
  key: string;
  value: string;
}

type CardAction = {
  onClick: () => void;
};

interface ExperienceCardProps {
  title: string;
  company: string;
  description?: string | null;
  start_date: string;
  end_date?: string | null;
  is_current?: boolean;
  location?: string | null;
  mode?: string | null;
  images?: string[] | null;
  links?: ExperienceLink[] | null;
  editAction?: CardAction;
  deleteAction?: CardAction;
}

function ExperienceCard({
  title,
  company,
  description,
  start_date,
  end_date,
  is_current,
  location,
  mode,
  images,
  links,
  editAction,
  deleteAction,
}: ExperienceCardProps) {
  const [imageFailed, setImageFailed] = useState(false);

  const hasActions = editAction || deleteAction;

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (Number.isNaN(date.getTime())) return "Invalid Date";
      return new Intl.DateTimeFormat("en", {
        month: "short",
        year: "numeric",
      }).format(date);
    } catch {
      return "Invalid Date";
    }
  };

  // Get the first image if available
  const mainImage = images && images.length > 0 ? images[0] : null;

  return (
    <div
      className="
        overflow-hidden
        rounded-[32px]
        border
        border-[var(--border-color)]
        bg-[var(--bg-card)]
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-xl
        flex
        flex-col
        h-full
      "
    >
      {/* Upper Cover: Grid or Image */}
      <div
        className="
          relative
          h-44
          overflow-hidden
          bg-[var(--bg-secondary)]
          flex
          items-center
          justify-center
        "
      >
        {mainImage && !imageFailed ? (
          <img
            src={mainImage}
            alt={company}
            onError={() => setImageFailed(true)}
            className="
              h-full
              w-full
              object-cover
            "
          />
        ) : (
          <div
            className="
              absolute
              inset-0
              bg-gradient-to-br
              from-indigo-600
              to-purple-600
              opacity-85
              flex
              items-center
              justify-center
            "
          >
            <Briefcase size={48} className="text-white/30" />
          </div>
        )}


        {/* Current / Active status indicator */}
        {is_current && (
          <div
            className="
              absolute
              right-4
              top-4
              rounded-full
              bg-green-500/10
              text-green-500
              border
              border-green-500/20
              px-3
              py-1
              text-xs
              font-medium
              flex
              items-center
              gap-1.5
            "
          >
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            Current
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-xl font-bold leading-snug">
          {company} - <span className="italic font-normal">{title}</span>
        </h3>

        {/* Location & Mode Row */}
        <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs text-[var(--text-muted)] font-medium">
          {location && (
            <div className="flex items-center gap-1">
              <MapPin size={13} />
              <span>{location}</span>
            </div>
          )}
          {mode && (
            <div className="flex items-center gap-1">
              <Monitor size={13} />
              <span className="capitalize">{mode}</span>
            </div>
          )}
        </div>

        {/* Description */}
        {description && (
          <p
            className="
              mt-4
              line-clamp-3
              text-sm
              leading-relaxed
              text-[var(--text-secondary)]
              flex-1
             font-normal
            "
          >
            {description}
          </p>
        )}

        {/* Multi-Image Previews (if more than 1 image) */}
        {images && images.length > 1 && (
          <div className="mt-4 flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {images.slice(1, 5).map((imgUrl, idx) => (
              <img
                key={idx}
                src={imgUrl}
                alt={`${company} workspace ${idx + 1}`}
                className="h-9 w-9 rounded-lg object-cover border border-[var(--border-color)] shrink-0"
              />
            ))}
            {images.length > 5 && (
              <div className="h-9 w-9 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center text-xs font-semibold text-[var(--text-muted)] border border-[var(--border-color)] shrink-0">
                +{images.length - 5}
              </div>
            )}
          </div>
        )}

        {/* Links display if any */}
        {links && links.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {links.map((link) => (
              <a
                key={link.key}
                href={link.value}
                target="_blank"
                rel="noreferrer"
                className="
                  inline-flex
                  items-center
                  gap-1
                  rounded-xl
                  bg-[var(--bg-secondary)]
                  border
                  border-[var(--border-color)]
                  px-2.5
                  py-1
                  text-xs
                  font-medium
                  text-[var(--text-primary)]
                  hover:bg-[var(--bg-card)]
                  transition-colors
                "
              >
                <span className="capitalize">{link.key}</span>
                <ExternalLink size={11} className="opacity-70" />
              </a>
            ))}
          </div>
        )}

        {/* Card Footer: Date Label & Action Buttons */}
        <div
          className="
            mt-6
            border-t
            border-[var(--border-color)]
            pt-4
            flex
            items-center
            justify-between
            gap-4
          "
        >
          {/* Date Label */}
          <div
            className="
              flex
              items-center
              gap-2
              text-xs
              font-medium
              text-[var(--text-secondary)]
            "
          >
            <Calendar size={14} />
            <span>
              {formatDate(start_date)} — {is_current ? "Present" : (end_date ? formatDate(end_date) : "N/A")}
            </span>
          </div>

          {/* Actions */}
          {hasActions && (
            <div className="flex items-center gap-1.5">
              {editAction && (
                <button
                  type="button"
                  onClick={editAction.onClick}
                  className="
                    rounded-xl
                    border
                    border-[var(--border-color)]
                    p-2
                    text-[var(--text-secondary)]
                    hover:bg-[var(--bg-secondary)]
                    transition-all
                    duration-200
                  "
                  title="Edit Experience"
                  aria-label="Edit Experience"
                >
                  <Pencil size={15} />
                </button>
              )}
              {deleteAction && (
                <button
                  type="button"
                  onClick={deleteAction.onClick}
                  className="
                    rounded-xl
                    border
                    border-red-200
                    p-2
                    text-red-500
                    hover:bg-red-50
                    transition-all
                    duration-200
                  "
                  title="Delete Experience"
                  aria-label="Delete Experience"
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ExperienceCard;
