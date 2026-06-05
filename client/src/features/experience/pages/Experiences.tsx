import {
  Calendar,
  ExternalLink,
  Grid2X2,
  LayoutList,
  MapPin,
  Monitor,
  Plus,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

import DashboardLayout from "@layouts/DashboardLayout";
import ExperienceCard from "@shared/components/cards/ExperienceCard";
import PageLoader from "@shared/components/ui/PageLoader";
import { getExperiences, deleteExperience } from "@features/experience/services/experience.service";

interface ExperienceLink {
  key: string;
  value: string;
}

interface Experience {
  id: number;
  title: string;
  slug: string;
  description?: string | null;
  start_date: string;
  end_date?: string | null;
  is_current: boolean;
  links?: unknown;
  images?: unknown;
  company: string;
  location?: string | null;
  mode?: string | null;
  created_at?: string | null;
}

type ModeFilter = "all" | "remote" | "on-site" | "hybrid";
type StatusFilter = "all" | "current" | "past";

function Experiences() {
  const navigate = useNavigate();

  /* =========================
      VIEW MODE
  ========================= */
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  /* =========================
      EXPERIENCES STATE
  ========================= */
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);

  /* =========================
      FILTER STATE
  ========================= */
  const [activeModeFilter, setActiveModeFilter] = useState<ModeFilter>("all");
  const [activeStatusFilter, setActiveStatusFilter] = useState<StatusFilter>("all");
  const [expToDelete, setExpToDelete] = useState<Experience | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const parseJsonArray = <T,>(value: unknown): T[] => {
    if (Array.isArray(value)) {
      return value as T[];
    }
    if (typeof value !== "string") {
      return [];
    }
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch {
      return [];
    }
  };

  const getExperienceLinks = (exp: Experience) => {
    return parseJsonArray<ExperienceLink>(exp.links).filter(
      (link) => link.key && link.value
    );
  };

  const getExperienceImages = (exp: Experience) => {
    return parseJsonArray<string>(exp.images);
  };

  const formatDate = (value?: string | null) => {
    if (!value) return undefined;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return undefined;
    return new Intl.DateTimeFormat("en", {
      month: "short",
      year: "numeric",
    }).format(date);
  };

  const fetchExperiences = async () => {
    try {
      const data = await getExperiences();
      if (data.success) {
        setExperiences(data.experiences);
      }
    } catch (error) {
      console.error("Failed to fetch experiences", error);
      toast.error("Failed to load experiences");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!expToDelete?.slug) return;
    try {
      setIsDeleting(true);
      const res = await deleteExperience(expToDelete.slug);
      if (res?.success) {
        toast.success("Experience deleted successfully");
        setExpToDelete(null);
        fetchExperiences();
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete experience");
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    fetchExperiences();
  }, []);

  const filteredExperiences = useMemo(() => {
    return experiences.filter((exp) => {
      // Mode filter
      if (activeModeFilter !== "all") {
        const mode = (exp.mode || "").toLowerCase();
        if (mode !== activeModeFilter) {
          return false;
        }
      }

      // Status filter
      if (activeStatusFilter !== "all") {
        if (activeStatusFilter === "current" && !exp.is_current) {
          return false;
        }
        if (activeStatusFilter === "past" && exp.is_current) {
          return false;
        }
      }

      return true;
    });
  }, [experiences, activeModeFilter, activeStatusFilter]);

  if (loading) {
    return <PageLoader />;
  }

  return (
    <DashboardLayout>
      {/* =========================
          TOP SECTION
      ========================= */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Work Experience</h1>
          <p className="mt-2 text-[var(--text-secondary)]">
            Manage your career history and professional experience.
          </p>
        </div>

        <button
          onClick={() => navigate("/experience/create")}
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
          Add Experience
        </button>
      </div>

      {/* =========================
          FILTERS + VIEW TOGGLE
      ========================= */}
      <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Mode Filters */}
          <div className="flex items-center gap-2">
            {(["all", "remote", "on-site", "hybrid"] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveModeFilter(filter)}
                className={`
                  rounded-2xl
                  border
                  px-4
                  py-2
                  text-xs
                  font-medium
                  transition-all
                  duration-300
                  ${
                    activeModeFilter === filter
                      ? "border-[var(--button-primary)] bg-[var(--button-primary)] text-white dark:text-black"
                      : "border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)]"
                  }
                `}
              >
                {filter === "all" ? "All Modes" : filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>

          {/* Status Filters */}
          <div className="flex items-center gap-2">
            {(["all", "current", "past"] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveStatusFilter(filter)}
                className={`
                  rounded-2xl
                  border
                  px-4
                  py-2
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
                {filter === "all" ? "All Time" : filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* VIEW TOGGLE */}
        <div className="flex items-center rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-1">
          {/* GRID */}
          <button
            onClick={() => setViewMode("grid")}
            className={`
              rounded-xl
              p-2
              transition-all
              duration-300
              ${
                viewMode === "grid"
                  ? "bg-[var(--button-primary)] text-white dark:text-black"
                  : "text-[var(--text-secondary)]"
              }
            `}
          >
            <Grid2X2 size={16} />
          </button>

          {/* LIST */}
          <button
            onClick={() => setViewMode("list")}
            className={`
              rounded-xl
              p-2
              transition-all
              duration-300
              ${
                viewMode === "list"
                  ? "bg-[var(--button-primary)] text-white dark:text-black"
                  : "text-[var(--text-secondary)]"
              }
            `}
          >
            <LayoutList size={16} />
          </button>
        </div>
      </div>

      {/* =========================
          EMPTY STATE
      ========================= */}
      {filteredExperiences.length === 0 && (
        <div className="mt-8 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] p-10 text-center">
          <h3 className="text-xl font-semibold">No Experiences Found</h3>
          <p className="mt-2 text-[var(--text-secondary)]">
            Create your first work experience entry to showcase your history.
          </p>
        </div>
      )}

      {/* =========================
          GRID VIEW
      ========================= */}
      {viewMode === "grid" && filteredExperiences.length > 0 && (
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredExperiences.map((exp) => (
            <ExperienceCard
              key={exp.id}
              title={exp.title}
              company={exp.company}
              description={exp.description}
              start_date={exp.start_date}
              end_date={exp.end_date}
              is_current={exp.is_current}
              location={exp.location}
              mode={exp.mode}
              images={getExperienceImages(exp)}
              links={getExperienceLinks(exp)}
              editAction={{
                onClick: () => navigate(`/experience/${exp.slug}/edit`),
              }}
              deleteAction={{
                onClick: () => setExpToDelete(exp),
              }}
            />
          ))}
        </div>
      )}

      {/* =========================
          LIST VIEW
      ========================= */}
      {viewMode === "list" && filteredExperiences.length > 0 && (
        <div className="mt-8 space-y-4">
          {filteredExperiences.map((exp) => {
            const expImages = getExperienceImages(exp);
            const expLinks = getExperienceLinks(exp);
            return (
              <div
                key={exp.id}
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
                <div className="flex-1">
                  <div className="flex items-start gap-4">
                    {expImages.length > 0 && (
                      <img
                        src={expImages[0]}
                        alt={exp.company}
                        className="
                          h-14
                          w-14
                          rounded-2xl
                          object-cover
                          border
                          border-[var(--border-color)]
                        "
                      />
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-xl font-semibold">{exp.title}</h2>
                        <span className="text-sm font-medium text-[var(--text-muted)]">
                          at {exp.company}
                        </span>

                        {exp.is_current && (
                          <div className="rounded-full bg-green-100 text-green-700 px-3 py-1 text-xs font-medium">
                            Current
                          </div>
                        )}
                      </div>

                      {/* Meta stats */}
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[var(--text-muted)] font-medium">
                        {exp.location && (
                          <div className="flex items-center gap-1">
                            <MapPin size={12} />
                            <span>{exp.location}</span>
                          </div>
                        )}
                        {exp.mode && (
                          <div className="flex items-center gap-1">
                            <Monitor size={12} />
                            <span className="capitalize">{exp.mode}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar size={12} />
                          <span>
                            {formatDate(exp.start_date)} —{" "}
                            {exp.is_current ? "Present" : formatDate(exp.end_date) || "N/A"}
                          </span>
                        </div>
                      </div>

                      {exp.description && (
                        <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
                          {exp.description}
                        </p>
                      )}

                      {/* Links */}
                      {expLinks.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {expLinks.map((link) => (
                            <a
                              key={link.key}
                              href={link.value}
                              target="_blank"
                              rel="noreferrer"
                              className="
                                inline-flex
                                items-center
                                gap-1
                                rounded-xl
                                bg-[var(--bg-secondary)]
                                border
                                border-[var(--border-color)]
                                px-2.5
                                py-0.5
                                text-xs
                                font-medium
                                text-[var(--text-secondary)]
                                hover:bg-[var(--bg-card)]
                              "
                            >
                              <span className="capitalize">{link.key}</span>
                              <ExternalLink size={10} />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 mt-4 lg:mt-0">
                  <button
                    onClick={() => navigate(`/experience/${exp.slug}/edit`)}
                    className="
                      rounded-xl
                      border
                      border-[var(--border-color)]
                      px-4
                      py-2
                      text-sm
                      font-medium
                      hover:bg-[var(--bg-secondary)]
                      transition-all
                    "
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => setExpToDelete(exp)}
                    className="
                      rounded-xl
                      border
                      border-red-200
                      px-4
                      py-2
                      text-sm
                      font-medium
                      text-red-500
                      hover:bg-red-50
                      transition-all
                    "
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =========================
          DELETE MODAL
      ========================= */}
      {expToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[32px] border border-[var(--border-color)] bg-[var(--bg-main)] p-6 shadow-2xl">
            <h3 className="text-xl font-bold">Delete Experience</h3>
            <p className="mt-2 text-[var(--text-secondary)]">
              Are you sure you want to delete your experience at "{expToDelete.company}"? This action cannot be undone.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setExpToDelete(null)}
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

export default Experiences;
