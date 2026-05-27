import { Plus } from "lucide-react";
import { useState } from "react";

import DashboardLayout from "../layouts/DashboardLayout";
import AchievementCard from "../components/dashboard/cards/AchievementCard";
import { usePageNavigation } from "../hooks/usePageNavigation";
import PageLoader from "../components/ui/PageLoader";

type AchievementItem = {
  title: string;
  type: "achievement" | "certificate";
  issuedBy: string;
  issueDate: string;
  link: string;
  image: string;
  isVisible: boolean;
};

function Achievements() {
  const { loading, handleNavigation } = usePageNavigation();

  const [achievements, setAchievements] = useState<AchievementItem[]>([
    {
      title: "AWS Cloud Practitioner",
      type: "certificate",
      issuedBy: "Amazon Web Services",
      issueDate: "2026-03-10",
      link: "https://example.com/aws-cert",
      image: "",
      isVisible: true,
    },
    {
      title: "Hackathon Winner - Smart City",
      type: "achievement",
      issuedBy: "TechFest 2026",
      issueDate: "2026-02-01",
      link: "https://example.com/hackathon",
      image: "",
      isVisible: false,
    },
    {
      title: "Google Data Analytics",
      type: "certificate",
      issuedBy: "Coursera",
      issueDate: "2025-12-15",
      link: "",
      image: "",
      isVisible: true,
    },
  ]);

  const toggleVisibility = (index: number) => {
    setAchievements((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, isVisible: !item.isVisible } : item
      )
    );
  };

  return (
    <>
      {loading && <PageLoader />}

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
            <h1 className="text-3xl font-bold">Achievements & Certificates</h1>
            <p className="mt-2 text-[var(--text-secondary)]">
              Manage your achievements and certificates.
            </p>
          </div>

          <button
            onClick={() => handleNavigation("/achievements/create")}
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
            Add Achievement
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
            <button
              className="
                rounded-2xl
                border
                border-[var(--border-color)]
                bg-[var(--bg-card)]
                px-4
                py-2.5
                text-sm
                font-medium
              "
            >
              All
            </button>

            <button
              className="
                rounded-2xl
                border
                border-[var(--border-color)]
                bg-[var(--bg-card)]
                px-4
                py-2.5
                text-sm
                font-medium
              "
            >
              Achievement
            </button>

            <button
              className="
                rounded-2xl
                border
                border-[var(--border-color)]
                bg-[var(--bg-card)]
                px-4
                py-2.5
                text-sm
                font-medium
              "
            >
              Certificate
            </button>
          </div>
        </div>

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
          {achievements.map((item, index) => (
            <AchievementCard
              key={index}
              title={item.title}
              type={item.type}
              issuedBy={item.issuedBy}
              issueDate={item.issueDate}
              link={item.link}
              image={item.image}
              isVisible={item.isVisible}
              onToggleVisibility={() => toggleVisibility(index)}
            />
          ))}
        </div>
      </DashboardLayout>
    </>
  );
}

export default Achievements;