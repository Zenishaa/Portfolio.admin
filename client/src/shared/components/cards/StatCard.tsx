import type { ReactNode } from "react";

function StatCard({
  title,
  value,
  icon,
  growth,
}: {
  title: string;
  value: string;
  icon: ReactNode;
  growth: string;
}) {
  return (
    <div
      className="
        rounded-[28px]
        border
        border-[var(--border-color)]
        bg-[var(--bg-card)]
        p-6
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-lg
      "
    >
      {/* Top */}

      <div
        className="
          flex
          items-center
          justify-between
        "
      >
        <div
          className="
            flex
            h-12
            w-12
            items-center
            justify-center
            rounded-2xl
            bg-[var(--bg-secondary)]
          "
        >
          {icon}
        </div>

        <div
          className="
            rounded-full
            bg-green-100
            px-3
            py-1
            text-xs
            font-medium
            text-green-600
          "
        >
          {growth}
        </div>
      </div>

      {/* Content */}

      <div className="mt-6">

        <p
          className="
            text-sm
            text-[var(--text-secondary)]
          "
        >
          {title}
        </p>

        <h3
          className="
            mt-2
            text-3xl
            font-bold
          "
        >
          {value}
        </h3>

      </div>
    </div>
  );
}

export default StatCard;