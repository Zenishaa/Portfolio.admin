import type { ReactNode } from "react";

import { useNavigate } from "react-router-dom";

function SidebarItem({
  icon,
  label,
  active,
  sidebarOpen,
  path,
}: {
  icon: ReactNode;
  label: string;
  active?: boolean;
  sidebarOpen: boolean;
  path: string;
}) {
  const navigate = useNavigate();

  return (
    <>
      <button
        onClick={() =>
          navigate(path)
        }
        className={`
          flex
          w-full
          items-center
          gap-3
          rounded-2xl
          px-4
          py-3
          text-sm
          font-medium
          transition-all
          duration-300
          ${
            active
              ? "bg-[var(--button-primary)] text-white dark:text-black"
              : "text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]"
          }
        `}
      >
        {icon}

        {sidebarOpen && (
          <span>{label}</span>
        )}
      </button>
    </>
  );
}

export default SidebarItem;
