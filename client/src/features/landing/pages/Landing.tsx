import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  Database,
  Moon,
  ShieldCheck,
  Sun,
} from "lucide-react";

import { useTheme } from "next-themes";

import { useNavigate } from "react-router-dom";

import { useState, useEffect } from "react";

import PageLoader from "@shared/components/ui/PageLoader";

import { verifySession } from "@shared/lib/auth";

function App() {
  const { theme, setTheme } = useTheme();

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  // Check if user is already authenticated
  useEffect(() => {
    verifySession().then((isValid) => {
      if (isValid) {
        navigate("/dashboard", { replace: true });
      }
    });
  }, []);

  const handleNavigation = (path: string) => {
    setLoading(true);

    setTimeout(() => {
      navigate(path);
    }, 700);
  };

  const stats = [
    {
      icon: <BarChart3 size={26} />,
      value: "24.8K",
      label: "Portfolio Views",
    },
    {
      icon: <ShieldCheck size={26} />,
      value: "12.4K",
      label: "API Requests",
    },
    {
      icon: <BriefcaseBusiness size={26} />,
      value: "48",
      label: "Projects Added",
    },
    {
      icon: <Database size={26} />,
      value: "99.9%",
      label: "System Health",
    },
  ];

  return (
    <>
      {loading && <PageLoader />}

      <div
        className="
          min-h-screen
          bg-[var(--bg-main)]
          text-[var(--text-primary)]
          transition-colors
          duration-300
        "
      >
        {/* NAVBAR */}

        <header
          className="
            sticky
            top-0
            z-50
            border-b
            border-[var(--border-color)]
            bg-[var(--bg-card)]/80
            backdrop-blur
          "
        >
          <div
            className="
              mx-auto
              flex
              h-16
              max-w-7xl
              items-center
              justify-between
              px-4
              sm:px-6
              lg:px-8
            "
          >
            {/* Logo */}

            <a
              onClick={() => navigate("/")}
              className="
                flex
                cursor-pointer
                items-center
                gap-3
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

              <div>
                <h1 className="text-lg font-semibold">
                  Portfolio Admin
                </h1>

                <p
                  className="
                    text-xs
                    text-[var(--text-secondary)]
                  "
                >
                  Developer Portfolio Platform
                </p>
              </div>
            </a>

            {/* Actions */}

            <div className="flex items-center gap-3">
              {/* Theme Toggle */}

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
                  transition-all
                  duration-300
                  hover:scale-105
                "
              >
                {/* Sun */}

                <Sun
                  size={19}
                  className={`
                    absolute
                    transition-all
                    duration-500
                    ${
                      theme === "dark"
                        ? "scale-0 rotate-90 opacity-0"
                        : "scale-100 rotate-0 opacity-100 text-amber-500"
                    }
                  `}
                />

                {/* Moon */}

                <Moon
                  size={19}
                  className={`
                    absolute
                    transition-all
                    duration-500
                    ${
                      theme === "dark"
                        ? "scale-100 rotate-0 opacity-100 text-slate-300"
                        : "scale-0 -rotate-90 opacity-0"
                    }
                  `}
                />
              </button>

              {/* Login */}
{/* 
              <button
                onClick={() =>
                  handleNavigation("/login")
                }
                className="
                  rounded-2xl
                  bg-[var(--button-primary)]
                  px-5
                  py-2.5
                  text-sm
                  font-medium
                  text-white
                  transition-all
                  duration-300
                  hover:bg-[var(--button-primary-hover)]
                  dark:text-black
                "
              >
                Login
              </button> */}
            </div>
          </div>
        </header>

        {/* HERO SECTION */}

        <main
          className="
            mx-auto
            grid
            min-h-[calc(100vh-64px)]
            max-w-7xl
            grid-cols-1
            items-center
            gap-16
            px-4
            py-14
            sm:px-6
            lg:grid-cols-2
            lg:px-8
          "
        >
          {/* LEFT */}

          <div>
            {/* Badge */}

            <div
              className="
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-[var(--border-color)]
                bg-[var(--bg-card)]
                px-4
                py-2
                shadow-sm
              "
            >
              <div className="h-2 w-2 rounded-full bg-green-500"></div>

              <p
                className="
                  text-sm
                  font-medium
                  text-[var(--text-secondary)]
                "
              >
                Modern SaaS Portfolio Infrastructure
              </p>
            </div>

            {/* Heading */}

            <h1
              className="
                mt-8
                text-4xl
                font-bold
                leading-tight
                tracking-tight
                sm:text-5xl
                lg:text-6xl
              "
            >
              Manage Your

              <span
                className="
                  block
                  text-[var(--text-muted)]
                "
              >
                Portfolio Ecosystem
              </span>
            </h1>

            {/* Description */}

            <p
              className="
                mt-6
                max-w-2xl
                text-base
                leading-relaxed
                text-[var(--text-secondary)]
                sm:text-lg
              "
            >
              A modern developer-focused dashboard
              for managing projects, analytics,
              APIs, certificates, portfolio content,
              and dynamic public portfolio
              infrastructure.
            </p>

            {/* Buttons */}

            <div
              className="
                mt-10
                flex
                flex-col
                gap-4
                sm:flex-row
              "
            >
              {/* Get Started */}

              <button
                onClick={() =>
                  handleNavigation("/login")
                }
                className="
                  flex
                  items-center
                  justify-center
                  gap-2
                  rounded-2xl
                  bg-[var(--button-primary)]
                  px-6
                  py-3
                  font-medium
                  text-white
                  transition-all
                  duration-300
                  hover:bg-[var(--button-primary-hover)]
                  dark:text-black
                "
              >
                Get Started

                <ArrowRight size={18} />
              </button>

              {/* Docs */}

              <button
                className="
                  rounded-2xl
                  border
                  border-[var(--border-color)]
                  bg-[var(--bg-card)]
                  px-6
                  py-3
                  font-medium
                  transition-all
                  duration-300
                  hover:bg-[var(--bg-secondary)]
                "
              >
                Documentation
              </button>
            </div>
          </div>

          {/* RIGHT */}

          <div
            className="
              rounded-[32px]
              border
              border-[var(--border-color)]
              bg-[var(--bg-card)]
              p-5
              shadow-xl
              sm:p-6
              lg:p-8
            "
            style={{
              boxShadow:
                "0 10px 30px var(--shadow-color)",
            }}
          >
            {/* Top */}

            <div
              className="
                mb-8
                flex
                flex-col
                gap-4
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >
              <div>
                <h2 className="text-xl font-semibold">
                  Dashboard Overview
                </h2>

                <p
                  className="
                    mt-1
                    text-sm
                    text-[var(--text-secondary)]
                  "
                >
                  Monitor your portfolio infrastructure
                </p>
              </div>

              <div
                className="
                  w-fit
                  rounded-xl
                  bg-[var(--bg-secondary)]
                  px-4
                  py-2
                  text-sm
                  font-medium
                  text-[var(--text-secondary)]
                "
              >
                Live Analytics
              </div>
            </div>

            {/* Stats */}

            <div
              className="
                grid
                grid-cols-1
                gap-4
                sm:grid-cols-2
              "
            >
              {stats.map((item, index) => (
                <div
                  key={index}
                  className="
                    rounded-2xl
                    border
                    border-[var(--border-color)]
                    bg-[var(--bg-card)]
                    p-5
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:shadow-md
                  "
                >
                  <div
                    className="
                      mb-4
                      text-[var(--text-secondary)]
                    "
                  >
                    {item.icon}
                  </div>

                  <h3 className="text-3xl font-bold">
                    {item.value}
                  </h3>

                  <p
                    className="
                      mt-1
                      text-sm
                      text-[var(--text-secondary)]
                    "
                  >
                    {item.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Graph */}

            <div
              className="
                mt-6
                rounded-2xl
                border
                border-[var(--border-color)]
                bg-[var(--bg-card)]
                p-5
              "
            >
              <div
                className="
                  flex
                  h-44
                  items-end
                  gap-3
                "
              >
                <div className="h-24 w-full rounded-xl bg-[var(--button-primary)]"></div>

                <div className="h-16 w-full rounded-xl bg-[var(--bg-secondary)]"></div>

                <div className="h-40 w-full rounded-xl bg-[var(--button-primary)]"></div>

                <div className="h-20 w-full rounded-xl bg-[var(--bg-secondary)]"></div>

                <div className="h-32 w-full rounded-xl bg-[var(--button-primary)]"></div>

                <div className="h-14 w-full rounded-xl bg-[var(--bg-secondary)]"></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

export default App;
