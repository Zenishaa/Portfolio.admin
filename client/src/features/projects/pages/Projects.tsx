import {
  Calendar,
  ExternalLink,
  Grid2X2,
  GitBranch,
  LayoutList,
  Plus,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import DashboardLayout from "@layouts/DashboardLayout";
import PortfolioItemCard from "@shared/components/cards/PortfolioItemCard";
import { usePageNavigation } from "@shared/hooks/usePageNavigation";
import PageLoader from "@shared/components/ui/PageLoader";
import api from "@shared/lib/api";

interface Project {
  id: number;
  title: string;
  slug?: string | null;
  description?: string | null;
  publisher?: string | null;
  featured: boolean;
  status?: string | null;
  type?: string | null;
  tags?: unknown;
  links?: unknown;
  thumbnail?: unknown;
  authors_contributors?: unknown;
  date_time?: string | null;
  created_at?: string | null;
}

interface ProjectLink {
  key: string;
  value: string;
}

function Projects() {
  const { handleNavigation } = usePageNavigation();

  /* =========================
      VIEW MODE
  ========================= */

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  /* =========================
      PROJECTS STATE
  ========================= */

  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);

  /* =========================
      FILTER STATE
  ========================= */

  const [activeFilter, setActiveFilter] = useState<"all" | "published" | "draft">("all");

  const parseJsonArray = <T,>(
    value: unknown
  ): T[] => {
    if (Array.isArray(value)) {
      return value as T[];
    }

    if (typeof value !== "string") {
      return [];
    }

    try {
      const parsed =
        JSON.parse(value);

      return Array.isArray(parsed)
        ? parsed as T[]
        : [];
    } catch {
      return [];
    }
  };

  const getProjectLinks = (
    project: Project
  ) =>
    parseJsonArray<ProjectLink>(
      project.links
    ).filter(
      (link) =>
        link.key &&
        link.value
    );

  const getProjectLink = (
    project: Project,
    keys: string[]
  ) =>
    getProjectLinks(project).find(
      (link) =>
        keys.includes(
          link.key
        )
    )?.value;

  const getProjectTags = (
    project: Project
  ) =>
    parseJsonArray<string>(
      project.tags
    );

  const getProjectContributors = (
    project: Project
  ) =>
    parseJsonArray<string>(
      project.authors_contributors
    );

  const getProjectThumbnail = (
    project: Project
  ) => {
    const thumbnail =
      project.thumbnail;

    if (!thumbnail) {
      return undefined;
    }

    let imageUrl: unknown =
      thumbnail;

    if (typeof thumbnail === "string") {
      try {
        const parsed =
          JSON.parse(thumbnail);

        imageUrl =
          parsed;
      } catch {
        imageUrl =
          thumbnail;
      }
    }

    if (
      imageUrl &&
      typeof imageUrl === "object"
    ) {
      const imageRecord =
        imageUrl as {
          secure_url?: string;
          url?: string;
          src?: string;
        };

      imageUrl =
        imageRecord.secure_url ||
        imageRecord.url ||
        imageRecord.src;
    }

    if (
      typeof imageUrl !== "string" ||
      !imageUrl.trim()
    ) {
      return undefined;
    }

    const trimmedUrl =
      imageUrl.trim();

    if (
      /^(https?:|data:|blob:)/i.test(
        trimmedUrl
      )
    ) {
      return trimmedUrl;
    }

    const apiUrl =
      import.meta.env.VITE_API_URL;

    if (!apiUrl) {
      return trimmedUrl;
    }

    return `${String(apiUrl).replace(/\/$/, "")}/${trimmedUrl.replace(/^\//, "")}`;
  };

  const formatDate = (
    value?: string | null
  ) => {
    if (!value) {
      return undefined;
    }

    const date =
      new Date(value);

    if (Number.isNaN(date.getTime())) {
      return undefined;
    }

    return new Intl.DateTimeFormat(
      "en",
      {
        month: "short",
        year: "numeric",
      }
    ).format(date);
  };

  const formatLabel = (
    value?: string | null
  ) =>
    value
      ? value.charAt(0).toUpperCase() +
        value.slice(1)
      : undefined;

  const fetchProjects = async () => {
    try {
      const response = await api.get("/api/projects");
      setProjects(response?.data?.projects ?? []);
    } catch (error: unknown) {
      console.error(
        "Failed to fetch projects",
        error
      );
    } finally {
      setProjectsLoading(false);
    }
  };

  useEffect(() => {
    const timer =
      window.setTimeout(() => {
        void fetchProjects();
      }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  const filteredProjects = projects.filter((project) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "published") {
      return [
        "published",
        "completed",
      ].includes(project.status || "");
    }

    return [
      "draft",
      "drafted",
      "ongoing",
    ].includes(project.status || "");
  });

  if (projectsLoading) {
    return <PageLoader />;
  }

  return (
    <DashboardLayout>

      {/* =========================
          TOP SECTION
      ========================= */}

      <div
        className="
          flex
          flex-col
          gap-4
          lg:flex-row
          lg:items-center
          lg:justify-between
        "
      >
        {/* Left */}

        <div>
          <h1 className="text-3xl font-bold">Projects</h1>

          <p className="mt-2 text-[var(--text-secondary)]">
            Manage your portfolio projects.
          </p>
        </div>

        {/* Right */}

        <button
          onClick={() => handleNavigation("/projects/create")}
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
          <Plus size={18} />
          Add Project
        </button>
      </div>

      {/* =========================
          SEARCH + FILTER
      ========================= */}

      <div
        className="
          mt-8
          flex
          flex-col
          gap-4
          lg:flex-row
          lg:items-center
          lg:justify-between
        "
      >
        {/* Filters */}

        <div className="flex items-center gap-3">
          {(["all", "published", "draft"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`
                rounded-2xl
                border
                px-4
                py-2.5
                text-sm
                font-medium
                transition-all
                duration-300
                ${
                  activeFilter === filter
                    ? "border-[var(--button-primary)] bg-[var(--button-primary)] text-white dark:text-black"
                    : "border-[var(--border-color)] bg-[var(--bg-card)]"
                }
              `}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>

        {/* VIEW TOGGLE */}

        <div
          className="
            flex
            items-center
            rounded-2xl
            border
            border-[var(--border-color)]
            bg-[var(--bg-card)]
            p-1
          "
        >
          {/* GRID */}

          <button
            onClick={() => setViewMode("grid")}
            className={`
              rounded-xl
              p-2.5
              transition-all
              duration-300
              ${
                viewMode === "grid"
                  ? "bg-[var(--button-primary)] text-white dark:text-black"
                  : "text-[var(--text-secondary)]"
              }
            `}
          >
            <Grid2X2 size={18} />
          </button>

          {/* LIST */}

          <button
            onClick={() => setViewMode("list")}
            className={`
              rounded-xl
              p-2.5
              transition-all
              duration-300
              ${
                viewMode === "list"
                  ? "bg-[var(--button-primary)] text-white dark:text-black"
                  : "text-[var(--text-secondary)]"
              }
            `}
          >
            <LayoutList size={18} />
          </button>
        </div>
      </div>

      {/* =========================
          EMPTY STATE
      ========================= */}

      {filteredProjects.length === 0 && (
        <div
          className="
            mt-8
            rounded-3xl
            border
            border-[var(--border-color)]
            bg-[var(--bg-card)]
            p-10
            text-center
          "
        >
          <h3 className="text-xl font-semibold">No Projects Found</h3>

          <p className="mt-2 text-[var(--text-secondary)]">
            {activeFilter === "all"
              ? "Create your first project."
              : `No ${activeFilter} projects yet.`}
          </p>
        </div>
      )}

      {/* =========================
          PROJECT GRID
      ========================= */}

      {viewMode === "grid" && filteredProjects.length > 0 && (
        <div
          className="
            mt-8
            grid
            grid-cols-1
            gap-6
            md:grid-cols-2
            xl:grid-cols-3
          "
        >
          {filteredProjects.map((project) => (
            <PortfolioItemCard
              key={project.id}
              title={project.title}
              description={project.description}
              featured={project.featured}
              status={project.status}
              tags={getProjectTags(project)}
              thumbnail={getProjectThumbnail(project)}
              dateLabel={
                formatDate(project.date_time) ||
                formatDate(project.created_at)
              }
              metaLabel={
                [
                  formatLabel(project.type),
                  project.publisher,
                ]
                  .filter(Boolean)
                  .join(" / ")
              }
              codeAction={
                getProjectLink(project, [
                  "github",
                ])
                  ? {
                      href: getProjectLink(project, [
                        "github",
                      ]),
                    }
                  : undefined
              }
              externalAction={
                getProjectLink(project, [
                  "live",
                  "figma",
                  "youtube",
                  "docs",
                ])
                  ? {
                      href: getProjectLink(project, [
                        "live",
                        "figma",
                        "youtube",
                        "docs",
                      ]),
                    }
                  : undefined
              }
              editAction={{
                onClick: () =>
                  handleNavigation(
                    `/projects/${project.slug || project.id}/edit`
                  ),
              }}
              deleteAction={{
                onClick: () => {
                  console.log(
                    "Delete project",
                    project.slug || project.id
                  );
                },
              }}
            />
          ))}
        </div>
      )}

      {/* =========================
          LIST VIEW
      ========================= */}

      {viewMode === "list" && filteredProjects.length > 0 && (
        <div className="mt-8 space-y-5">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="
                flex
                flex-col
                gap-5
                rounded-[28px]
                border
                border-[var(--border-color)]
                bg-[var(--bg-card)]
                p-6
                transition-all
                duration-300
                hover:shadow-lg
                lg:flex-row
                lg:items-center
                lg:justify-between
              "
            >
              {/* LEFT */}

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  {getProjectThumbnail(project) && (
                    <img
                      src={getProjectThumbnail(project)}
                      alt={project.title}
                      className="
                        h-14
                        w-14
                        rounded-2xl
                        object-cover
                      "
                    />
                  )}

                  <h2 className="text-xl font-semibold">{project.title}</h2>

                  {project.featured && (
                    <div
                      className="
                        rounded-full
                        bg-yellow-100
                        px-3
                        py-1
                        text-xs
                        font-medium
                        text-yellow-700
                      "
                    >
                      Featured
                    </div>
                  )}
                </div>

                <div
                  className="
                    mt-3
                    flex
                    flex-wrap
                    items-center
                    gap-3
                    text-xs
                    font-medium
                    uppercase
                    text-[var(--text-muted)]
                  "
                >
                  {project.type && (
                    <span>
                      {formatLabel(project.type)}
                    </span>
                  )}

                  {project.publisher && (
                    <span>
                      {project.publisher}
                    </span>
                  )}

                  {(project.date_time ||
                    project.created_at) && (
                    <span
                      className="
                        flex
                        items-center
                        gap-1
                      "
                    >
                      <Calendar size={13} />
                      {formatDate(
                        project.date_time
                      ) ||
                        formatDate(
                          project.created_at
                        )}
                    </span>
                  )}
                </div>

                {/* DESCRIPTION */}

                <p
                  className="
                    mt-3
                    max-w-3xl
                    text-sm
                    leading-relaxed
                    text-[var(--text-secondary)]
                  "
                >
                  {project.description ||
                    "No description added."}
                </p>

                {/* TAGS */}

                {getProjectContributors(project).length > 0 && (
                  <p
                    className="
                      mt-3
                      text-sm
                      text-[var(--text-secondary)]
                    "
                  >
                    Contributors:{" "}
                    {getProjectContributors(project).join(", ")}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  {getProjectTags(project).map((tag) => (
                    <div
                      key={tag}
                      className="
                        rounded-full
                        bg-[var(--bg-secondary)]
                        px-3
                        py-1
                        text-xs
                        font-medium
                      "
                    >
                      {tag}
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT */}

              <div
                className="
                  flex
                  flex-col
                  items-start
                  gap-4
                  lg:items-end
                "
              >
                {/* STATUS */}

                <div
                  className={`
                    rounded-full
                    px-4
                    py-2
                    text-sm
                    font-medium
                    ${
                      ["published", "completed"].includes(project.status || "")
                        ? "bg-green-100 text-green-700"
                        : "bg-orange-100 text-orange-700"
                    }
                  `}
                >
                  {project.status}
                </div>

                {/* ACTIONS */}

                <div className="flex flex-wrap gap-3">
                  {getProjectLink(project, ["github"]) && (
                    <a
                      href={getProjectLink(project, ["github"])}
                      target="_blank"
                      rel="noreferrer"
                      className="
                        flex
                        items-center
                        gap-2
                        rounded-xl
                        border
                        border-[var(--border-color)]
                        px-4
                        py-2
                        text-sm
                        font-medium
                        transition-all
                        duration-300
                        hover:bg-[var(--bg-secondary)]
                      "
                    >
                      <GitBranch size={15} />
                      GitHub
                    </a>
                  )}

                  {getProjectLink(project, ["live", "figma", "youtube", "docs"]) && (
                    <a
                      href={getProjectLink(project, ["live", "figma", "youtube", "docs"])}
                      target="_blank"
                      rel="noreferrer"
                      className="
                        flex
                        items-center
                        gap-2
                        rounded-xl
                        border
                        border-[var(--border-color)]
                        px-4
                        py-2
                        text-sm
                        font-medium
                        transition-all
                        duration-300
                        hover:bg-[var(--bg-secondary)]
                      "
                    >
                      <ExternalLink size={15} />
                      Open
                    </a>
                  )}

                  <button
                    onClick={() =>
                      handleNavigation(
                        `/projects/${project.slug || project.id}/edit`
                      )
                    }
                    className="
                      rounded-xl
                      border
                      border-[var(--border-color)]
                      px-4
                      py-2
                      text-sm
                      font-medium
                      transition-all
                      duration-300
                      hover:bg-[var(--bg-secondary)]
                    "
                  >
                    Edit
                  </button>

                  <button
                    className="
                      rounded-xl
                      border
                      border-red-200
                      px-4
                      py-2
                      text-sm
                      font-medium
                      text-red-500
                      transition-all
                      duration-300
                      hover:bg-red-50
                    "
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </DashboardLayout>
  );
}

export default Projects;
