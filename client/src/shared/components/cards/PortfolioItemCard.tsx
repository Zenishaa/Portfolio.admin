import {
  Calendar,
  ExternalLink,
  GitBranch,
  ImageIcon,
  Pencil,
  Star,
  Trash2,
} from "lucide-react";

import {
  useState,
} from "react";

type CardAction = {
  href?: string | null;
  onClick?: () => void;
};

function PortfolioItemCard({
  title,
  description,
  featured,
  status,
  tags,
  thumbnail,
  dateLabel,
  metaLabel,
  codeAction,
  externalAction,
  editAction,
  deleteAction,
  onToggleFeatured,
}: {
  title: string;
  description?: string | null;
  featured?: boolean;
  status?: string | null;
  tags: string[];
  thumbnail?: string | null;
  dateLabel?: string;
  metaLabel?: string | null;
  codeAction?: CardAction;
  externalAction?: CardAction;
  editAction?: CardAction;
  deleteAction?: CardAction;
  onToggleFeatured?: (e: React.MouseEvent) => void;
}) {
  const [
    imageFailed,
    setImageFailed,
  ] = useState(false);

  const hasActions =
    codeAction ||
    externalAction ||
    editAction ||
    deleteAction;

  const renderAction = (
    action: CardAction,
    label: string,
    icon: React.ReactNode,
    danger = false
  ) => {
    const className = `
      rounded-xl
      border
      ${danger ? "border-red-200 text-red-500 hover:bg-red-50" : "border-[var(--border-color)] hover:bg-[var(--bg-secondary)]"}
      p-2
      transition-all
      duration-300
    `;

    if (action.href) {
      return (
        <a
          href={action.href}
          target="_blank"
          rel="noreferrer"
          className={className}
          aria-label={label}
        >
          {icon}
        </a>
      );
    }

    return (
      <button
        onClick={action.onClick}
        className={className}
        aria-label={label}
      >
        {icon}
      </button>
    );
  };

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
          overflow-hidden
          bg-[var(--bg-secondary)]
        "
      >
        {thumbnail && !imageFailed ? (
          <img
            src={thumbnail}
            alt={title}
            onError={() =>
              setImageFailed(true)
            }
            className="
              h-full
              w-full
              object-cover
            "
          />
        ) : (
          <div
            className="
              flex
              h-full
              w-full
              items-center
              justify-center
              bg-gradient-to-br
              from-[var(--button-primary)]
              to-indigo-500
            "
          >
            {/* <ImageIcon
              size={42}
              className="text-white/80 dark:text-black/60"
            /> */}
          </div>
        )}

        {status && (
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
                ["published", "completed"].includes(status)
                  ? "bg-green-100 text-green-700"
                  : "bg-orange-100 text-orange-700"
              }
            `}
          >
            {status}
          </div>
        )}

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

          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3
                className="
                  text-xl
                  font-semibold
                "
              >
                {title}
              </h3>

              {metaLabel && (
                <p
                  className="
                    mt-2
                    text-xs
                    font-medium
                    uppercase
                    text-[var(--text-muted)]
                  "
                >
                  {metaLabel}
                </p>
              )}
            </div>

            {onToggleFeatured && (
              <button
                onClick={onToggleFeatured}
                aria-label={
                  featured
                    ? "Unfeature Project"
                    : "Feature Project"
                }
                title={
                  featured
                    ? "Unfeature Project"
                    : "Feature Project"
                }
                className={`
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  border
                  transition-all
                  duration-300
                  ${
                    featured
                      ? "border-amber-200 bg-amber-50 text-amber-500 hover:bg-amber-100"
                      : "border-[var(--border-color)] text-gray-400 hover:bg-[var(--bg-secondary)]"
                  }
                `}
              >
                <Star
                  size={16}
                  fill={featured ? "currentColor" : "none"}
                />
              </button>
            )}
          </div>

          {description && (
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
          )}

        </div>

        {/* Tags */}

        {tags.length > 0 && (
          <div
            className="
              mt-5
              flex
              flex-wrap
              gap-2
            "
          >
            {tags.map((tag) => (
              <div
                key={tag}
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
        )}

        {/* Footer */}

        <div
          className="
            mt-6
            flex
            flex-wrap
            items-center
            justify-between
            gap-4
          "
        >
          {/* Date */}

          {dateLabel ? (
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
            ) : (
              <div />
            )}

          {/* Actions */}

          {hasActions && (
            <div className="flex items-center gap-2">
              {codeAction &&
                renderAction(
                  codeAction,
                  "Open source",
                  <GitBranch size={16} />
                )}

              {externalAction &&
                renderAction(
                  externalAction,
                  "Open link",
                  <ExternalLink size={16} />
                )}

              {editAction &&
                renderAction(
                  editAction,
                  "Edit item",
                  <Pencil size={16} />
                )}

              {deleteAction &&
                renderAction(
                  deleteAction,
                  "Delete item",
                  <Trash2 size={16} />,
                  true
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PortfolioItemCard;
