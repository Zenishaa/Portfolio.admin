import {
  Bell,
  Menu,
  Moon,
  Search,
  Sun,
} from "lucide-react";

import { useTheme } from "next-themes";
import PageLoader from "@shared/components/ui/PageLoader";
import { usePageNavigation } from "@shared/hooks/usePageNavigation";

function Navbar({
  sidebarOpen,
  setSidebarOpen,
}: {
  sidebarOpen: boolean;
  setSidebarOpen: (
    value: boolean
  ) => void;
}) {
  const { theme, setTheme } =
    useTheme();

    const { loading,
        
    } = usePageNavigation();

  return (
    <>
    {loading && <PageLoader />}
    <header
      className="
        sticky
        top-0
        z-40
        flex
        h-16
        items-center
        justify-between
        border-b
        border-[var(--border-color)]
        bg-[var(--bg-card)]/80
        px-6
        backdrop-blur
      "
    >
      {/* Left */}

      <div className="flex items-center gap-4">

        {/* Toggle */}

        <button
          onClick={() =>
            setSidebarOpen(
              !sidebarOpen
            )
          }
          className="
            rounded-xl
            border
            border-[var(--border-color)]
            bg-[var(--bg-card)]
            p-2
          "
        >
          <Menu size={20} />
        </button>

        {/* Search */}

        <div
          className="
            hidden
            items-center
            gap-3
            rounded-2xl
            border
            border-[var(--border-color)]
            bg-[var(--bg-main)]
            px-4
            py-2
            lg:flex
          "
        >
          <Search
            size={18}
            className="
              text-[var(--text-secondary)]
            "
          />

          <input
            type="text"
            placeholder="Search..."
            className="
              bg-transparent
              outline-none
              placeholder:text-[var(--text-muted)]
            "
          />
        </div>
      </div>

      {/* Right */}

      <div className="flex items-center gap-3">

        {/* Theme */}

        <button
          onClick={() =>
            setTheme(
              theme === "dark"
                ? "light"
                : "dark"
            )
          }
          className="
            relative
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-2xl
            border
            border-[var(--border-color)]
            bg-[var(--bg-card)]
          "
        >
          <Sun
            size={18}
            className={`
              absolute
              transition-all
              duration-500
              ${
                theme === "dark"
                  ? "scale-0 rotate-90 opacity-0"
                  : "scale-100 opacity-100 text-amber-500"
              }
            `}
          />

          <Moon
            size={18}
            className={`
              absolute
              transition-all
              duration-500
              ${
                theme === "dark"
                  ? "scale-100 opacity-100 text-slate-300"
                  : "scale-0 opacity-0"
              }
            `}
          />
        </button>

        {/* Notification */}

        <button
          className="
            relative
            rounded-2xl
            border
            border-[var(--border-color)]
            bg-[var(--bg-card)]
            p-3
          "
        >
          <Bell size={18} />

          <div
            className="
              absolute
              right-2
              top-2
              h-2
              w-2
              rounded-full
              bg-red-500
            "
          />
        </button>

        {/* Profile */}

        <div
          className="
            flex
            items-center
            gap-3
            rounded-2xl
            border
            border-[var(--border-color)]
            bg-[var(--bg-card)]
            px-3
            py-2
          "
        >
          <div
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              bg-[var(--button-primary)]
              font-semibold
              text-white
              dark:text-black
            "
          >
            P
          </div>

          <div className="hidden lg:block">
            <h3 className="text-sm font-medium">
              Prem Raichura
            </h3>

            <p
              className="
                text-xs
                text-[var(--text-secondary)]
              "
            >
              Administrator
            </p>
          </div>
        </div>
      </div>
    </header>
    </>
  );
}

export default Navbar;
