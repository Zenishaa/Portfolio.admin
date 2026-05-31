import {
  Grid2X2,
  LayoutList,
  Plus,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import DashboardLayout from "../layouts/DashboardLayout";
import ProjectCard from "../components/dashboard/cards/ProjectCard";
import { usePageNavigation } from "../hooks/usePageNavigation";
import PageLoader from "../components/ui/PageLoader";
import api from "../services/api";

interface Project {
  id: number;
  title: string;
  description: string;
  featured: boolean;
  status: string;
  tags: string[];
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

  const fetchProjects = async () => {
    try {
      const response = await api.get("/api/projects");
      setProjects(response?.data?.projects ?? []);
    } catch (error: any) {
      console.log("ERROR");
      console.log(error.response);
    } finally {
      setProjectsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const filteredProjects = projects.filter((project) => {
    if (activeFilter === "all") return true;
    return project.status === activeFilter;
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
            <ProjectCard
              key={project.id}
              title={project.title}
              description={project.description}
              featured={project.featured}
              status={project.status}
              tags={project.tags || []}
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
                <div className="flex items-center gap-3">
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
                  {project.description}
                </p>

                {/* TAGS */}

                <div className="mt-4 flex flex-wrap gap-2">
                  {(project.tags || []).map((tag, tagIndex) => (
                    <div
                      key={tagIndex}
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
                      project.status === "published"
                        ? "bg-green-100 text-green-700"
                        : "bg-orange-100 text-orange-700"
                    }
                  `}
                >
                  {project.status}
                </div>

                {/* ACTIONS */}

                <div className="flex gap-3">
                  <button
                    onClick={() =>
                      handleNavigation(`/projects/${project.id}/edit`)
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
