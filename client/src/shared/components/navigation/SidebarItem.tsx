import type { ReactNode } from "react";

import PageLoader from "@shared/components/ui/PageLoader";

import { usePageNavigation } from "@shared/hooks/usePageNavigation";

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
  const {
    loading,
    handleNavigation,
  } = usePageNavigation();

  return (
    <>
      {loading && <PageLoader />}

      <button
        onClick={() =>
          handleNavigation(path)
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
