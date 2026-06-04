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
  Download,
  ExternalLink,
  Eye,
  FolderKanban,
  GitBranch,
  Mail,
  Users,
  ArrowRight,
  Plus,
  Activity,
  Clock,
  Zap,
  TrendingUp,
  TrendingDown,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
} from "lucide-react";

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "@layouts/DashboardLayout";

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   DATA GENERATORS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

type Range = "7D" | "30D" | "90D" | "1Y";

const RANGES: Range[] = ["7D", "30D", "90D", "1Y"];

function seed(s: number) {
  let x = Math.sin(s + 1) * 10000;
  return x - Math.floor(x);
}

function makeVisitorData(range: Range) {
  const counts: Record<Range, number> = { "7D": 7, "30D": 30, "90D": 90, "1Y": 12 };
  const n = counts[range];
  return Array.from({ length: n }, (_, i) => {
    const base = range === "1Y" ? 18000 : 600;
    const visits  = Math.round(base * (0.5 + seed(i * 3) * 1.0));
    const unique  = Math.round(visits * (0.55 + seed(i * 7) * 0.35));
    const github  = Math.round(unique * (0.1  + seed(i * 5) * 0.2));

    let label: string;
    if (range === "7D") {
      label = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][i % 7];
    } else if (range === "1Y") {
      label = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i];
    } else {
      label = `Day ${i + 1}`;
    }
    return { label, visits, unique, github };
  });
}

function makeTrafficData() {
  return [
    { source: "Direct",   visits: 8400, pct: 34 },
    { source: "Organic",  visits: 6200, pct: 25 },
    { source: "Referral", visits: 4800, pct: 19 },
    { source: "Social",   visits: 3600, pct: 15 },
    { source: "Email",    visits: 1800, pct:  7 },
  ];
}

const DEVICE_DATA = [
  { name: "Desktop", value: 58, color: "#6366f1" },
  { name: "Mobile",  value: 34, color: "#8b5cf6" },
  { name: "Tablet",  value: 8,  color: "#a78bfa" },
];

const POPULAR_PROJECTS = [
  { name: "AI Portfolio Platform",     views: 842, change: "+12%", positive: true,  tech: "React / Node",  pct: 100 },
  { name: "Deepfake Detection System", views: 617, change: "+8%",  positive: true,  tech: "Python / TF",   pct: 73  },
  { name: "E-Commerce Dashboard",      views: 401, change: "-3%",  positive: false, tech: "Next.js",       pct: 48  },
  { name: "Real-Time Chat App",        views: 289, change: "+21%", positive: true,  tech: "Socket.io",     pct: 34  },
];

const ACTIVITY = [
  { label: "New API key created",           time: "2 min ago",  icon: <Zap size={13} />,          color: "#6366f1" },
  { label: "Certificate #12 updated",       time: "45 min ago", icon: <Activity size={13} />,     color: "#10b981" },
  { label: "AI Platform viewed 18 times",   time: "1h ago",     icon: <Eye size={13} />,           color: "#3b82f6" },
  { label: "Resume downloaded × 4",         time: "3h ago",     icon: <Download size={13} />,     color: "#f59e0b" },
  { label: "Contact form submitted",         time: "5h ago",     icon: <Mail size={13} />,         color: "#10b981" },
  { label: "New GitHub click spike",        time: "7h ago",     icon: <GitBranch size={13} />,    color: "#8b5cf6" },
];

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   STAT DATA per range
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const STATS_BY_RANGE: Record<Range, {
  visits: string; visitsPct: string; visitsPos: boolean;
  unique:  string; uniquePct:  string; uniquePos:  boolean;
  github:  string; githubPct:  string; githubPos:  boolean;
  demos:   string; demosPct:   string; demosPos:   boolean;
  resume:  string; resumePct:  string; resumePos:  boolean;
  projects:string; projectsPct:string; projectsPos:boolean;
  contact: string; contactPct: string; contactPos: boolean;
}> = {
  "7D":  {
    visits:"3.2K", visitsPct:"+8%",  visitsPos:true,
    unique:"2.4K", uniquePct:"+5%",  uniquePos:true,
    github:"612",  githubPct:"+12%", githubPos:true,
    demos: "298",  demosPct:"-2%",   demosPos:false,
    resume:"201",  resumePct:"+4%",  resumePos:true,
    projects:"1.1K",projectsPct:"+18%",projectsPos:true,
    contact:"47",  contactPct:"+9%", contactPos:true,
  },
  "30D": {
    visits:"24.8K",visitsPct:"+12%", visitsPos:true,
    unique:"18.4K",uniquePct:"+9%",  uniquePos:true,
    github:"4.2K", githubPct:"+18%", githubPos:true,
    demos: "2.1K", demosPct:"+14%",  demosPos:true,
    resume:"1.4K", resumePct:"+6%",  resumePos:true,
    projects:"8.9K",projectsPct:"+22%",projectsPos:true,
    contact:"324", contactPct:"+11%",contactPos:true,
  },
  "90D": {
    visits:"68K",  visitsPct:"+19%", visitsPos:true,
    unique:"51K",  uniquePct:"+15%", uniquePos:true,
    github:"11K",  githubPct:"+24%", githubPos:true,
    demos: "5.8K", demosPct:"+10%",  demosPos:true,
    resume:"3.9K", resumePct:"+8%",  resumePos:true,
    projects:"24K",projectsPct:"+31%",projectsPos:true,
    contact:"912", contactPct:"+14%",contactPos:true,
  },
  "1Y": {
    visits:"248K", visitsPct:"+34%", visitsPos:true,
    unique:"184K", uniquePct:"+29%", uniquePos:true,
    github:"42K",  githubPct:"+41%", githubPos:true,
    demos: "21K",  demosPct:"+27%",  demosPos:true,
    resume:"14K",  resumePct:"+19%", resumePos:true,
    projects:"89K",projectsPct:"+52%",projectsPos:true,
    contact:"3.2K",contactPct:"+23%",contactPos:true,
  },
};

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SMALL HELPERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return <>{time.toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" })}</>;
}

function CurrentDate() {
  const d = new Date();
  return <>{d.toLocaleDateString("en", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</>;
}

/* Custom Recharts tooltip */
function ChartTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl border border-[var(--border-color)] p-3 text-sm shadow-xl"
      style={{ background: "var(--bg-card)", minWidth: 140 }}
    >
      <p className="mb-2 font-semibold text-[var(--text-secondary)]">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-[var(--text-muted)]">
            <span className="inline-block h-2 w-2 rounded-full" style={{ background: p.color }} />
            {p.name}
          </span>
          <span className="font-semibold text-[var(--text-primary)]">
            {p.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

/* Stat Card component (inline, enhanced) */
function KpiCard({
  title, value, pct, positive, icon, gradient,
}: {
  title: string; value: string; pct: string; positive: boolean;
  icon: React.ReactNode; gradient: string;
}) {
  return (
    <div
      className="
        group relative overflow-hidden rounded-2xl
        border border-[var(--border-color)] bg-[var(--bg-card)]
        p-5 transition-all duration-300
        hover:-translate-y-1.5 hover:border-[var(--border-accent)]
      "
      style={{ boxShadow: "var(--shadow-sm)" }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: "var(--grad-card)" }}
      />
      <div className="relative flex items-start justify-between">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
          style={{ background: gradient, boxShadow: `0 4px 12px ${gradient.includes("10b981") ? "rgba(16,185,129,.3)" : "var(--accent-glow)"}` }}
        >
          {icon}
        </div>
        <span
          className="flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold"
          style={{
            background: positive ? "var(--success-light)" : "var(--danger-light)",
            color:      positive ? "var(--success)"       : "var(--danger)",
          }}
        >
          {positive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          {pct}
        </span>
      </div>
      <div className="relative mt-3">
        <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]">{title}</p>
        <h3 className="mt-1 text-2xl font-bold tracking-tight text-[var(--text-primary)]">{value}</h3>
        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-[var(--bg-secondary)]">
          <div className="h-full rounded-full transition-all duration-1000" style={{ width: "65%", background: gradient }} />
        </div>
      </div>
    </div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   MAIN DASHBOARD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export default function Dashboard() {
  const navigate = useNavigate();
  const [range, setRange] = useState<Range>("30D");
  const [userName, setUserName] = useState("Admin");
  const [chartData, setChartData] = useState(makeVisitorData("30D"));
  const [trafficData] = useState(makeTrafficData());

  useEffect(() => {
    const name = localStorage.getItem("userName");
    if (name) setUserName(name.split(" ")[0]);
  }, []);

  const handleRange = useCallback((r: Range) => {
    setRange(r);
    setChartData(makeVisitorData(r));
  }, []);

  const stats = STATS_BY_RANGE[range];

  /* xAxis tick density */
  const xInterval = range === "7D" ? 0 : range === "30D" ? 4 : range === "90D" ? 14 : 0;

  return (
    <DashboardLayout>

      {/* ═══════════════════════════════════════════
          WELCOME BANNER
      ═══════════════════════════════════════════ */}
      <div
        className="relative mb-6 overflow-hidden rounded-2xl p-6 lg:p-7"
        style={{
          background:  "linear-gradient(135deg, var(--grad-start) 0%, var(--grad-end) 100%)",
          boxShadow:   "var(--shadow-accent)",
        }}
      >
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, white, transparent 70%)" }} />
        <div className="pointer-events-none absolute bottom-0 left-1/4 h-32 w-32 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, white, transparent 70%)" }} />

        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-medium text-white/60 mb-1">
              <LiveClock /> · <CurrentDate />
            </p>
            <h1 className="text-2xl font-bold text-white lg:text-3xl">
              Welcome back, {userName}! 👋
            </h1>
            <p className="mt-1 text-sm text-white/70 max-w-lg">
              Your portfolio is performing well. Here's a snapshot across all channels.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => navigate("/projects/create")}
              className="flex items-center gap-2 rounded-xl border border-white/30 bg-white/20 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur transition-all hover:bg-white/30"
            >
              <Plus size={15} /> Add Project
            </button>
            <button
              onClick={() => navigate("/certificates/create")}
              className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold transition-all hover:bg-white/90"
              style={{ color: "var(--grad-start)" }}
            >
              <Plus size={15} /> Add Certificate
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          RANGE FILTER BAR
      ═══════════════════════════════════════════ */}
      <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Analytics Overview</h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Portfolio performance metrics
          </p>
        </div>

        <div
          className="flex items-center rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-1 gap-0.5"
          style={{ boxShadow: "var(--shadow-sm)" }}
        >
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => handleRange(r)}
              className={`
                rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200
                ${range === r
                  ? "text-white shadow-sm"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
                }
              `}
              style={
                range === r
                  ? { background: "linear-gradient(135deg, var(--grad-start), var(--grad-end))" }
                  : undefined
              }
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          KPI CARDS
      ═══════════════════════════════════════════ */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="Total Visits"
          value={stats.visits}
          pct={stats.visitsPct}
          positive={stats.visitsPos}
          icon={<Eye size={18} />}
          gradient="linear-gradient(135deg,#6366f1,#8b5cf6)"
        />
        <KpiCard
          title="Unique Visitors"
          value={stats.unique}
          pct={stats.uniquePct}
          positive={stats.uniquePos}
          icon={<Users size={18} />}
          gradient="linear-gradient(135deg,#3b82f6,#6366f1)"
        />
        <KpiCard
          title="GitHub Clicks"
          value={stats.github}
          pct={stats.githubPct}
          positive={stats.githubPos}
          icon={<GitBranch size={18} />}
          gradient="linear-gradient(135deg,#10b981,#059669)"
        />
        <KpiCard
          title="Live Demo Clicks"
          value={stats.demos}
          pct={stats.demosPct}
          positive={stats.demosPos}
          icon={<ExternalLink size={18} />}
          gradient="linear-gradient(135deg,#f59e0b,#ef4444)"
        />
        <KpiCard
          title="Resume Downloads"
          value={stats.resume}
          pct={stats.resumePct}
          positive={stats.resumePos}
          icon={<Download size={18} />}
          gradient="linear-gradient(135deg,#3b82f6,#06b6d4)"
        />
        <KpiCard
          title="Project Clicks"
          value={stats.projects}
          pct={stats.projectsPct}
          positive={stats.projectsPos}
          icon={<FolderKanban size={18} />}
          gradient="linear-gradient(135deg,#8b5cf6,#ec4899)"
        />
        <KpiCard
          title="Contact Submissions"
          value={stats.contact}
          pct={stats.contactPct}
          positive={stats.contactPos}
          icon={<Mail size={18} />}
          gradient="linear-gradient(135deg,#10b981,#3b82f6)"
        />
        <div
          className="
            flex flex-col justify-between rounded-2xl
            border border-dashed border-[var(--border-accent)]
            bg-[var(--accent-light)] p-5
            transition-all duration-300 hover:-translate-y-1 cursor-pointer
          "
          onClick={() => navigate("/projects/create")}
        >
          <Plus size={20} style={{ color: "var(--accent)" }} />
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--accent)" }}>Add New</p>
            <p className="text-xs text-[var(--text-muted)]">Create project or cert</p>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          MAIN CHART — Visitors Over Time
      ═══════════════════════════════════════════ */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* Area Chart — 2/3 */}
        <div
          className="lg:col-span-2 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5"
          style={{ boxShadow: "var(--shadow-sm)" }}
        >
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-[var(--text-primary)]">Visitors Over Time</h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Visits, unique visitors & GitHub clicks — {range}
              </p>
            </div>
            {/* Legend */}
            <div className="hidden sm:flex items-center gap-4 text-xs text-[var(--text-muted)]">
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2 w-5 rounded-full" style={{ background: "var(--grad-start)" }} />
                Visits
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2 w-5 rounded-full" style={{ background: "#3b82f6" }} />
                Unique
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2 w-5 rounded-full" style={{ background: "#10b981" }} />
                GitHub
              </span>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="gVisits" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}    />
                </linearGradient>
                <linearGradient id="gUnique" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.20} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}    />
                </linearGradient>
                <linearGradient id="gGithub" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10b981" stopOpacity={0.20} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                axisLine={false}
                tickLine={false}
                interval={xInterval}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : `${v}`}
              />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="visits" name="Visits"  stroke="#6366f1" strokeWidth={2} fill="url(#gVisits)" dot={false} activeDot={{ r: 4 }} />
              <Area type="monotone" dataKey="unique" name="Unique"  stroke="#3b82f6" strokeWidth={2} fill="url(#gUnique)" dot={false} activeDot={{ r: 4 }} />
              <Area type="monotone" dataKey="github" name="GitHub"  stroke="#10b981" strokeWidth={2} fill="url(#gGithub)" dot={false} activeDot={{ r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie — Device Split — 1/3 */}
        <div
          className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5"
          style={{ boxShadow: "var(--shadow-sm)" }}
        >
          <div className="mb-4">
            <h3 className="font-semibold text-[var(--text-primary)]">Device Split</h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">Traffic by device type</p>
          </div>

          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={DEVICE_DATA}
                cx="50%"
                cy="50%"
                innerRadius={48}
                outerRadius={72}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {DEVICE_DATA.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v) => [`${v}%`, ""]}
                contentStyle={{
                  background: "var(--bg-card)",
                  border:     "1px solid var(--border-color)",
                  borderRadius: 12,
                  fontSize: 12,
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="mt-3 space-y-2">
            {DEVICE_DATA.map((d, i) => {
              const DeviceIcon = i === 0 ? Monitor : i === 1 ? Smartphone : Tablet;
              return (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                    <DeviceIcon size={13} className="text-[var(--text-muted)]" />
                    <span className="text-sm text-[var(--text-secondary)]">{d.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-[var(--text-primary)]">{d.value}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          ROW 2 — Bar Chart + Popular Projects
      ═══════════════════════════════════════════ */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-5">

        {/* Bar Chart — Traffic Sources — 2/5 */}
        <div
          className="lg:col-span-2 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5"
          style={{ boxShadow: "var(--shadow-sm)" }}
        >
          <div className="mb-4">
            <h3 className="font-semibold text-[var(--text-primary)]">Traffic Sources</h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">Where your visitors come from</p>
          </div>

          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={trafficData}
              layout="vertical"
              margin={{ top: 0, right: 4, bottom: 0, left: -10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => `${(v/1000).toFixed(0)}k`}
              />
              <YAxis
                dataKey="source"
                type="category"
                tick={{ fontSize: 12, fill: "var(--text-secondary)" }}
                axisLine={false}
                tickLine={false}
                width={60}
              />
              <Tooltip
                cursor={{ fill: "var(--bg-secondary)" }}
                content={<ChartTooltip />}
              />
              <Bar dataKey="visits" name="Visits" radius={[0, 6, 6, 0]} maxBarSize={18}>
                {trafficData.map((_, i) => (
                  <Cell
                    key={i}
                    fill={`rgba(99,102,241,${1 - i * 0.15})`}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Source list */}
          <div className="mt-3 space-y-2">
            {trafficData.map((t, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-[var(--text-secondary)]">
                  <Globe size={13} className="text-[var(--text-muted)]" />
                  {t.source}
                </span>
                <span className="font-semibold text-[var(--text-primary)]">{t.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Projects — 3/5 */}
        <div
          className="lg:col-span-3 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5"
          style={{ boxShadow: "var(--shadow-sm)" }}
        >
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-[var(--text-primary)]">Popular Projects</h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">Ranked by views · {range}</p>
            </div>
            <button
              onClick={() => navigate("/projects")}
              className="flex items-center gap-1 text-xs font-semibold hover:underline"
              style={{ color: "var(--accent)" }}
            >
              View All <ArrowRight size={12} />
            </button>
          </div>

          {/* Header row */}
          <div className="mb-3 grid grid-cols-[1fr_auto_auto_100px] gap-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] px-1">
            <span>Project</span>
            <span className="text-right">Views</span>
            <span className="text-right">Change</span>
            <span className="text-right">Share</span>
          </div>

          <div className="space-y-3">
            {POPULAR_PROJECTS.map((p, i) => (
              <div key={i} className="group grid grid-cols-[1fr_auto_auto_100px] items-center gap-3 rounded-xl px-1 py-2 transition-colors hover:bg-[var(--bg-secondary)]">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white"
                    style={{
                      background: "linear-gradient(135deg, var(--grad-start), var(--grad-end))",
                      opacity: 1 - i * 0.2,
                    }}
                  >
                    {i + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[var(--text-primary)]">{p.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">{p.tech}</p>
                  </div>
                </div>

                <span className="text-right text-sm font-semibold text-[var(--text-primary)]">
                  {p.views.toLocaleString()}
                </span>

                <span
                  className="flex items-center justify-end gap-1 text-xs font-semibold"
                  style={{ color: p.positive ? "var(--success)" : "var(--danger)" }}
                >
                  {p.positive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                  {p.change}
                </span>

                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg-secondary)]">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width:      `${p.pct}%`,
                      background: "linear-gradient(90deg, var(--grad-start), var(--grad-end))",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          ROW 3 — Activity + Quick Actions
      ═══════════════════════════════════════════ */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* Recent Activity */}
        <div
          className="lg:col-span-2 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5"
          style={{ boxShadow: "var(--shadow-sm)" }}
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-[var(--text-primary)]">Recent Activity</h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">Latest platform events</p>
            </div>
            <span
              className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
              style={{ background: "var(--success-light)", color: "var(--success)" }}
            >
              <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: "var(--success)" }} />
              Live
            </span>
          </div>

          <div className="space-y-1">
            {ACTIVITY.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-[var(--bg-secondary)]"
              >
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: `${item.color}18`, color: item.color }}
                >
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)]">{item.label}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0 text-xs text-[var(--text-muted)]">
                  <Clock size={11} />
                  {item.time}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div
          className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5"
          style={{ boxShadow: "var(--shadow-sm)" }}
        >
          <div className="mb-4">
            <h3 className="font-semibold text-[var(--text-primary)]">Quick Actions</h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">Common tasks, fast</p>
          </div>

          <div className="space-y-2">
            {[
              { label: "Add New Project",     sub: "Deploy a project card",     icon: <Plus size={16} />,         path: "/projects/create",     color: "#6366f1" },
              { label: "Add Certificate",      sub: "Showcase achievement",      icon: <FolderKanban size={16} />, path: "/certificates/create", color: "#10b981" },
              { label: "Manage API Keys",      sub: "Create or revoke tokens",   icon: <Zap size={16} />,          path: "/api-keys",             color: "#f59e0b" },
              { label: "View All Projects",    sub: "Browse your portfolio",     icon: <Eye size={16} />,          path: "/projects",             color: "#3b82f6" },
            ].map((a, i) => (
              <button
                key={i}
                onClick={() => navigate(a.path)}
                className="
                  group flex w-full items-center gap-3 rounded-xl p-3
                  border border-[var(--border-color)]
                  transition-all duration-200
                  hover:border-[var(--border-accent)] hover:-translate-y-0.5
                "
                style={{ boxShadow: "var(--shadow-sm)" }}
              >
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110"
                  style={{ background: `${a.color}18`, color: a.color }}
                >
                  {a.icon}
                </div>
                <div className="text-left min-w-0">
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{a.label}</p>
                  <p className="text-xs text-[var(--text-muted)]">{a.sub}</p>
                </div>
                <ArrowRight size={14} className="ml-auto shrink-0 text-[var(--text-muted)] transition-transform duration-200 group-hover:translate-x-0.5" style={{ color: a.color }} />
              </button>
            ))}
          </div>

          {/* Mini summary */}
          <div
            className="mt-4 rounded-xl p-4 text-center"
            style={{ background: "var(--accent-light)", border: "1px solid var(--border-accent)" }}
          >
            <p className="text-xs text-[var(--text-muted)]">Portfolio Health</p>
            <p className="mt-1 text-2xl font-bold gradient-text">98%</p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">All systems operational</p>
          </div>
        </div>
      </div>

    </DashboardLayout>
  );
}
