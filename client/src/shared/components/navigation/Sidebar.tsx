import {
  Award,
  BriefcaseBusiness,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Key,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useEffect, useState } from "react";
import SidebarItem from "./SidebarItem";

const NAV_ITEMS = [
  {
    icon: <LayoutDashboard size={20} />,
    label: "Dashboard",
    path: "/dashboard",
  },
  {
    icon: <FolderKanban size={20} />,
    label: "Projects",
    path: "/projects",
  },
  {
    icon: <BriefcaseBusiness size={20} />,
    label: "Experience",
    path: "/experience",
  },
  {
    icon: <Award size={20} />,
    label: "Certificates",
    path: "/certificates",
  },
  {
    icon: <Key size={20} />,
    label: "API Keys",
    path: "/api-keys",
  },
];

function Sidebar({
  sidebarOpen,
  setSidebarOpen,
}: {
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<{ name: string; avatar: string | null }>({
    name: "Admin",
    avatar: null,
  });

  useEffect(() => {
    const storedName   = localStorage.getItem("userName");
    const storedAvatar = localStorage.getItem("userAvatar");
    if (storedName || storedAvatar) {
      setUser({ name: storedName || "Admin", avatar: storedAvatar || null });
    }
  }, []);

  return (
    <>
      {/* ────────────────────────────────────────
          DESKTOP SIDEBAR
      ──────────────────────────────────────── */}
      <aside
        className={`
          relative hidden lg:flex lg:flex-col
          border-r border-[var(--border-color)]
          bg-[var(--bg-sidebar)]
          transition-all duration-300 ease-in-out
          ${sidebarOpen ? "w-[260px]" : "w-[72px]"}
        `}
        style={{ backdropFilter: "blur(20px)" }}
      >
        {/* Subtle gradient top accent */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px] rounded-t-none"
          style={{
            background: "linear-gradient(90deg, var(--grad-start), var(--grad-end))",
          }}
        />

        {/* ── LOGO ── */}
        <div
          className={`
            flex h-16 items-center gap-3
            border-b border-[var(--border-color)]
            ${sidebarOpen ? "px-5" : "justify-center px-0"}
          `}
        >
          {/* Logo icon */}
          <div
            className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-bold text-white text-base"
            style={{
              background: "linear-gradient(135deg, var(--grad-start), var(--grad-end))",
              boxShadow:  "0 4px 14px var(--accent-glow)",
            }}
          >
            P
            <div
              className="absolute inset-0 rounded-xl opacity-40 animate-pulse"
              style={{ background: "linear-gradient(135deg, var(--grad-start), var(--grad-end))" }}
            />
          </div>

          {/* Brand text */}
          {sidebarOpen && (
            <div className="min-w-0">
              <h1 className="text-sm font-semibold leading-tight text-[var(--text-primary)] truncate">
                Portfolio Admin
              </h1>
              <p className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider">
                Developer Platform
              </p>
            </div>
          )}
        </div>

        {/* ── NAVIGATION ── */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {NAV_ITEMS.map((item) => (
            <SidebarItem
              key={item.path}
              icon={item.icon}
              label={item.label}
              path={item.path}
              active={
                item.path === "/dashboard"
                  ? location.pathname === "/dashboard"
                  : location.pathname.startsWith(item.path)
              }
              sidebarOpen={sidebarOpen}
            />
          ))}
        </nav>

        {/* ── FOOTER ── */}
        <div className="border-t border-[var(--border-color)] p-3 space-y-2">
          {/* User row */}
          {sidebarOpen && (
            <div className="flex items-center gap-3 rounded-xl px-3 py-2.5">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-8 w-8 rounded-xl object-cover ring-2 ring-[var(--border-accent)]"
                />
              ) : (
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm font-semibold text-white"
                  style={{
                    background: "linear-gradient(135deg, var(--grad-start), var(--grad-end))",
                  }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium leading-tight text-[var(--text-primary)] truncate">
                  {user.name}
                </p>
                <p className="text-[10px] text-[var(--text-muted)]">Administrator</p>
              </div>
            </div>
          )}

          {/* Logout */}
          <button
            onClick={() => navigate("/logout")}
            data-tooltip={!sidebarOpen ? "Logout" : undefined}
            className={`
              flex w-full items-center gap-3 rounded-xl px-3 py-2.5
              text-sm font-medium text-[var(--text-secondary)]
              transition-all duration-200
              hover:bg-[var(--danger-light)] hover:text-[var(--danger)]
              ${!sidebarOpen ? "justify-center" : ""}
            `}
          >
            <LogOut size={18} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>

        {/* ── COLLAPSE TOGGLE ── */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="
            absolute -right-3 top-20
            flex h-6 w-6 items-center justify-center
            rounded-full border border-[var(--border-color)]
            bg-[var(--bg-card)] text-[var(--text-muted)]
            shadow-md transition-all duration-200
            hover:border-[var(--accent)] hover:text-[var(--accent)]
            z-10
          "
          title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {sidebarOpen ? (
            <ChevronLeft size={12} />
          ) : (
            <ChevronRight size={12} />
          )}
        </button>
      </aside>
    </>
  );
}

export default Sidebar;
