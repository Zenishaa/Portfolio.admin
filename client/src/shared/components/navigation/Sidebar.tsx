import {
  BriefcaseBusiness,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Code,
  User,
  Award,
} from "lucide-react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import SidebarItem from "./SidebarItem";

import PageLoader from "@shared/components/ui/PageLoader";
import { useState } from "react";

function Sidebar({
  sidebarOpen,
}: {
  sidebarOpen: boolean;
}) {
  const location = useLocation();

  const navigate =
    useNavigate();

  const [
    logoutLoading,
    setLogoutLoading,] = useState(false);

  const handleLogout =
    () => {

      setLogoutLoading(true);

      setTimeout(() => {

        localStorage.clear();

        navigate(
          "/login",
          {
            replace: true,
          }
        );

      }, 400);
    };

  return (
    <>
      {logoutLoading && <PageLoader />}
      <aside
        className={`
        hidden
        border-r
        border-[var(--border-color)]
        bg-[var(--bg-card)]
        transition-all
        duration-300
        lg:flex
        lg:flex-col
        ${sidebarOpen
            ? "w-72"
            : "w-24"
          }
      `}
      >
        {/* =========================
          LOGO
      ========================= */}

        <div
          className="
          flex
          h-16
          items-center
          border-b
          border-[var(--border-color)]
          px-6
        "
        >
          <div
            className="
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-2xl
            bg-[var(--button-primary)]
            text-lg
            font-bold
            text-white
            dark:text-black
          "
          >
            P
          </div>

          {sidebarOpen && (
            <div className="ml-3">

              <h1 className="font-semibold">
                Portfolio Admin
              </h1>

              <p
                className="
                text-xs
                text-[var(--text-secondary)]
              "
              >
                Developer Platform
              </p>

            </div>
          )}
        </div>

        {/* =========================
          NAVIGATION
      ========================= */}

        <div className="flex-1 p-4">

          <div className="space-y-2">

            <SidebarItem
              icon={<LayoutDashboard size={20} />}
              label="Dashboard"
              path="/dashboard"
              active={
                location.pathname ===
                "/dashboard"
              }
              sidebarOpen={sidebarOpen}
            />

            <SidebarItem
              icon={<FolderKanban size={20} />}
              label="Projects"
              path="/projects"
              active={
                location.pathname ===
                "/projects"
              }
              sidebarOpen={sidebarOpen}
            />

            <SidebarItem
              icon={<BriefcaseBusiness size={20} />}
              label="Experience"
              path="/experience"
              active={
                location.pathname ===
                "/experience"
              }
              sidebarOpen={sidebarOpen}
            />

            <SidebarItem
              icon={<Award size={20} />}
              label="Certificates"
              path="/certificates"
              active={
                location.pathname ===
                "/certificates"
              }
              sidebarOpen={sidebarOpen}
            />

            <SidebarItem
              icon={<Code size={20} />}
              label="Public APIs"
              path="/public-apis"
              active={
                location.pathname ===
                "/public-apis"
              }
              sidebarOpen={sidebarOpen}
            />

            <SidebarItem
              icon={<User size={20} />}
              label="Profile"
              path="/profile"
              active={
                location.pathname ===
                "/profile"
              }
              sidebarOpen={sidebarOpen}
            />

          </div>
        </div>

        {/* =========================
          BOTTOM
      ========================= */}

        <div
          className="
          border-t
          border-[var(--border-color)]
          p-4
        "
        >
          <button
            onClick={handleLogout}
            className="
            flex
            w-full
            items-center
            rounded-xl
            px-4
            py-3
            transition-all
            duration-200
            hover:bg-red-500/10
            hover:text-red-500
          "
          >

            <LogOut size={20} />

            {sidebarOpen && (

              <span className="ml-3">

                Logout

              </span>

            )}

          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
