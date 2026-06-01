import {
  Download,
  ExternalLink,
  Eye,
  FolderKanban,
  GitBranch,
  Mail,
  Users,
} from "lucide-react";

import DashboardLayout from "@layouts/DashboardLayout";

import StatCard from "@shared/components/cards/StatCard";

const popularProjects = [
  {
    name: "AI Portfolio Platform",
    views: 842,
  },
  {
    name: "Deepfake Detection System",
    views: 617,
  },
];

function Dashboard() {
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

          <h1
            className="
              text-3xl
              font-bold
            "
          >
            Dashboard
          </h1>

          <p
            className="
              mt-2
              text-[var(--text-secondary)]
            "
          >
            Welcome back to your portfolio
            admin dashboard.
          </p>

        </div>

        {/* Right */}

        {/* <button
          className="
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
          Create Project
        </button> */}
      </div>

      {/* =========================
          STATS SECTION
      ========================= */}

      <div
        className="
          mt-8
          grid
          grid-cols-1
          gap-5
          sm:grid-cols-2
          xl:grid-cols-4
        "
      >
        <StatCard
          title="Total Visits"
          value="24.8K"
          growth="+12%"
          icon={<Eye size={22} />}
        />

        <StatCard
          title="Unique Visitors"
          value="18.4K"
          growth="+9%"
          icon={<Users size={22} />}
        />

        <StatCard
          title="GitHub Clicks"
          value="4.2K"
          growth="+18%"
          icon={<GitBranch size={22} />}
        />

        <StatCard
          title="Live Demo Clicks"
          value="2.1K"
          growth="+14%"
          icon={<ExternalLink size={22} />}
        />

        <StatCard
          title="Resume Downloads"
          value="1.4K"
          growth="+6%"
          icon={<Download size={22} />}
        />

        <StatCard
          title="Project Clicks"
          value="8.9K"
          growth="+22%"
          icon={<FolderKanban size={22} />}
        />

        <StatCard
          title="Contact Submissions"
          value="324"
          growth="+11%"
          icon={<Mail size={22} />}
        />
      </div>
 
      {/* =========================
          LOWER GRID
      ========================= */}

      <div
        className="
          mt-8
          grid
          grid-cols-1
          gap-6
          lg:grid-cols-2
        "
      >
        {/* Popular Projects */}

        <div
          className="
            rounded-[32px]
            border
            border-[var(--border-color)]
            bg-[var(--bg-card)]
            p-6
          "
        >
          <div
            className="
              flex
              items-center
              justify-between
            "
          >
            <div>

              <h2
                className="
                  text-xl
                  font-semibold
                "
              >
                Popular Projects
              </h2>

              <p
                className="
                  mt-1
                  text-sm
                  text-[var(--text-secondary)]
                "
              >
                Most viewed projects
              </p>

            </div>

            <button
              className="
                text-sm
                font-medium
                text-[var(--button-primary)]
              "
            >
              View All
            </button>
          </div>

          {/* Projects */}

          <div className="mt-8 space-y-5">

            {popularProjects.map((project) => (
              <div
                key={project.name}
                className="
                  flex
                  items-center
                  justify-between
                "
              >
                <div
                  className="
                    flex
                    items-center
                    gap-3
                  "
                >
                  <div
                    className="
                      flex
                      h-12
                      w-12
                      items-center
                      justify-center
                      rounded-2xl
                      bg-[var(--bg-secondary)]
                    "
                  >
                    <FolderKanban
                      size={20}
                    />
                  </div>

                  <div>

                    <h3 className="font-medium">
                      {project.name}
                    </h3>

                    <p
                      className="
                        text-sm
                        text-[var(--text-secondary)]
                      "
                    >
                      Active Project
                    </p>

                  </div>
                </div>

                <div
                  className="
                    text-sm
                    font-medium
                    text-[var(--text-secondary)]
                  "
                >
                  {project.views} views
                </div>
              </div>
            ))}

          </div>
        </div>

        {/* Quick Actions */}

        <div
          className="
            rounded-[32px]
            border
            border-[var(--border-color)]
            bg-[var(--bg-card)]
            p-6
          "
        >
          <div>

            <h2
              className="
                text-xl
                font-semibold
              "
            >
              Quick Actions
            </h2>

            <p
              className="
                mt-1
                text-sm
                text-[var(--text-secondary)]
              "
            >
              Fast portfolio management
            </p>

          </div>

          {/* Actions */}

          <div
            className="
              mt-8
              grid
              grid-cols-1
              gap-4
              sm:grid-cols-2
            "
          >
            {[
              "Add Project",
              "Upload Resume",
              "Add Certificate",
              "Update Skills",
            ].map((action, index) => (
              <button
                key={index}
                className="
                  rounded-2xl
                  border
                  border-[var(--border-color)]
                  bg-[var(--bg-main)]
                  px-5
                  py-4
                  text-left
                  font-medium
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:border-[var(--button-primary)]
                "
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      </div>

    </DashboardLayout>
  );
}

export default Dashboard;
