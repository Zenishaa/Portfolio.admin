import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import {
  Award,
  ArrowRight,
  Clock,
  Download,
  ExternalLink,
  Eye,
  FolderKanban,
  GitBranch,
  Mail,
  BriefcaseBusiness,
  Monitor,
  Smartphone,
  Tablet,
  Users,
  Zap,
  RefreshCw,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "@layouts/DashboardLayout";

type Range = "7d" | "30d" | "90d" | "1y";
type DashboardView = "analytics" | "added";

type DashboardSummary = {
  visits: number;
  uniqueVisitors: number;
  githubClicks: number;
  liveDemoClicks: number;
  resumeDownloads: number;
  projectClicks: number;
  contactSubmissions: number;
};

type AddedCounts = {
  totalProjectsAdded: number;
  researchsAdded: number;
  experienceAdded: number;
  achievementsAdded: number;
  certificationsAdded: number;
  apiKeysAdded: number;
};

type TimelinePoint = {
  date: string;
  visits: number;
  uniqueVisitors: number;
  githubClicks: number;
  liveDemoClicks: number;
  resumeDownloads: number;
  projectClicks: number;
  contactSubmissions: number;
};

type CountryPoint = {
  country: string;
  visits: number;
};

type SourcePoint = {
  source: string;
  visits: number;
};

type DevicePoint = {
  device: string;
  value: number;
};

type TopProject = {
  project_id: number | null;
  project_slug: string | null;
  title: string;
  clicks: number;
};

type ActivityItem = {
  id: number;
  type: string;
  created_at: string;
  country?: string | null;
  device_type?: string | null;
  source?: string | null;
  path?: string | null;
  referrer?: string | null;
  project_slug?: string | null;
  project_id?: number | null;
};

type DashboardResponse = {
  success: boolean;
  filter: Range;
  selectedCountry: string;
  dashboard?: unknown;
  summary: DashboardSummary;
  addedCounts?: AddedCounts;
  totalEvents: number;
  graphData: TimelinePoint[];
  countryBreakdown: CountryPoint[];
  deviceBreakdown: DevicePoint[];
  sourceBreakdown: SourcePoint[];
  topProjects: TopProject[];
  recentActivity: ActivityItem[];
  availableCountries: string[];
};

const RANGES: Array<{ value: Range; label: string }> = [
  { value: "7d", label: "7D" },
  { value: "30d", label: "30D" },
  { value: "90d", label: "90D" },
  { value: "1y", label: "1Y" },
];

const DEVICE_COLORS: Record<string, string> = {
  desktop: "#6366f1",
  mobile: "#3b82f6",
  tablet: "#8b5cf6",
  unknown: "#94a3b8",
};

const SOURCE_COLORS = [
  "#6366f1",
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
];

function formatCount(value: number) {
  const safeValue = Number.isFinite(value) ? value : 0;

  return new Intl.NumberFormat("en", {
    notation: safeValue >= 1000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(safeValue);
}

function safeNumber(value: unknown) {
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

function formatLabel(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function formatActivityLabel(type: string) {
  const map: Record<string, string> = {
    portfolio_visit: "Portfolio visit",
    github_click: "GitHub click",
    live_demo_click: "Live demo click",
    resume_download: "Resume download",
    project_click: "Project click",
    contact_submission: "Contact submission",
  };

  return map[type] || formatLabel(type);
}

function DashboardToggle({
  value,
  onChange,
}: {
  value: DashboardView;
  onChange: (value: DashboardView) => void;
}) {
  return (
    <div className="flex items-center rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-1">
      {[
        { value: "analytics" as const, label: "Analytics" },
        { value: "added" as const, label: "Library" },
      ].map((item) => (
        <button
          key={item.value}
          onClick={() => onChange(item.value)}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
            value === item.value
              ? "text-white"
              : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          }`}
          style={
            value === item.value
              ? {
                  background: "linear-gradient(135deg, var(--grad-start), var(--grad-end))",
                }
              : undefined
          }
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

function getAuthToken() {
  const keys = [
    "accessToken",
    "access_token",
    "token",
    "authToken",
    "jwt",
  ];

  for (const key of keys) {
    const value = localStorage.getItem(key);
    if (value) return value;
  }

  return null;
}

function KpiCard({
  title,
  value,
  icon,
  accent,
}: {
  title: string;
  value: string;
  icon: ReactNode;
  accent: string;
}) {
  return (
    <div
      className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5"
      style={{ boxShadow: "var(--shadow-sm)" }}
    >
      <div className="flex items-start justify-between">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
          style={{ background: accent }}
        >
          {icon}
        </div>
      </div>
      <p className="mt-3 text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
        {title}
      </p>
      <h3 className="mt-1 text-2xl font-bold tracking-tight text-[var(--text-primary)]">
        {value}
      </h3>
    </div>
  );
}

function SectionCard({
  title,
  subtitle,
  children,
  action,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div
      className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5"
      style={{ boxShadow: "var(--shadow-sm)" }}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-[var(--text-primary)]">{title}</h3>
          {subtitle ? (
            <p className="mt-0.5 text-xs text-[var(--text-muted)]">{subtitle}</p>
          ) : null}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number; color?: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div
      className="rounded-xl border border-[var(--border-color)] p-3 text-sm shadow-xl"
      style={{ background: "var(--bg-card)", minWidth: 160 }}
    >
      <p className="mb-2 font-semibold text-[var(--text-secondary)]">{label}</p>
      {payload.map((item, index) => (
        <div key={index} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-[var(--text-muted)]">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ background: item.color }}
            />
            {item.name}
          </span>
          <span className="font-semibold text-[var(--text-primary)]">
            {formatCount(safeNumber(item.value))}
          </span>
        </div>
      ))}
    </div>
  );
}

function DashboardLoadingState() {
  return (
    <DashboardLayout>
      <div className="space-y-6 animate-pulse">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="h-3 w-44 rounded bg-[var(--bg-secondary)]" />
            <div className="h-8 w-72 rounded bg-[var(--bg-secondary)]" />
            <div className="h-4 w-[520px] max-w-full rounded bg-[var(--bg-secondary)]" />
          </div>
          <div className="flex gap-2">
            <div className="h-10 w-20 rounded-xl bg-[var(--bg-secondary)]" />
            <div className="h-10 w-28 rounded-xl bg-[var(--bg-secondary)]" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {Array.from({ length: 12 }).map((_, index) => (
            <div
              key={index}
              className="h-28 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)]"
            />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2 h-[360px] rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)]" />
          <div className="h-[360px] rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)]" />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="h-[360px] rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)]" />
          <div className="h-[360px] rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)]" />
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [range, setRange] = useState<Range>("7d");
  const [dashboardView, setDashboardView] = useState<DashboardView>("analytics");
  const [country, setCountry] = useState("ALL");
  const [reloadIndex, setReloadIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError(null);

        const apiUrl = import.meta.env.VITE_API_URL || "";
        const token = getAuthToken();
        const query = new URLSearchParams({
          filter: range,
          country,
        });

        const response = await fetch(`${apiUrl}/api/dashboard?${query.toString()}`, {
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : undefined,
        });

        const payload = (await response.json()) as DashboardResponse & { message?: string };

        if (!response.ok || !payload.success) {
          throw new Error(payload?.message || "Unable to load dashboard data.");
        }

        if (alive) {
          setData(payload);
        }
      } catch (err) {
        if (alive) {
          setError(err instanceof Error ? err.message : "Unable to load dashboard data.");
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      alive = false;
    };
  }, [range, country, reloadIndex]);

  const summary = data?.summary || {
    visits: 0,
    uniqueVisitors: 0,
    githubClicks: 0,
    liveDemoClicks: 0,
    resumeDownloads: 0,
    projectClicks: 0,
    contactSubmissions: 0,
  };

  const chartData = data?.graphData || [];
  const countryBreakdown = data?.countryBreakdown || [];
  const deviceBreakdown = data?.deviceBreakdown || [];
  const sourceBreakdown = data?.sourceBreakdown || [];
  const topProjects = data?.topProjects || [];
  const recentActivity = data?.recentActivity || [];
  const availableCountries = data?.availableCountries || [];
  const addedCounts = data?.addedCounts || {
    totalProjectsAdded: 0,
    researchsAdded: 0,
    experienceAdded: 0,
    achievementsAdded: 0,
    certificationsAdded: 0,
    apiKeysAdded: 0,
  };

  const analyticsCards = [
    {
      title: "Visits",
      value: formatCount(safeNumber(summary.visits)),
      icon: <Eye size={18} />,
      accent: "linear-gradient(135deg,#6366f1,#8b5cf6)",
    },
    {
      title: "Unique Visitors",
      value: formatCount(safeNumber(summary.uniqueVisitors)),
      icon: <Users size={18} />,
      accent: "linear-gradient(135deg,#3b82f6,#6366f1)",
    },
    {
      title: "GitHub Clicks",
      value: formatCount(safeNumber(summary.githubClicks)),
      icon: <GitBranch size={18} />,
      accent: "linear-gradient(135deg,#10b981,#059669)",
    },
    {
      title: "Resume Downloads",
      value: formatCount(safeNumber(summary.resumeDownloads)),
      icon: <Download size={18} />,
      accent: "linear-gradient(135deg,#06b6d4,#3b82f6)",
    },
    {
      title: "Project Clicks",
      value: formatCount(safeNumber(summary.projectClicks)),
      icon: <FolderKanban size={18} />,
      accent: "linear-gradient(135deg,#8b5cf6,#ec4899)",
    },
    {
      title: "Contact Submissions",
      value: formatCount(safeNumber(summary.contactSubmissions)),
      icon: <Mail size={18} />,
      accent: "linear-gradient(135deg,#10b981,#3b82f6)",
    },
  ];

  const addedCards = [
    {
      title: "Total Projects Added",
      value: formatCount(safeNumber(addedCounts.totalProjectsAdded)),
      icon: <FolderKanban size={18} />,
      accent: "linear-gradient(135deg,#6366f1,#8b5cf6)",
    },
    {
      title: "Researchs Added",
      value: formatCount(safeNumber(addedCounts.researchsAdded)),
      icon: <Eye size={18} />,
      accent: "linear-gradient(135deg,#3b82f6,#6366f1)",
    },
    {
      title: "Experience Added",
      value: formatCount(safeNumber(addedCounts.experienceAdded)),
      icon: <BriefcaseBusiness size={18} />,
      accent: "linear-gradient(135deg,#10b981,#059669)",
    },
    {
      title: "Achievements Added",
      value: formatCount(safeNumber(addedCounts.achievementsAdded)),
      icon: <Award size={18} />,
      accent: "linear-gradient(135deg,#f59e0b,#ef4444)",
    },
    {
      title: "Certifications Added",
      value: formatCount(safeNumber(addedCounts.certificationsAdded)),
      icon: <Zap size={18} />,
      accent: "linear-gradient(135deg,#06b6d4,#3b82f6)",
    },
    {
      title: "API Keys Added",
      value: formatCount(safeNumber(addedCounts.apiKeysAdded)),
      icon: <RefreshCw size={18} />,
      accent: "linear-gradient(135deg,#8b5cf6,#ec4899)",
    },
  ];

  const deviceChartData = useMemo(
    () =>
      deviceBreakdown.map((item) => ({
        ...item,
        value: safeNumber(item.value),
        color: DEVICE_COLORS[item.device.toLowerCase()] || DEVICE_COLORS.unknown,
      })),
    [deviceBreakdown]
  );

  if (loading && !data) {
    return <DashboardLoadingState />;
  }

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--text-muted)]">
            Dashboard Analytics
          </p>
          <h1 className="mt-1 text-2xl font-bold text-[var(--text-primary)]">
            Live portfolio performance
          </h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Real metrics from visits, clicks, countries, devices, and project activity.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <DashboardToggle
            value={dashboardView}
            onChange={setDashboardView}
          />

          <div className="flex items-center rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-1">
            {RANGES.map((item) => (
              <button
                key={item.value}
                onClick={() => setRange(item.value)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                  range === item.value
                    ? "text-white"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
                style={
                  range === item.value
                    ? {
                        background:
                          "linear-gradient(135deg, var(--grad-start), var(--grad-end))",
                      }
                    : undefined
                }
              >
                {item.label}
              </button>
            ))}
          </div>

          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] outline-none"
            style={{ boxShadow: "var(--shadow-sm)" }}
          >
            <option value="ALL">All countries</option>
            {availableCountries.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              setReloadIndex((current) => current + 1);
              setRefreshing(true);
              window.setTimeout(() => setRefreshing(false), 700);
            }}
            className="flex items-center justify-center rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-2.5 text-[var(--text-primary)]"
            style={{ boxShadow: "var(--shadow-sm)" }}
            aria-label="Refresh dashboard"
          >
            <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {error ? (
        <div
          className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      ) : null}

      <div className="mb-6 grid grid-cols-2 gap-3 xl:grid-cols-3">
        {(dashboardView === "analytics" ? analyticsCards : addedCards).map((card) => (
          <KpiCard
            key={card.title}
            title={card.title}
            value={loading ? "..." : card.value}
            icon={card.icon}
            accent={card.accent}
          />
        ))}
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <SectionCard
            title="Activity over time"
            subtitle="Visits, unique visitors, and click activity across the selected range"
          >
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -12 }}>
                <defs>
                  <linearGradient id="areaVisits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="areaUnique" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="areaClicks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.24} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="visits"
                  name="Visits"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fill="url(#areaVisits)"
                  dot={false}
                />
                <Area
                  type="monotone"
                  dataKey="uniqueVisitors"
                  name="Unique"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#areaUnique)"
                  dot={false}
                />
                <Area
                  type="monotone"
                  dataKey="projectClicks"
                  name="Project clicks"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#areaClicks)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </SectionCard>
        </div>

        <SectionCard
          title="Device mix"
          subtitle="Traffic split by device type"
        >
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={deviceChartData}
                cx="50%"
                cy="50%"
                innerRadius={48}
                outerRadius={72}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {deviceChartData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-color)",
                  borderRadius: 12,
                  fontSize: 12,
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="mt-3 space-y-2">
            {deviceChartData.map((item, index) => {
              const DeviceIcon = index === 0 ? Monitor : index === 1 ? Smartphone : Tablet;
              return (
                <div key={item.device} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: item.color }}
                    />
                    <DeviceIcon size={13} className="text-[var(--text-muted)]" />
                    <span className="text-sm text-[var(--text-secondary)]">
                      {formatLabel(item.device)}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-[var(--text-primary)]">
                    {formatCount(item.value)}
                  </span>
                </div>
              );
            })}
          </div>
        </SectionCard>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <SectionCard
          title="Country breakdown"
          subtitle="Visits by country for the selected range"
        >
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={countryBreakdown}
              layout="vertical"
              margin={{ top: 0, right: 6, bottom: 0, left: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                dataKey="country"
                type="category"
                tick={{ fontSize: 12, fill: "var(--text-secondary)" }}
                axisLine={false}
                tickLine={false}
                width={70}
              />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="visits" name="Visits" radius={[0, 6, 6, 0]} maxBarSize={18}>
                {countryBreakdown.map((_, index) => (
                  <Cell
                    key={index}
                    fill={`rgba(99,102,241,${Math.max(0.35, 1 - index * 0.12)})`}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard
          title="Traffic sources"
          subtitle="Where visitors are coming from"
        >
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={sourceBreakdown}
              layout="vertical"
              margin={{ top: 0, right: 6, bottom: 0, left: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                dataKey="source"
                type="category"
                tick={{ fontSize: 12, fill: "var(--text-secondary)" }}
                axisLine={false}
                tickLine={false}
                width={70}
              />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="visits" name="Visits" radius={[0, 6, 6, 0]} maxBarSize={18}>
                {sourceBreakdown.map((_, index) => (
                  <Cell key={index} fill={SOURCE_COLORS[index % SOURCE_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <SectionCard
          title="Top projects"
          subtitle="Projects getting the most clicks"
          action={
            <button
              onClick={() => navigate("/projects")}
              className="flex items-center gap-1 text-xs font-semibold text-[var(--accent)] hover:underline"
            >
              View all <ArrowRight size={12} />
            </button>
          }
        >
          <div className="max-h-[360px] space-y-3 overflow-y-auto pr-2">
            {topProjects.length ? (
              topProjects.map((project, index) => (
                <div
                  key={`${project.project_slug || project.title}-${index}`}
                  className="rounded-xl border border-[var(--border-color)] p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                        {project.title}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {project.project_slug || "No slug"}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-[var(--text-primary)]">
                      {formatCount(safeNumber(project.clicks))}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--bg-secondary)]">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.max(10, 100 - index * 18)}%`,
                        background: "linear-gradient(90deg, var(--grad-start), var(--grad-end))",
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-[var(--text-muted)]">
                No project clicks yet. Project click tracking will appear here once the portfolio links are used.
              </p>
            )}
          </div>
        </SectionCard>

        <SectionCard
          title="Recent activity"
          subtitle="Latest tracked portfolio events"
        >
          <div className="max-h-[360px] space-y-2 overflow-y-auto pr-2">
            {recentActivity.length ? (
              recentActivity.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-[var(--bg-secondary)]"
                >
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
                    style={{ background: "#6366f118", color: "#6366f1" }}
                  >
                    {item.type === "resume_download" ? (
                      <Download size={13} />
                    ) : item.type === "contact_submission" ? (
                      <Mail size={13} />
                    ) : item.type === "github_click" ? (
                      <GitBranch size={13} />
                    ) : item.type === "live_demo_click" ? (
                      <ExternalLink size={13} />
                    ) : (
                      <Eye size={13} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                      {formatActivityLabel(item.type)}
                    </p>
                    <p className="truncate text-xs text-[var(--text-muted)]">
                      {item.country || "UNKNOWN"} {item.source ? `· ${item.source}` : ""}
                      {item.path ? ` · ${item.path}` : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1 text-xs text-[var(--text-muted)]">
                    <Clock size={11} />
                    {new Date(item.created_at).toLocaleTimeString("en", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-[var(--text-muted)]">No recent activity for this filter.</p>
            )}
          </div>
        </SectionCard>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {[
          { label: "Projects", path: "/projects", icon: <FolderKanban size={15} /> },
          { label: "Certificates", path: "/certificates", icon: <Zap size={15} /> },
          { label: "API Keys", path: "/api-keys", icon: <RefreshCw size={15} /> },
        ].map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className="flex items-center gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)]"
            style={{ boxShadow: "var(--shadow-sm)" }}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>
    </DashboardLayout>
  );
}
