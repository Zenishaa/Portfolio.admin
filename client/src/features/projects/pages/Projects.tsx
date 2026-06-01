import {
  Calendar,
  ExternalLink,
  Grid2X2,
  GitBranch,
  LayoutList,
  Plus,
  Star,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import DashboardLayout from "@layouts/DashboardLayout";
import PortfolioItemCard from "@shared/components/cards/PortfolioItemCard";
import { useNavigate } from "react-router-dom";
import PageLoader from "@shared/components/ui/PageLoader";
import api from "@shared/lib/api";
import { toast } from "react-hot-toast";
import { deleteProject, updateProject } from "@features/projects/services/project.service";

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

/* =========================
    STATUS FILTERS CONFIG
========================= */

const RESEARCH_STATUSES = ["published", "drafted", "underreview"] as const;
const PROJECT_STATUSES = ["ongoing", "completed"] as const;

type TypeFilter = "all" | "research" | "project";

function Projects() {
  const navigate = useNavigate();

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

  const [activeTypeFilter, setActiveTypeFilter] = useState<TypeFilter>("all");
  const [activeStatusFilter, setActiveStatusFilter] = useState<string>("all");
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Reset status filter when type changes
  const handleTypeFilterChange = (type: TypeFilter) => {
    setActiveTypeFilter(type);
    setActiveStatusFilter("all");
  };

  // Get available status filters based on selected type
  const statusFilters = useMemo(() => {
    if (activeTypeFilter === "research") {
      return ["all", ...RESEARCH_STATUSES];
    }
    if (activeTypeFilter === "project") {
      return ["all", ...PROJECT_STATUSES];
    }
    return [];
  }, [activeTypeFilter]);

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

  const STATUS_LABELS: Record<string, string> = {
    ongoing: "Ongoing",
    completed: "Completed",
    published: "Published",
    drafted: "Drafted",
    underreview: "Under Review",
  };

  const formatStatus = (value?: string | null) =>
    value ? STATUS_LABELS[value] ?? formatLabel(value) : undefined;

  const fetchProjects = async () => {
    try {
      const response = await api.get("/api/projects");
      if (response.data.success) {
        setProjects(response.data.projects);
      }
    } catch (error) {
      console.error("Failed to fetch projects", error);
    } finally {
      setProjectsLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!projectToDelete?.slug && !projectToDelete?.id) return;
    
    try {
      setIsDeleting(true);
      const slug = projectToDelete.slug || String(projectToDelete.id);
      const res = await deleteProject(slug);
      
      if (res?.success) {
        toast.success("Project deleted successfully");
        setProjectToDelete(null);
        fetchProjects();
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete project");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleFeatured = async (project: Project) => {
    const slug = project.slug || String(project.id);
    const newFeatured = !project.featured;
    
    // Optimistic update
    setProjects(projects.map(p => p.id === project.id ? { ...p, featured: newFeatured } : p));
    
    try {
      const formData = new FormData();
      formData.append("featured", String(newFeatured));
      
      const res = await updateProject(slug, formData);
      if (res?.success) {
        toast.success(`Project ${newFeatured ? "featured" : "unfeatured"} successfully`);
      } else {
        throw new Error();
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update featured status");
      // Revert on error
      setProjects(projects.map(p => p.id === project.id ? { ...p, featured: project.featured } : p));
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

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      // Type filter
      if (activeTypeFilter !== "all") {
        const projectType = (project.type || "").toLowerCase();
        if (projectType !== activeTypeFilter) {
          return false;
        }
      }

      // Status sub-filter
      if (activeStatusFilter !== "all") {
        const projectStatus = (project.status || "").toLowerCase();
        if (projectStatus !== activeStatusFilter) {
          return false;
        }
      }

      return true;
    });
  }, [projects, activeTypeFilter, activeStatusFilter]);

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
          onClick={() => navigate("/projects/create")}
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
          FILTERS + VIEW TOGGLE
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

        <div className="flex flex-col gap-3">
          {/* Type Filters */}

          <div className="flex items-center gap-3">
            {(["all", "research", "project"] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => handleTypeFilterChange(filter)}
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
                    activeTypeFilter === filter
                      ? "border-[var(--button-primary)] bg-[var(--button-primary)] text-white dark:text-black"
                      : "border-[var(--border-color)] bg-[var(--bg-card)]"
                  }
                `}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>

          {/* Status Sub-Filters (only when a specific type is selected) */}

          {statusFilters.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {statusFilters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveStatusFilter(filter)}
                  className={`
                    rounded-xl
                    border
                    px-3
                    py-1.5
                    text-xs
                    font-medium
                    transition-all
                    duration-300
                    ${
                      activeStatusFilter === filter
                        ? "border-[var(--button-primary)] bg-[var(--button-primary)]/10 text-[var(--button-primary)]"
                        : "border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)]"
                    }
                  `}
                >
                  {filter === "underreview"
                    ? "Under Review"
                    : filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          )}
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
            {activeTypeFilter === "all" && activeStatusFilter === "all"
              ? "Create your first project."
              : `No ${activeStatusFilter !== "all" ? activeStatusFilter : ""} ${activeTypeFilter !== "all" ? activeTypeFilter : ""} projects yet.`.trim().replace(/\s+/g, " ")}
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
              status={formatStatus(project.status)}
              tags={getProjectTags(project)}
              thumbnail={getProjectThumbnail(project)}
              dateLabel={
                formatDate(project.date_time) ||
                formatDate(project.created_at)
              }
              metaLabel={
                [
                  formatLabel(project.type),
                  (project.type || "").toLowerCase() === "research" && project.publisher
                    ? project.publisher
                    : null,
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
                  navigate(
                    `/projects/${project.slug || project.id}/edit`
                  ),
              }}
              deleteAction={{
                onClick: () => setProjectToDelete(project),
              }}
              onToggleFeatured={() => handleToggleFeatured(project)}
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
                        flex
                        items-center
                        gap-1
                        rounded-full
                        bg-yellow-100
                        px-3
                        py-1
                        text-xs
                        font-medium
                        text-yellow-700
                      "
                    >
                      <Star size={13} />
                      Featured
                    </div>
                  )}

                  <button
                    onClick={() => handleToggleFeatured(project)}
                    title={project.featured ? "Unfeature Project" : "Feature Project"}
                    className={`
                      relative
                      h-6
                      w-11
                      shrink-0
                      rounded-full
                      transition-all
                      duration-300
                      ${project.featured ? "bg-[var(--button-primary)]" : "bg-gray-300 dark:bg-gray-700"}
                    `}
                  >
                    <div
                      className={`
                        absolute
                        top-1
                        h-4
                        w-4
                        rounded-full
                        bg-white
                        shadow-sm
                        transition-all
                        duration-300
                        ${project.featured ? "left-[26px]" : "left-1"}
                      `}
                    />
                  </button>
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

                  {(project.type || "").toLowerCase() === "research" && project.publisher && (
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
                  {formatStatus(project.status)}
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
                      navigate(
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
                    onClick={() => setProjectToDelete(project)}
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

      {/* =========================
          DELETE MODAL
      ========================= */}

      {projectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[32px] border border-[var(--border-color)] bg-[var(--bg-main)] p-6 shadow-2xl">
            <h3 className="text-xl font-bold">Delete Project</h3>
            <p className="mt-2 text-[var(--text-secondary)]">
              Are you sure you want to delete "{projectToDelete.title}"? This action cannot be undone.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setProjectToDelete(null)}
                disabled={isDeleting}
                className="rounded-xl px-5 py-2.5 text-sm font-medium transition-all duration-300 hover:bg-[var(--bg-secondary)] disabled:opacity-50"
              >
                Cancel
              </button>
              
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="rounded-xl bg-red-500 px-5 py-2.5 text-sm font-medium text-white transition-all duration-300 hover:bg-red-600 disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}

export default Projects;
