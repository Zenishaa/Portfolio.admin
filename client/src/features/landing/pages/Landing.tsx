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

  useEffect(() => {
    verifySession().then((isValid) => {
      if (isValid) navigate("/dashboard", { replace: true });
    });
  }, []);

  const handleNavigation = (path: string) => {
    setLoading(true);
    setTimeout(() => navigate(path), 700);
  };

  const stats = [
    { icon: <BarChart3 size={22} />,       value: "24.8K", label: "Portfolio Views" },
    { icon: <ShieldCheck size={22} />,     value: "12.4K", label: "API Requests"    },
    { icon: <BriefcaseBusiness size={22}/>,value: "48",    label: "Projects Added"  },
    { icon: <Database size={22} />,        value: "99.9%", label: "System Health"   },
  ];

  /* Gradient colours to cycle through stat icon containers */
  const statGrads = [
    "linear-gradient(135deg,#6366f1,#8b5cf6)",
    "linear-gradient(135deg,#3b82f6,#6366f1)",
    "linear-gradient(135deg,#10b981,#059669)",
    "linear-gradient(135deg,#f59e0b,#ef4444)",
  ];

  /* Bar heights for the mini chart */
  const bars = [
    { h: "h-24", active: true  },
    { h: "h-16", active: false },
    { h: "h-40", active: true  },
    { h: "h-20", active: false },
    { h: "h-32", active: true  },
    { h: "h-14", active: false },
  ];

  return (
    <>
      {loading && <PageLoader />}

      {/* ── Gradient mesh wrapper (same as Login) ── */}
      <div
        className="relative min-h-screen overflow-hidden gradient-mesh text-[var(--text-primary)] transition-colors duration-300"
      >
        {/* Glow orb — top-left */}
        <div
          className="pointer-events-none absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 65%)",
            animation:  "orb-pulse 10s ease-in-out infinite alternate",
          }}
        />
        {/* Glow orb — bottom-right */}
        <div
          className="pointer-events-none absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 65%)",
            animation:  "orb-pulse 8s ease-in-out infinite alternate-reverse",
          }}
        />

        {/* ══════════════════════════════════
            NAVBAR
        ══════════════════════════════════ */}
        <header
          className="sticky top-0 z-50 flex h-16 items-center justify-between px-6 lg:px-10"
          style={{
            background:           "var(--bg-navbar)",
            backdropFilter:       "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderBottom:         "1px solid var(--border-color)",
          }}
        >
          {/* Logo */}
          <a
            onClick={() => navigate("/")}
            className="flex cursor-pointer items-center gap-3 select-none"
          >
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold text-white"
              style={{
                background: "linear-gradient(135deg, var(--grad-start), var(--grad-end))",
                boxShadow:  "0 4px 14px var(--accent-glow)",
              }}
            >
              P
            </div>
            <div>
              <h1 className="text-sm font-semibold">Portfolio Admin</h1>
              <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                Developer Portfolio Platform
              </p>
            </div>
          </a>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {/* Theme toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="
                relative flex h-9 w-9 items-center justify-center rounded-xl
                border border-[var(--border-color)] bg-[var(--bg-card)]
                transition-all duration-200
                hover:border-[var(--accent)] hover:bg-[var(--accent-light)]
              "
              aria-label="Toggle theme"
            >
              <Sun
                size={16}
                className={`absolute transition-all duration-500 ${
                  theme === "dark"
                    ? "scale-0 rotate-90 opacity-0"
                    : "scale-100 rotate-0 opacity-100 text-amber-500"
                }`}
              />
              <Moon
                size={16}
                className={`absolute transition-all duration-500 ${
                  theme === "dark"
                    ? "scale-100 rotate-0 opacity-100 text-indigo-400"
                    : "scale-0 -rotate-90 opacity-0"
                }`}
              />
            </button>

            {/* Get Started CTA in navbar */}
            {/* <button
              onClick={() => handleNavigation("/login")}
              className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 hover:scale-[1.02]"
              style={{
                background: "linear-gradient(135deg, var(--grad-start), var(--grad-end))",
                boxShadow:  "0 4px 14px var(--accent-glow)",
              }}
            >
              Get Started <ArrowRight size={14} />
            </button> */}
          </div>
        </header>

        {/* ══════════════════════════════════
            HERO
        ══════════════════════════════════ */}
        <main
          className="
            relative z-10 mx-auto grid
            min-h-[calc(100vh-64px)]
            max-w-7xl
            grid-cols-1 items-center gap-14
            px-6 py-12
            lg:grid-cols-2 lg:px-10
          "
        >
          {/* ── LEFT ── */}
          <div className="animate-fade-in-up">
            {/* Status badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--success)] opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--success)]" />
              </span>
              <p className="text-sm font-medium text-[var(--text-secondary)]">
                Modern SaaS Portfolio Infrastructure
              </p>
            </div>

            {/* Heading */}
            <h1 className="mt-8 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Manage Your
              <span className="block gradient-text">
                Portfolio Ecosystem
              </span>
            </h1>

            {/* Description */}
            <p className="mt-6 max-w-xl text-base leading-relaxed text-[var(--text-secondary)] sm:text-lg">
              A modern developer-focused dashboard for managing projects, analytics,
              APIs, certificates, portfolio content, and dynamic public portfolio infrastructure.
            </p>

            {/* Buttons */}
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              {/* Primary */}
              <button
                onClick={() => handleNavigation("/login")}
                className="flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:opacity-90 hover:-translate-y-0.5"
                style={{
                  background: "linear-gradient(135deg, var(--grad-start), var(--grad-end))",
                  boxShadow:  "0 8px 24px var(--accent-glow)",
                }}
              >
                Get Started <ArrowRight size={16} />
              </button>

              {/* Secondary */}
              <button
                className="
                  rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)]
                  px-6 py-3 text-sm font-semibold
                  transition-all duration-300
                  hover:border-[var(--accent)] hover:bg-[var(--accent-light)]
                "
              >
                Documentation
              </button>
            </div>
          </div>

          {/* ── RIGHT — Dashboard preview card ── */}
          <div className="animate-fade-in-up animate-delay-2">
            <div
              className="relative overflow-hidden rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 lg:p-7"
              style={{ boxShadow: "var(--shadow-xl)" }}
            >
              {/* Gradient top stripe */}
              <div
                className="absolute top-0 left-0 right-0 h-[3px]"
                style={{ background: "linear-gradient(90deg, var(--grad-start), var(--grad-end))" }}
              />

              {/* Inner glow */}
              <div
                className="pointer-events-none absolute -top-20 -right-20 h-44 w-44 rounded-full opacity-20"
                style={{ background: "radial-gradient(circle, var(--accent), transparent 70%)" }}
              />

              {/* Card header */}
              <div className="relative mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-[var(--text-primary)]">
                    Dashboard Overview
                  </h2>
                  <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                    Monitor your portfolio infrastructure
                  </p>
                </div>

                <span
                  className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
                  style={{
                    background: "var(--success-light)",
                    color:      "var(--success)",
                  }}
                >
                  <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: "var(--success)" }} />
                  Live
                </span>
              </div>

              {/* Stats grid */}
              <div className="relative grid grid-cols-2 gap-3">
                {stats.map((item, i) => (
                  <div
                    key={i}
                    className="
                      rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)]
                      p-4 transition-all duration-300
                      hover:-translate-y-1 hover:border-[var(--border-accent)]
                    "
                    style={{ boxShadow: "var(--shadow-sm)" }}
                  >
                    {/* Icon */}
                    <div
                      className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl text-white"
                      style={{
                        background: statGrads[i],
                        boxShadow:  `0 4px 12px rgba(99,102,241,0.25)`,
                      }}
                    >
                      {item.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-[var(--text-primary)]">
                      {item.value}
                    </h3>
                    <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* Mini bar chart */}
              <div
                className="relative mt-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4"
              >
                <p className="mb-3 text-xs font-medium text-[var(--text-muted)]">
                  Weekly Traffic
                </p>
                <div className="flex h-36 items-end gap-2">
                  {bars.map((bar, i) => (
                    <div
                      key={i}
                      className={`${bar.h} flex-1 rounded-xl transition-all duration-300 hover:opacity-80`}
                      style={
                        bar.active
                          ? { background: "linear-gradient(180deg, var(--grad-start), var(--grad-end))", boxShadow: "0 4px 12px var(--accent-glow)" }
                          : { background: "var(--bg-tertiary)" }
                      }
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

export default App;
