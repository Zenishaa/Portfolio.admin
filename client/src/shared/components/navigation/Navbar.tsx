import {
  Bell,
  Menu,
  Moon,
  Search,
  Sun,
} from "lucide-react";

import { useTheme } from "next-themes";
import {
  useEffect,
  useState,
  type FormEvent,
} from "react";
import { useNavigate, Link } from "react-router-dom";

function Navbar({
  sidebarOpen,
  setSidebarOpen,
}: {
  sidebarOpen: boolean;
  setSidebarOpen: (
    value: boolean
  ) => void;
}) {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<{name: string, avatar: string | null}>({
    name: "Admin User",
    avatar: null
  });

  useEffect(() => {
    // Read from localStorage on mount
    const storedName = localStorage.getItem("userName");
    const storedAvatar = localStorage.getItem("userAvatar");
    
    if (storedName || storedAvatar) {
      setUser({
        name: storedName || "Admin User",
        avatar: storedAvatar || null
      });
    }
  }, []);

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to projects with search query
      navigate(`/projects?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  return (
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

        <form
          onSubmit={handleSearchSubmit}
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
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="
              bg-transparent
              outline-none
              placeholder:text-[var(--text-muted)]
            "
          />
        </form>
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

        <Link
          to="/profile"
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
            transition-all
            hover:bg-[var(--bg-secondary)]
            active:scale-[0.98]
          "
        >
          {user.avatar ? (
            <img 
              src={user.avatar} 
              alt={user.name} 
              className="h-10 w-10 rounded-xl object-cover"
            />
          ) : (
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
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="hidden lg:block">
            <h3 className="text-sm font-medium">
              {user.name}
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
        </Link>
      </div>
    </header>
  );
}

export default Navbar;
