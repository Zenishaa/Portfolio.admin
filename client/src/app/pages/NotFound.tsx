import {
  ArrowLeft,
  Home,
  Moon,
  SearchX,
  Sun,
} from "lucide-react";

import { useTheme } from "next-themes";
import { useNavigate } from "react-router-dom";

function NotFound() {
  const navigate = useNavigate();

  const {
    theme,
    setTheme,
  } = useTheme();

  const isLoggedIn =
    Boolean(
      localStorage.getItem(
        "accessToken"
      )
    );

  const homePath =
    isLoggedIn
      ? "/dashboard"
      : "/";

  return (
    <div
      className="
        min-h-screen
        bg-[var(--bg-main)]
        text-[var(--text-primary)]
        transition-colors
        duration-300
      "
    >
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
          <button
            onClick={() => navigate(homePath)}
            className="
              flex
              cursor-pointer
              items-center
              gap-3
              text-left
            "
          >
            <span
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
            </span>

            <span>
              <span className="block text-lg font-semibold">
                Portfolio Admin
              </span>

              <span
                className="
                  block
                  text-xs
                  text-[var(--text-secondary)]
                "
              >
                Developer Portfolio Platform
              </span>
            </span>
          </button>

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
            aria-label="Toggle theme"
          >
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
      </header>

      <main
        className="
          mx-auto
          flex
          min-h-[calc(100vh-64px)]
          max-w-7xl
          items-center
          px-4
          py-14
          sm:px-6
          lg:px-8
        "
      >
        <section
          className="
            grid
            w-full
            grid-cols-1
            items-center
            gap-12
            lg:grid-cols-[1fr_420px]
          "
        >
          <div>
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
              <SearchX
                size={16}
                className="text-[var(--text-secondary)]"
              />

              <span
                className="
                  text-sm
                  font-medium
                  text-[var(--text-secondary)]
                "
              >
                Page not found
              </span>
            </div>

            <h1
              className="
                mt-8
                max-w-3xl
                text-5xl
                font-bold
                leading-tight
                tracking-tight
                sm:text-6xl
                lg:text-7xl
              "
            >
              404
              <span
                className="
                  block
                  text-[var(--text-muted)]
                "
              >
                Route Missing
              </span>
            </h1>

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
              The page you are looking for does not exist,
              was moved, or is not available in this admin
              workspace.
            </p>

            <div
              className="
                mt-8
                flex
                flex-col
                gap-3
                sm:flex-row
              "
            >
              <button
                onClick={() => navigate(homePath)}
                className="
                  flex
                  items-center
                  justify-center
                  gap-2
                  rounded-2xl
                  bg-[var(--button-primary)]
                  px-5
                  py-3
                  font-medium
                  text-white
                  transition-all
                  duration-300
                  hover:bg-[var(--button-primary-hover)]
                  dark:text-black
                "
              >
                <Home size={18} />
                Go Home
              </button>

              <button
                onClick={() => navigate(-1)}
                className="
                  flex
                  items-center
                  justify-center
                  gap-2
                  rounded-2xl
                  border
                  border-[var(--border-color)]
                  bg-[var(--bg-card)]
                  px-5
                  py-3
                  font-medium
                  transition-all
                  duration-300
                  hover:bg-[var(--bg-secondary)]
                "
              >
                <ArrowLeft size={18} />
                Go Back
              </button>
            </div>
          </div>
{/* 
          <div
            className="
              rounded-[32px]
              border
              border-[var(--border-color)]
              bg-[var(--bg-card)]
              p-6
              shadow-sm
            "
          >
            <div
              className="
                flex
                aspect-square
                items-center
                justify-center
                rounded-[28px]
                bg-[var(--bg-secondary)]
              "
            >
              <div
                className="
                  text-center
                "
              >
                <SearchX
                  size={72}
                  className="
                    mx-auto
                    text-[var(--text-muted)]
                  "
                />

                <p
                  className="
                    mt-6
                    text-sm
                    font-medium
                    uppercase
                    text-[var(--text-secondary)]
                  "
                >
                  Unknown route
                </p>

                <p
                  className="
                    mt-2
                    text-4xl
                    font-bold
                  "
                >
                  404
                </p>
              </div>
            </div>
          </div> */}
        </section>
      </main>
    </div>
  );
}

export default NotFound;
