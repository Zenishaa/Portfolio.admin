import type { ReactNode } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

function StatCard({
  title,
  value,
  icon,
  growth,
  color = "accent",
}: {
  title:   string;
  value:   string;
  icon:    ReactNode;
  growth:  string;
  color?:  "accent" | "success" | "warning" | "danger" | "info";
}) {
  const isPositive = !growth.startsWith("-");

  const colorMap: Record<string, { bg: string; text: string; shadow: string }> = {
    accent:  {
      bg:     "linear-gradient(135deg, var(--grad-start), var(--grad-end))",
      text:   "var(--accent)",
      shadow: "var(--accent-glow)",
    },
    success: {
      bg:     "linear-gradient(135deg, #10b981, #059669)",
      text:   "var(--success)",
      shadow: "rgba(16,185,129,0.25)",
    },
    warning: {
      bg:     "linear-gradient(135deg, #f59e0b, #d97706)",
      text:   "var(--warning)",
      shadow: "rgba(245,158,11,0.25)",
    },
    danger:  {
      bg:     "linear-gradient(135deg, #ef4444, #dc2626)",
      text:   "var(--danger)",
      shadow: "rgba(239,68,68,0.25)",
    },
    info:    {
      bg:     "linear-gradient(135deg, #3b82f6, #2563eb)",
      text:   "var(--info)",
      shadow: "rgba(59,130,246,0.25)",
    },
  };

  const c = colorMap[color] ?? colorMap.accent;

  return (
    <div
      className="
        group relative overflow-hidden rounded-2xl
        border border-[var(--border-color)]
        bg-[var(--bg-card)]
        p-5
        transition-all duration-300
        hover:-translate-y-1.5
        hover:border-[var(--border-accent)]
      "
      style={{
        boxShadow: "var(--shadow-sm)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = `var(--shadow-lg), 0 0 20px ${c.shadow}`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-sm)";
      }}
    >
      {/* Gradient background on hover */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: "var(--grad-card)" }}
      />

      {/* Top row */}
      <div className="relative flex items-start justify-between">
        {/* Icon */}
        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl text-white"
          style={{
            background: c.bg,
            boxShadow: `0 4px 14px ${c.shadow}`,
          }}
        >
          {icon}
        </div>

        {/* Growth badge */}
        <div
          className={`
            flex items-center gap-1 rounded-full px-2.5 py-1
            text-xs font-semibold
          `}
          style={{
            background: isPositive ? "var(--success-light)" : "var(--danger-light)",
            color:      isPositive ? "var(--success)"       : "var(--danger)",
          }}
        >
          {isPositive ? (
            <TrendingUp size={12} />
          ) : (
            <TrendingDown size={12} />
          )}
          {growth}
        </div>
      </div>

      {/* Content */}
      <div className="relative mt-4">
        <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
          {title}
        </p>
        <h3 className="mt-1.5 text-2xl font-bold tracking-tight text-[var(--text-primary)]">
          {value}
        </h3>

        {/* Mini progress bar */}
        <div className="mt-3 h-1 w-full rounded-full bg-[var(--bg-secondary)] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width:      "65%",
              background: c.bg,
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default StatCard;