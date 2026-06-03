import {
  Calendar,
  ExternalLink,
  Pencil,
  Star,
  Trash2,
} from "lucide-react";

type AchievementCardProps = {
  title: string;
  type: "achievement" | "certificate";
  issuedBy?: string;
  issueDate?: string;
  link?: string;
  image?: string;
  isVisible: boolean;
  onToggleVisibility: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

function AchievementCard({
  title,
  type,
  issuedBy,
  issueDate,
  link,
  image,
  isVisible,
  onToggleVisibility,
  onEdit,
  onDelete,
}: AchievementCardProps) {
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
      <div className="relative h-52 bg-gradient-to-br from-emerald-500 to-teal-600">
        {image ? (
          <img src={image} alt={title} className="h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-black/15" />
        )}

        <div
          className={`
            absolute
            left-4
            top-4
            rounded-full
            px-3
            py-1
            text-xs
            font-medium
            ${
              type === "certificate"
                ? "bg-blue-100 text-blue-700"
                : "bg-amber-100 text-amber-700"
            }
          `}
        >
          {type}
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-xl font-semibold">{title}</h3>

            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Issued by: {issuedBy || "N/A"}
            </p>
          </div>

          <button
            type="button"
            onClick={onToggleVisibility}
            aria-label={
              isVisible
                ? "Mark as hidden from portfolio"
                : "Mark as visible on portfolio"
            }
            title={isVisible ? "Visible on portfolio" : "Hidden from portfolio"}
            className={`
              flex
              items-center
              justify-center
              rounded-xl
              border
              p-2
              transition-all
              duration-300
              ${
                isVisible
                  ? "border-amber-200 bg-amber-50 text-amber-500 hover:bg-amber-100"
                  : "border-[var(--border-color)] text-gray-400 hover:bg-[var(--bg-secondary)]"
              }
            `}
          >
            <Star size={16} fill={isVisible ? "currentColor" : "none"} />
          </button>
        </div>

        <div
          className="
            mt-5
            flex
            flex-wrap
            items-end
            justify-between
            gap-4
            text-sm
            text-[var(--text-secondary)]
          "
        >
          <div className="flex items-center gap-2">
            <Calendar size={15} />
            {issueDate || "No date"}
          </div>

          <div className="flex items-center gap-2">
            {link && (
              <a
                href={link}
                target="_blank"
                rel="noreferrer"
                className="
                  rounded-xl
                  border
                  border-[var(--border-color)]
                  p-2
                  transition-all
                  duration-300
                  hover:bg-[var(--bg-secondary)]
                "
                aria-label="View certificate"
                title="View certificate"
              >
                <ExternalLink size={16} />
              </a>
            )}

            <button
              type="button"
              onClick={onEdit}
              className="
                rounded-xl
                border
                border-[var(--border-color)]
                p-2
                transition-all
                duration-300
                hover:bg-[var(--bg-secondary)]
              "
              aria-label="Edit certificate"
              title="Edit certificate"
            >
              <Pencil size={16} />
            </button>

            <button
              type="button"
              onClick={onDelete}
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
              aria-label="Delete certificate"
              title="Delete certificate"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AchievementCard;
