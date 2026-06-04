import {
  Bell,
  Menu,
  Moon,
  Search,
  Sun,
  X,
} from "lucide-react";

import { useTheme } from "next-themes";
import {
  useEffect,
  useState,
  useRef,
  type FormEvent,
} from "react";
import { useNavigate, Link } from "react-router-dom";

function Navbar({
  sidebarOpen,
  setSidebarOpen,
}: {
  sidebarOpen:    boolean;
  setSidebarOpen: (value: boolean) => void;
}) {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [user, setUser] = useState<{ name: string; avatar: string | null }>({
    name: "Admin User",
    avatar: null,
  });

  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedName   = localStorage.getItem("userName");
    const storedAvatar = localStorage.getItem("userAvatar");
    if (storedName || storedAvatar) {
      setUser({ name: storedName || "Admin User", avatar: storedAvatar || null });
    }
  }, []);

  // Close notif dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotif(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/projects?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header
      className="sticky top-0 z-40 flex h-16 items-center justify-between px-5 lg:px-6"
      style={{
        background:     "var(--bg-navbar)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom:   "1px solid var(--border-color)",
      }}
    >
      {/* ── LEFT ── */}
      <div className="flex items-center gap-3">
        {/* Sidebar toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="
            flex h-9 w-9 items-center justify-center rounded-xl
            border border-[var(--border-color)] bg-[var(--bg-card)]
            text-[var(--text-secondary)]
            transition-all duration-200
            hover:border-[var(--accent)] hover:text-[var(--accent)] hover:bg-[var(--accent-light)]
          "
          aria-label="Toggle sidebar"
        >
          <Menu size={18} />
        </button>

        {/* Search */}
        <form
          onSubmit={handleSearchSubmit}
          className={`
            hidden items-center gap-2.5 rounded-xl px-3.5 py-2 lg:flex
            border transition-all duration-200
            ${searchFocused
              ? "border-[var(--accent)] bg-[var(--bg-card)] shadow-[0_0_0_3px_var(--accent-glow)]"
              : "border-[var(--border-color)] bg-[var(--bg-secondary)]"
            }
          `}
        >
          <Search
            size={16}
            className={`transition-colors duration-200 ${
              searchFocused ? "text-[var(--accent)]" : "text-[var(--text-muted)]"
            }`}
          />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="
              w-48 bg-transparent text-sm text-[var(--text-primary)]
              outline-none placeholder:text-[var(--text-muted)]
              transition-all duration-200 focus:w-64
            "
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </form>
      </div>

      {/* ── RIGHT ── */}
      <div className="flex items-center gap-2">

        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="
            relative flex h-9 w-9 items-center justify-center rounded-xl
            border border-[var(--border-color)] bg-[var(--bg-card)]
            text-[var(--text-secondary)]
            transition-all duration-200
            hover:border-[var(--accent)] hover:text-[var(--accent)] hover:bg-[var(--accent-light)]
          "
          aria-label="Toggle theme"
        >
          <Sun
            size={17}
            className={`absolute transition-all duration-500 ${
              theme === "dark"
                ? "scale-0 rotate-90 opacity-0"
                : "scale-100 rotate-0 opacity-100 text-amber-500"
            }`}
          />
          <Moon
            size={17}
            className={`absolute transition-all duration-500 ${
              theme === "dark"
                ? "scale-100 rotate-0 opacity-100 text-indigo-400"
                : "scale-0 -rotate-90 opacity-0"
            }`}
          />
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotif(!showNotif)}
            className="
              relative flex h-9 w-9 items-center justify-center rounded-xl
              border border-[var(--border-color)] bg-[var(--bg-card)]
              text-[var(--text-secondary)]
              transition-all duration-200
              hover:border-[var(--accent)] hover:text-[var(--accent)] hover:bg-[var(--accent-light)]
            "
            aria-label="Notifications"
          >
            <Bell size={17} />
            {/* Pulse dot */}
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[var(--danger)]">
              <span className="absolute inset-0 animate-ping rounded-full bg-[var(--danger)] opacity-60" />
            </span>
          </button>

          {/* Notification dropdown */}
          {showNotif && (
            <div
              className="
                absolute right-0 top-full mt-2 w-72 rounded-2xl border border-[var(--border-color)]
                bg-[var(--bg-card)] p-3 shadow-[var(--shadow-xl)]
                animate-fade-in-up
              "
              style={{ zIndex: 50 }}
            >
              <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                Notifications
              </p>
              <div className="space-y-1">
                {[
                  { title: "New API request", time: "2m ago", dot: "var(--accent)" },
                  { title: "Certificate updated", time: "1h ago", dot: "var(--success)" },
                  { title: "Portfolio viewed", time: "3h ago", dot: "var(--warning)" },
                ].map((n, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-[var(--bg-secondary)] cursor-pointer"
                  >
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: n.dot }} />
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">{n.title}</p>
                      <p className="text-xs text-[var(--text-muted)]">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <Link
          to="/profile"
          className="
            flex items-center gap-2.5 rounded-xl px-2.5 py-1.5
            border border-[var(--border-color)] bg-[var(--bg-card)]
            transition-all duration-200
            hover:border-[var(--accent)] hover:bg-[var(--accent-light)]
          "
        >
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="h-7 w-7 rounded-lg object-cover"
            />
          ) : (
            <div
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-semibold text-white"
              style={{
                background: "linear-gradient(135deg, var(--grad-start), var(--grad-end))",
              }}
            >
              {initials}
            </div>
          )}

          <div className="hidden lg:block">
            <p className="text-sm font-semibold leading-tight text-[var(--text-primary)]">
              {user.name.split(" ")[0]}
            </p>
            <p className="text-[10px] text-[var(--text-muted)]">Admin</p>
          </div>
        </Link>
      </div>
    </header>
  );
}

export default Navbar;
