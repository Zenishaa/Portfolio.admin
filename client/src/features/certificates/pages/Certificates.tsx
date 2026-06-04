import {
  Calendar,
  ExternalLink,
  Grid2X2,
  LayoutList,
  Pencil,
  Plus,
  Star,
  Trash2,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { isAxiosError } from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import {
  deleteCertificate,
  getCertificates,
  updateCertificate,
} from "@features/certificates/services/certificate.service";
import DashboardLayout from "@layouts/DashboardLayout";
import AchievementCard from "@shared/components/cards/AchievementCard";
import PageLoader from "@shared/components/ui/PageLoader";

type CertificateType =
  | "achievement"
  | "certificate";

type Certificate = {
  id: number;
  title: string;
  slug: string;
  type: CertificateType;
  link?: string | null;
  images?: unknown;
  archive_status?: string | null;
  issued_by?: string | null;
  issue_date?: string | null;
  created_at?: string | null;
};

type TypeFilter =
  | "all"
  | CertificateType;

const isVisibleCertificate = (
  certificate: Certificate
) =>
  certificate.archive_status !==
  "archived";

function Certificates() {
  const navigate = useNavigate();

  const [
    viewMode,
    setViewMode,
  ] = useState<"grid" | "list">(
    "grid"
  );

  const [
    activeTypeFilter,
    setActiveTypeFilter,
  ] = useState<TypeFilter>(
    "all"
  );

  const [
    certificates,
    setCertificates,
  ] = useState<Certificate[]>([]);

  const [
    certificatesLoading,
    setCertificatesLoading,
  ] = useState(true);

  const [
    certificateToDelete,
    setCertificateToDelete,
  ] = useState<Certificate | null>(
    null
  );

  const [
    isDeleting,
    setIsDeleting,
  ] = useState(false);

  const fetchCertificates =
    async () => {
      try {
        const data = await getCertificates();

        if (data.success) {
          setCertificates(data.certificates);
        }
      } catch (error) {
        console.error(
          "Failed to fetch certificates",
          error
        );

        toast.error(
          "Failed to load certificates"
        );
      } finally {
        setCertificatesLoading(false);
      }
    };


  useEffect(() => {
    void fetchCertificates();
  }, []);

  const filteredCertificates =
    useMemo(
      () =>
        certificates.filter(
          (item) =>
            activeTypeFilter ===
            "all"
              ? true
              : item.type ===
                activeTypeFilter
        ),
      [
        activeTypeFilter,
        certificates,
      ]
    );

  const getCertificateCoverImage = (
    certificate: Certificate
  ) => {
    const images = certificate.images;

    if (!images) {
      return "";
    }

    const resolveImageUrl = (
      value: unknown
    ) => {
      if (
        typeof value === "string" &&
        value.trim()
      ) {
        return value.trim();
      }

      if (
        value &&
        typeof value === "object"
      ) {
        const imageRecord = value as {
          secure_url?: string;
          url?: string;
          src?: string;
        };

        return (
          imageRecord.secure_url ||
          imageRecord.url ||
          imageRecord.src ||
          ""
        );
      }

      return "";
    };

    if (Array.isArray(images)) {
      return resolveImageUrl(images[0]);
    }

    if (typeof images === "string") {
      try {
        const parsed = JSON.parse(images);

        if (Array.isArray(parsed)) {
          return resolveImageUrl(parsed[0]);
        }

        return resolveImageUrl(parsed);
      } catch {
        return resolveImageUrl(images);
      }
    }

    return resolveImageUrl(images);
  };

  const formatDate = (
    value?: string | null
  ) => {
    if (!value) {
      return "No date";
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "No date";
    }

    return new Intl.DateTimeFormat(
      "en",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    ).format(date);
  };

  const formatTypeLabel = (
    type: CertificateType
  ) =>
    type.charAt(0).toUpperCase() +
    type.slice(1);

  const handleToggleVisibility =
    async (
      certificate: Certificate
    ) => {
      const nextStatus =
        isVisibleCertificate(
          certificate
        )
          ? "archived"
          : "active";

      setCertificates((prev) =>
        prev.map((item) =>
          item.id ===
          certificate.id
            ? {
                ...item,
                archive_status:
                  nextStatus,
              }
            : item
        )
      );

      try {
        const formData =
          new FormData();

        formData.append(
          "archive_status",
          nextStatus
        );

        const response =
          await updateCertificate(
            certificate.slug,
            formData
          );

        if (
          response?.success
        ) {
          toast.success(
            nextStatus ===
              "active"
              ? "Certificate visible on portfolio"
              : "Certificate hidden from portfolio"
          );
        }
      } catch (error) {
        console.error(error);

        setCertificates((prev) =>
          prev.map((item) =>
            item.id ===
            certificate.id
              ? certificate
              : item
          )
        );

        toast.error(
          "Failed to update visibility"
        );
      }
    };

  const handleDeleteConfirm =
    async () => {
      if (
        !certificateToDelete
      ) {
        return;
      }

      try {
        setIsDeleting(true);

        const response =
          await deleteCertificate(
            certificateToDelete.slug
          );

        if (
          response?.success
        ) {
          toast.success(
            "Certificate deleted successfully"
          );

          setCertificateToDelete(
            null
          );

          void fetchCertificates();
        }
      } catch (error) {
        console.error(error);

        const message =
          isAxiosError<{
            message?: string;
          }>(error)
            ? error.response
              ?.data
              ?.message
            : undefined;

        toast.error(
          message ||
            "Failed to delete certificate"
        );
      } finally {
        setIsDeleting(false);
      }
    };

  if (
    certificatesLoading
  ) {
    return <PageLoader />;
  }

  return (
    <DashboardLayout>
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
        <div>
          <h1 className="text-3xl font-bold">
            Certificates
          </h1>

          <p className="mt-2 text-[var(--text-secondary)]">
            Manage your certificates and achievements.
          </p>
        </div>

        <button
          onClick={() =>
            navigate(
              "/certificates/create"
            )
          }
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
          Add Certificate
        </button>
      </div>

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
        <div className="flex items-center gap-3">
          {(
            [
              "all",
              "certificate",
              "achievement",
            ] as const
          ).map((filter) => (
            <button
              key={filter}
              onClick={() =>
                setActiveTypeFilter(
                  filter
                )
              }
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
                  activeTypeFilter ===
                  filter
                    ? "border-[var(--button-primary)] bg-[var(--button-primary)] text-white dark:text-black"
                    : "border-[var(--border-color)] bg-[var(--bg-card)]"
                }
              `}
            >
              {filter === "all"
                ? "All"
                : formatTypeLabel(
                    filter
                  )}
            </button>
          ))}
        </div>

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
          <button
            onClick={() =>
              setViewMode("grid")
            }
            className={`
              rounded-xl
              p-2.5
              transition-all
              duration-300
              ${
                viewMode ===
                "grid"
                  ? "bg-[var(--button-primary)] text-white dark:text-black"
                  : "text-[var(--text-secondary)]"
              }
            `}
            aria-label="Show certificates as cards"
            title="Card view"
          >
            <Grid2X2 size={18} />
          </button>

          <button
            onClick={() =>
              setViewMode("list")
            }
            className={`
              rounded-xl
              p-2.5
              transition-all
              duration-300
              ${
                viewMode ===
                "list"
                  ? "bg-[var(--button-primary)] text-white dark:text-black"
                  : "text-[var(--text-secondary)]"
              }
            `}
            aria-label="Show certificates as list"
            title="List view"
          >
            <LayoutList size={18} />
          </button>
        </div>
      </div>

      {filteredCertificates.length ===
        0 && (
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
          <h3 className="text-xl font-semibold">
            No Certificates Found
          </h3>

          <p className="mt-2 text-[var(--text-secondary)]">
            {activeTypeFilter ===
            "all"
              ? "Create your first certificate."
              : `No ${activeTypeFilter} items yet.`}
          </p>
        </div>
      )}

      {viewMode === "grid" &&
        filteredCertificates.length >
          0 && (
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
            {filteredCertificates.map(
              (item) => (
                <AchievementCard
                  key={item.id}
                  title={item.title}
                  type={item.type}
                  issuedBy={
                    item.issued_by ||
                    undefined
                  }
                  issueDate={formatDate(
                    item.issue_date
                  )}
                  link={
                    item.link ||
                    undefined
                  }
                  image={getCertificateCoverImage(
                    item
                  )}
                  isVisible={isVisibleCertificate(
                    item
                  )}
                  onToggleVisibility={() =>
                    void handleToggleVisibility(
                      item
                    )
                  }
                  onEdit={() =>
                    navigate(
                      `/certificates/${item.slug}/edit`
                    )
                  }
                  onDelete={() =>
                    setCertificateToDelete(
                      item
                    )
                  }
                />
              )
            )}
          </div>
        )}

      {viewMode === "list" &&
        filteredCertificates.length >
          0 && (
          <div className="mt-8 space-y-5">
            {filteredCertificates.map(
              (item) => (
                <div
                  key={item.id}
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
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 flex-1 items-start gap-3">
                        {getCertificateCoverImage(
                          item
                        ) && (
                          <img
                            src={getCertificateCoverImage(
                              item
                            )}
                            alt={item.title}
                            className="
                              h-14
                              w-14
                              rounded-2xl
                              object-cover
                            "
                          />
                        )}

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-3">
                            <h2 className="text-xl font-semibold">
                              {item.title}
                            </h2>

                            <div
                              className={`
                                rounded-full
                                px-3
                                py-1
                                text-xs
                                font-medium
                                ${
                                  item.type ===
                                  "certificate"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-amber-100 text-amber-700"
                                }
                              `}
                            >
                              {formatTypeLabel(
                                item.type
                              )}
                            </div>
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
                            <span>
                              {item.issued_by ||
                                "N/A"}
                            </span>
                          </div>

                          <p
                            className="
                              mt-3
                              max-w-3xl
                              text-sm
                              leading-relaxed
                              text-[var(--text-secondary)]
                            "
                          >
                            {isVisibleCertificate(
                              item
                            )
                              ? "Visible on public portfolio."
                              : "Hidden from public portfolio."}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          void handleToggleVisibility(
                            item
                          )
                        }
                        aria-label={
                          isVisibleCertificate(
                            item
                          )
                            ? "Hide from portfolio"
                            : "Show on portfolio"
                        }
                        title={
                          isVisibleCertificate(
                            item
                          )
                            ? "Hide from portfolio"
                            : "Show on portfolio"
                        }
                        className={`
                          flex
                          h-10
                          w-10
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          border
                          transition-all
                          duration-300
                          ${
                            isVisibleCertificate(
                              item
                            )
                              ? "border-amber-200 bg-amber-50 text-amber-500 hover:bg-amber-100"
                              : "border-[var(--border-color)] text-gray-400 hover:bg-[var(--bg-secondary)]"
                          }
                        `}
                      >
                        <Star
                          size={16}
                          fill={
                            isVisibleCertificate(
                              item
                            )
                              ? "currentColor"
                              : "none"
                          }
                        />
                      </button>
                    </div>

                  <div
                    className="
                      mt-5
                      flex
                      flex-wrap
                      items-end
                      justify-between
                      gap-4
                    "
                  >
                    <div
                      className="
                        flex
                        items-center
                        gap-2
                        text-sm
                        text-[var(--text-secondary)]
                      "
                    >
                      <Calendar size={15} />
                      {formatDate(
                        item.issue_date
                      )}
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {item.link && (
                        <a
                          href={item.link}
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
                          View
                        </a>
                      )}

                      <button
                        onClick={() =>
                          navigate(
                            `/certificates/${item.slug}/edit`
                          )
                        }
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
                        <Pencil size={15} />
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          setCertificateToDelete(
                            item
                          )
                        }
                        className="
                          flex
                          items-center
                          gap-2
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
                        <Trash2 size={15} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
                </div>
              )
            )}
          </div>
        )}

      {certificateToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[32px] border border-[var(--border-color)] bg-[var(--bg-main)] p-6 shadow-2xl">
            <h3 className="text-xl font-bold">
              Delete Certificate
            </h3>

            <p className="mt-2 text-[var(--text-secondary)]">
              Are you sure you want to delete "
              {certificateToDelete.title}"? This action cannot be undone.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() =>
                  setCertificateToDelete(
                    null
                  )
                }
                disabled={isDeleting}
                className="rounded-xl px-5 py-2.5 text-sm font-medium transition-all duration-300 hover:bg-[var(--bg-secondary)] disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={
                  handleDeleteConfirm
                }
                disabled={isDeleting}
                className="rounded-xl bg-red-500 px-5 py-2.5 text-sm font-medium text-white transition-all duration-300 hover:bg-red-600 disabled:opacity-50"
              >
                {isDeleting
                  ? "Deleting..."
                  : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default Certificates;
