import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

function SidebarItem({
  icon,
  label,
  active,
  sidebarOpen,
  path,
  onClick,
}: {
  icon:        ReactNode;
  label:       string;
  active?:     boolean;
  sidebarOpen: boolean;
  path:        string;
  onClick?:    () => void;
}) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => {
        navigate(path);
        onClick?.();
      }}
      data-tooltip={!sidebarOpen ? label : undefined}
      className={`
        relative flex w-full items-center gap-3
        rounded-xl px-3 py-2.5
        text-sm font-medium
        transition-all duration-200 ease-in-out
        overflow-hidden
        ${active
          ? "text-white"
          : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
        }
        ${!sidebarOpen ? "justify-center" : ""}
      `}
      style={
        active
          ? {
              background: "linear-gradient(135deg, var(--grad-start), var(--grad-end))",
              boxShadow:  "0 4px 14px var(--accent-glow)",
            }
          : undefined
      }
    >
      {/* Icon */}
      <span
        className={`shrink-0 transition-all duration-200 ${
          active ? "text-white" : ""
        }`}
      >
        {icon}
      </span>

      {/* Label */}
      {sidebarOpen && (
        <span className="truncate">{label}</span>
      )}

      {/* Active shimmer overlay */}
      {active && (
        <span
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
          }}
        />
      )}
    </button>
  );
}

export default SidebarItem;
