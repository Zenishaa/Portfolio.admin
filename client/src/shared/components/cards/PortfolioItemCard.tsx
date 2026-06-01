import {
  Calendar,
  ExternalLink,
  GitBranch,
  Pencil,
  Star,
  Trash2,
} from "lucide-react";

function PortfolioItemCard({
  title,
  description,
  featured,
  status,
  tags,
  dateLabel = "May 2026",
  showCodeAction = true,
  showExternalAction = true,
  showEditAction = true,
  showDeleteAction = true,
}: {
  title: string;
  description: string;
  featured?: boolean;
  status: string;
  tags: string[];
  dateLabel?: string;
  showCodeAction?: boolean;
  showExternalAction?: boolean;
  showEditAction?: boolean;
  showDeleteAction?: boolean;
}) {
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
      "
    >
      {/* Thumbnail */}

      <div
        className="
          relative
          h-52
          bg-gradient-to-br
          from-[var(--button-primary)]
          to-indigo-500
        "
      >
        {/* Featured */}

        {featured && (
          <div
            className="
              absolute
              left-4
              top-4
              flex
              items-center
              gap-1
              rounded-full
              bg-white/90
              px-3
              py-1
              text-xs
              font-medium
              text-black
              backdrop-blur
            "
          >
            <Star size={13} />

            Featured
          </div>
        )}

        {/* Status */}

        <div
          className={`
            absolute
            right-4
            top-4
            rounded-full
            px-3
            py-1
            text-xs
            font-medium
            ${
              status === "published"
                ? "bg-green-100 text-green-700"
                : "bg-orange-100 text-orange-700"
            }
          `}
        >
          {status}
        </div>

        {/* Fake Overlay */}

        <div
          className="
            absolute
            inset-0
            bg-black/10
          "
        />
      </div>

      {/* Content */}

      <div className="p-6">
        {/* Header */}

        <div>

          <h3
            className="
              text-xl
              font-semibold
            "
          >
            {title}
          </h3>

          <p
            className="
              mt-3
              line-clamp-3
              text-sm
              leading-relaxed
              text-[var(--text-secondary)]
            "
          >
            {description}
          </p>

        </div>

        {/* Tags */}

        <div
          className="
            mt-5
            flex
            flex-wrap
            gap-2
          "
        >
          {tags.map((tag, index) => (
            <div
              key={index}
              className="
                rounded-full
                bg-[var(--bg-secondary)]
                px-3
                py-1
                text-xs
                font-medium
              "
            >
              {tag}
            </div>
          ))}
        </div>

        {/* Footer */}

        <div
          className="
            mt-6
            flex
            items-center
            justify-between
            border-t
            border-[var(--border-color)]
            pt-5
          "
        >
          {/* Date */}

          <div
            className="
              flex
              items-center
              gap-2
              text-sm
              text-[var(--text-secondary)]
            "
          >
            <Calendar size={15} />

            {dateLabel}
          </div>

          {/* Actions */}

          <div className="flex items-center gap-2">

            {showCodeAction && (
              <button
                className="
                  rounded-xl
                  border
                  border-[var(--border-color)]
                  p-2
                  transition-all
                  duration-300
                  hover:bg-[var(--bg-secondary)]
                "
                aria-label="Open source"
              >
                <GitBranch size={16} />
              </button>
            )}

            {showExternalAction && (
              <button
                className="
                  rounded-xl
                  border
                  border-[var(--border-color)]
                  p-2
                  transition-all
                  duration-300
                  hover:bg-[var(--bg-secondary)]
                "
                aria-label="Open link"
              >
                <ExternalLink size={16} />
              </button>
            )}

            {showEditAction && (
              <button
                className="
                  rounded-xl
                  border
                  border-[var(--border-color)]
                  p-2
                  transition-all
                  duration-300
                  hover:bg-[var(--bg-secondary)]
                "
                aria-label="Edit item"
              >
                <Pencil size={16} />
              </button>
            )}

            {showDeleteAction && (
              <button
                className="
                  rounded-xl
                  border
                  border-red-200
                  p-2
                  text-red-500
                  transition-all
                  duration-300
                  hover:bg-red-50
                "
                aria-label="Delete item"
              >
                <Trash2 size={16} />
              </button>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

export default PortfolioItemCard;
