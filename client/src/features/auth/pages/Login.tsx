import {
  ArrowRight,
  Moon,
  Sun,
  Shield,
  LayoutDashboard,
} from "lucide-react";

import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";

import PageLoader from "@shared/components/ui/PageLoader";
import { verifySession } from "@shared/lib/auth";

const FEATURES = [
  {
    icon: <LayoutDashboard size={20} />,
    title: "Analytics Dashboard",
    desc: "Real-time portfolio metrics, visitor insights, and traffic source breakdowns — all in one place.",
  },
  {
    icon: <Shield size={20} />,
    title: "Secure Multi-Tenant",
    desc: "OAuth 2.0 via GitHub. No passwords, no friction — just instant, safe access to your admin panel.",
  },
];

function Login() {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [githubHovered, setGithubHovered] = useState(false);

  useEffect(() => {
    const errorMsg = searchParams.get("error");
    if (errorMsg) {
      toast.error(errorMsg, { id: "auth-error", duration: 5000 });
      searchParams.delete("error");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    verifySession().then((isValid) => {
      if (isValid) navigate("/dashboard", { replace: true });
    });
  }, []);

  const handleNavigation = (path: string) => {
    setLoading(true);
    setTimeout(() => navigate(path), 700);
  };

  const handleGithubLogin = () => {
    const apiUrl =
      import.meta.env.VITE_API_URL || "https://portfolio-admin-7es8.onrender.com";
    window.location.href = `${apiUrl}/api/auth/github`;
  };

  return (
    <>
      {loading && <PageLoader />}

      <div
        className="relative min-h-screen overflow-hidden gradient-mesh"
        style={{ color: "var(--text-primary)" }}
      >
        {/* ── Glow Orbs ── */}
        <div
          className="pointer-events-none absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 65%)",
            animation: "orb-pulse 10s ease-in-out infinite alternate",
          }}
        />
        <div
          className="pointer-events-none absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 65%)",
            animation: "orb-pulse 8s ease-in-out infinite alternate-reverse",
          }}
        />
        <div
          className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[300px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 65%)",
          }}
        />

        {/* ═══════════════════════════════
            NAVBAR
        ═══════════════════════════════ */}
        <header
          className="relative z-10 flex h-16 items-center justify-between px-6 lg:px-10"
          style={{
            borderBottom: "1px solid var(--border-color)",
            background: "var(--bg-navbar)",
            backdropFilter: "blur(20px)",
          }}
        >
          {/* Logo */}
          <a
            onClick={() => handleNavigation("/")}
            className="flex cursor-pointer items-center gap-3 select-none"
          >
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold text-white"
              style={{
                background: "linear-gradient(135deg, var(--grad-start), var(--grad-end))",
                boxShadow: "0 4px 14px var(--accent-glow)",
              }}
            >
              P
            </div>
            <div>
              <h1 className="text-sm font-semibold">Portfolio Admin</h1>
              <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
                Developer Platform
              </p>
            </div>
          </a>

          {/* Theme Toggle */}
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
              className={`absolute transition-all duration-500 ${theme === "dark"
                  ? "scale-0 rotate-90 opacity-0"
                  : "scale-100 rotate-0 opacity-100 text-amber-500"
                }`}
            />
            <Moon
              size={16}
              className={`absolute transition-all duration-500 ${theme === "dark"
                  ? "scale-100 rotate-0 opacity-100 text-indigo-400"
                  : "scale-0 -rotate-90 opacity-0"
                }`}
            />
          </button>
        </header>

        {/* ═══════════════════════════════
            MAIN
        ═══════════════════════════════ */}
        <main className="relative z-10 mx-auto grid min-h-[calc(100vh-64px)] max-w-7xl grid-cols-1 items-center gap-12 px-6 py-12 lg:grid-cols-2 lg:px-10">

          {/* ── LEFT SIDE ── */}
          <div className="hidden lg:block animate-fade-in-up">
            {/* Status badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-2 text-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--success)] opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--success)]" />
              </span>
              <span className="font-medium text-[var(--text-secondary)]">
                Secure Multi-Tenant Platform
              </span>
            </div>

            {/* Heading */}
            <h1 className="mt-8 text-5xl font-extrabold leading-tight tracking-tight xl:text-6xl">
              Manage Your
              <span
                className="block gradient-text"
              >
                Portfolio Infrastructure
              </span>
            </h1>

            {/* Description */}
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-[var(--text-secondary)]">
              Access your centralized admin dashboard to manage projects, APIs,
              analytics, certificates, and dynamic portfolio content — all in one place.
            </p>

            {/* Feature cards — 2 full-width cards */}
            <div className="mt-10 flex flex-col gap-4">
              {FEATURES.map((feature, i) => (
                <div
                  key={i}
                  className="
                    flex items-start gap-4
                    rounded-2xl border border-[var(--border-color)]
                    bg-[var(--bg-card)] p-5
                    transition-all duration-300
                    hover:-translate-y-0.5 hover:border-[var(--border-accent)]
                  "
                  style={{ boxShadow: "var(--shadow-sm)" }}
                >
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                    style={{
                      background: "linear-gradient(135deg, var(--grad-start), var(--grad-end))",
                      boxShadow: "0 4px 12px var(--accent-glow)",
                      color: "white",
                    }}
                  >
                    {feature.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">
                      {feature.title}
                    </p>
                    <p className="mt-1 text-sm text-[var(--text-muted)] leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT SIDE — Login Card ── */}
          <div className="mx-auto w-full max-w-sm animate-fade-in-up animate-delay-2">
            <div
              className="relative overflow-hidden rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] p-8"
              style={{ boxShadow: "var(--shadow-xl)" }}
            >
              {/* Gradient top accent */}
              <div
                className="absolute top-0 left-0 right-0 h-[3px]"
                style={{
                  background: "linear-gradient(90deg, var(--grad-start), var(--grad-end))",
                }}
              />

              {/* Card inner glow */}
              <div
                className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full opacity-20"
                style={{ background: "radial-gradient(circle, var(--accent), transparent 70%)" }}
              />

              {/* Logo mark */}
              <div className="relative mb-6 text-center">
                <div
                  className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-bold text-white"
                  style={{
                    background: "linear-gradient(135deg, var(--grad-start), var(--grad-end))",
                    boxShadow: "0 8px 24px var(--accent-glow)",
                  }}
                >
                  P
                </div>
                <h2 className="text-2xl font-bold">Welcome Back</h2>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  Sign in to your admin dashboard
                </p>
              </div>

              {/* GitHub Button */}
              <button
                onClick={handleGithubLogin}
                onMouseEnter={() => setGithubHovered(true)}
                onMouseLeave={() => setGithubHovered(false)}
                className="
                  relative flex w-full items-center gap-4 rounded-2xl
                  border border-[var(--border-color)] bg-[var(--bg-secondary)]
                  px-5 py-4
                  transition-all duration-300
                  hover:border-[var(--accent)] hover:bg-[var(--accent-light)]
                  hover:-translate-y-0.5
                "
                style={{
                  boxShadow: githubHovered
                    ? "0 8px 24px var(--accent-glow)"
                    : "var(--shadow-sm)",
                }}
              >
                {/* GitHub icon */}
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-6 w-6 shrink-0 text-[var(--text-primary)]"
                >
                  <path d="M12 0C5.37 0 0 5.37 0 12a12 12 0 008.21 11.39c.6.11.82-.26.82-.58v-2.23c-3.34.72-4.04-1.41-4.04-1.41-.55-1.38-1.34-1.75-1.34-1.75-1.1-.75.08-.74.08-.74 1.21.08 1.85 1.24 1.85 1.24 1.08 1.85 2.83 1.31 3.52 1 .11-.78.42-1.31.76-1.61-2.66-.3-5.47-1.33-5.47-5.92 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23A11.4 11.4 0 0112 5.8c1.02 0 2.05.14 3.01.41 2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.25 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.6-2.81 5.61-5.49 5.91.43.37.82 1.1.82 2.22v3.29c0 .32.22.7.83.58A12 12 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>

                <div className="text-left">
                  <p className="text-xs text-[var(--text-muted)]">Continue with</p>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                    GitHub Authentication
                  </p>
                </div>

                <ArrowRight
                  size={18}
                  className={`ml-auto transition-all duration-300 ${githubHovered
                      ? "translate-x-1 text-[var(--accent)]"
                      : "text-[var(--text-muted)]"
                    }`}
                />
              </button>

              {/* Divider */}
              <div className="my-6 flex items-center gap-3">
                <div className="flex-1 h-px bg-[var(--border-color)]" />
                <span className="text-xs text-[var(--text-muted)] font-medium">SECURE OAUTH</span>
                <div className="flex-1 h-px bg-[var(--border-color)]" />
              </div>

              {/* Security note */}
              <div
                className="flex items-start gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4"
              >
                <Shield size={16} className="mt-0.5 shrink-0 text-[var(--success)]" />
                <p className="text-xs leading-relaxed text-[var(--text-muted)]">
                  Secure OAuth 2.0 via GitHub. No passwords stored.
                  Access your admin dashboard instantly and safely.
                </p>
              </div>
            </div>

            {/* Back to portfolio link */}
            <p className="mt-4 text-center text-xs text-[var(--text-muted)]">
              <button
                onClick={() => handleNavigation("/")}
                className="font-medium text-[var(--accent)] hover:underline"
              >
                ← Back to portfolio
              </button>
            </p>
          </div>
        </main>
      </div>
    </>
  );
}

export default Login;
