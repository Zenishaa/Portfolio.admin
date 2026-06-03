import {
  ArrowRight,
  Moon,
  Sun,
} from "lucide-react";

import { useTheme } from "next-themes";

import { useState, useEffect } from "react";

import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";

import PageLoader from "@shared/components/ui/PageLoader";

import { verifySession } from "@shared/lib/auth";

function Login() {
  const { theme, setTheme } = useTheme();

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  // Handle URL errors (e.g. rate limits or OAuth failures)
  useEffect(() => {
    const errorMsg = searchParams.get("error");
    if (errorMsg) {
      toast.error(errorMsg, {
        id: "auth-error",
        duration: 5000,
      });
      // Remove error from URL so it doesn't trigger again on refresh
      searchParams.delete("error");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Check if user is already authenticated
  useEffect(() => {
    verifySession().then((isValid) => {
      if (isValid) {
        navigate("/dashboard", { replace: true });
      }
    });
  }, []);

  const handleNavigation = (
    path: string
  ) => {
    setLoading(true);

    setTimeout(() => {
      navigate(path);
    }, 700);
  };

  const handleGithubLogin = () => {
    const apiUrl =
      import.meta.env.VITE_API_URL ||
      "https://portfolio-admin-7es8.onrender.com";

    window.location.href =
      `${apiUrl}/api/auth/github`;
  };

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
        {/* =========================
            NAVBAR
        ========================= */}

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
              onClick={() =>
                handleNavigation("/")
              }
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

            {/* Right Actions */}

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
            </div>
          </div>
        </header>

        {/* =========================
            MAIN
        ========================= */}

        <main
          className="
            mx-auto
            grid
            min-h-[calc(100vh-64px)]
            max-w-7xl
            grid-cols-1
            items-center
            gap-14
            px-4
            py-10
            sm:px-6
            lg:grid-cols-2
            lg:px-8
          "
        >
          {/* =========================
              LEFT SIDE
          ========================= */}

          <div className="hidden lg:block">
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
                Secure Multi-Tenant Platform
              </p>
            </div>

            {/* Heading */}

            <h1
              className="
                mt-8
                text-5xl
                font-bold
                leading-tight
                tracking-tight
              "
            >
              Manage Your

              <span
                className="
                  block
                  text-[var(--text-muted)]
                "
              >
                Portfolio Infrastructure
              </span>
            </h1>

            {/* Description */}

            <p
              className="
                mt-6
                max-w-xl
                text-lg
                leading-relaxed
                text-[var(--text-secondary)]
              "
            >
              Access your centralized portfolio
              dashboard to manage projects,
              APIs, analytics, certificates,
              and dynamic public portfolio
              content.
            </p>

            {/* Features */}

            <div className="mt-10 space-y-5">
              {[
                "Dynamic Public Portfolio APIs",
                "Advanced Analytics Dashboard",
                "Secure Multi-Tenant Architecture",
                "Project & Certificate Management",
              ].map((feature, index) => (
                <div
                  key={index}
                  className="
                    flex
                    items-center
                    gap-3
                  "
                >
                  <div className="h-2 w-2 rounded-full bg-[var(--button-primary)]"></div>

                  <p
                    className="
                      text-[var(--text-secondary)]
                    "
                  >
                    {feature}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* =========================
              RIGHT SIDE
          ========================= */}


        <div
          className="
            mx-auto
            w-full
            max-w-md
          "
        >
          {/* CARD */}

          <div
            className="
              rounded-[32px]
              border
              border-[var(--border-color)]
              bg-[var(--bg-card)]
              p-6
              shadow-xl
              sm:p-8
            "
            style={{
              boxShadow:
                "0 10px 30px var(--shadow-color)",
            }}
          >
            {/* TOP */}

            <div className="text-center">

              <h2
                className="
                  text-3xl
                  font-bold
                "
              >
                Welcome Back
              </h2>

              <p
                className="
                  mt-2
                  text-sm
                  text-[var(--text-secondary)]
                "
              >
                Continue securely using GitHub
              </p>

            </div>

            {/* =========================
                GITHUB AUTH
            ========================= */}

            <div className="mt-10">

              {/* GITHUB BUTTON */}

              <button
                onClick={handleGithubLogin}
                className="
                  flex
                  w-full
                  items-center
                  justify-center
                  gap-4
                  rounded-2xl
                  border
                  border-[var(--border-color)]
                  bg-[var(--bg-main)]
                  px-6
                  py-4
                  transition-all
                  duration-300
                  hover:scale-[1.01]
                  hover:border-[var(--button-primary)]
                  hover:shadow-lg
                "
              >
                {/* GitHub Icon */}

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="
                    h-6
                    w-6
                  "
                >
                  <path d="M12 0C5.37 0 0 5.37 0 12a12 12 0 008.21 11.39c.6.11.82-.26.82-.58v-2.23c-3.34.72-4.04-1.41-4.04-1.41-.55-1.38-1.34-1.75-1.34-1.75-1.1-.75.08-.74.08-.74 1.21.08 1.85 1.24 1.85 1.24 1.08 1.85 2.83 1.31 3.52 1 .11-.78.42-1.31.76-1.61-2.66-.3-5.47-1.33-5.47-5.92 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23A11.4 11.4 0 0112 5.8c1.02 0 2.05.14 3.01.41 2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.25 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.6-2.81 5.61-5.49 5.91.43.37.82 1.1.82 2.22v3.29c0 .32.22.7.83.58A12 12 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>

                <div className="text-left">

                  <p
                    className="
                      text-sm
                      text-[var(--text-secondary)]
                    "
                  >
                    Continue with
                  </p>

                  <h3
                    className="
                      text-base
                      font-semibold
                    "
                  >
                    GitHub Authentication
                  </h3>

                </div>

                <ArrowRight
                  size={18}
                  className="
                    ml-auto
                    text-[var(--text-secondary)]
                  "
                />

              </button>

              {/* Info Card */}

              <div
                className="
                  mt-8
                  rounded-2xl
                  border
                  border-[var(--border-color)]
                  bg-[var(--bg-main)]
                  p-5
                "
              >
                <p
                  className="
                    text-sm
                    leading-relaxed
                    text-[var(--text-secondary)]
                  "
                >
                  Secure OAuth authentication
                  powered by GitHub. Access
                  your admin dashboard
                  instantly without managing
                  passwords manually.
                </p>

              </div>

            </div>
            </div>
        </div>
        </main>
      </div>
    </>
  );
}

export default Login;
