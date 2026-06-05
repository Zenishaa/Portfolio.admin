import { prisma } from "../../config/db.js";

function parseRange(filter = "7d") {
  const normalized = String(filter).toLowerCase();

  const days =
    normalized === "7d"
      ? 7
      : normalized === "30d"
        ? 30
        : normalized === "90d"
          ? 90
          : normalized === "1y"
            ? 365
            : 7;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return {
    filter: normalized,
    days,
    startDate,
  };
}

function toDateKey(date) {
  return date.toISOString().split("T")[0];
}

function emptySummary() {
  return {
    visits: 0,
    uniqueVisitors: 0,
    githubClicks: 0,
    liveDemoClicks: 0,
    resumeDownloads: 0,
    projectClicks: 0,
    contactSubmissions: 0,
  };
}

function emptyAddedCounts() {
  return {
    totalProjectsAdded: 0,
    researchsAdded: 0,
    experienceAdded: 0,
    achievementsAdded: 0,
    certificationsAdded: 0,
    apiKeysAdded: 0,
  };
}

function buildTimelineMap(startDate) {
  const map = new Map();
  const date = new Date(startDate);
  date.setHours(0, 0, 0, 0);

  while (date <= new Date()) {
    const key = toDateKey(date);
    map.set(key, {
      date: key,
      visits: 0,
      uniqueVisitors: 0,
      githubClicks: 0,
      liveDemoClicks: 0,
      resumeDownloads: 0,
      projectClicks: 0,
      contactSubmissions: 0,
    });
    date.setDate(date.getDate() + 1);
  }

  return map;
}

function incrementBucket(map, key, field, amount = 1) {
  if (!map.has(key)) {
    map.set(key, {
      date: key,
      visits: 0,
      uniqueVisitors: 0,
      githubClicks: 0,
      liveDemoClicks: 0,
      resumeDownloads: 0,
      projectClicks: 0,
      contactSubmissions: 0,
    });
  }

  map.get(key)[field] += amount;
}

export const getDashboardAnalytics = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { filter, startDate } = parseRange(req.query.filter);
    const selectedCountry = req.query.country
      ? String(req.query.country).toUpperCase()
      : "ALL";

    const where = {
      user_id: userId,
      created_at: {
        gte: startDate,
      },
    };

    if (selectedCountry !== "ALL") {
      where.country = selectedCountry;
    }

    const [dashboard, analytics, sessions, allSessions, projects, projectCount, researchCount, experienceCount, achievementCount, certificationCount, apiKeyCount] = await Promise.all([
      prisma.dashboard.findUnique({
        where: {
          user_id: userId,
        },
      }),
      prisma.dashboardAnalytics.findMany({
        where,
        orderBy: {
          created_at: "asc",
        },
      }),
      prisma.visitorSession.findMany({
        where: {
          user_id: userId,
          first_seen: {
            gte: startDate,
          },
          ...(selectedCountry !== "ALL"
            ? {
                country: selectedCountry,
              }
            : {}),
        },
      }),
      prisma.visitorSession.findMany({
        where: {
          user_id: userId,
          first_seen: {
            gte: startDate,
          },
        },
      }),
      prisma.projects.findMany({
        where: {
          user_id: userId,
        },
        select: {
          id: true,
          title: true,
          slug: true,
          type: true,
        },
      }),
      prisma.projects.count({
        where: {
          user_id: userId,
          type: {
            contains: "project",
            mode: "insensitive",
          },
        },
      }),
      prisma.projects.count({
        where: {
          user_id: userId,
          type: {
            contains: "research",
            mode: "insensitive",
          },
        },
      }),
      prisma.experience.count({
        where: {
          user_id: userId,
        },
      }),
      prisma.certificates.count({
        where: {
          user_id: userId,
          type: {
            equals: "achievement",
            mode: "insensitive",
          },
        },
      }),
      prisma.certificates.count({
        where: {
          user_id: userId,
          type: {
            equals: "certificate",
            mode: "insensitive",
          },
        },
      }),
      prisma.aPI.count({
        where: {
          user_id: userId,
        },
      }),
    ]);

    const projectMap = new Map(
      projects.map((project) => [
        project.id,
        project,
      ])
    );

    const summary = emptySummary();
    const addedCounts = emptyAddedCounts();
    const timeline = buildTimelineMap(startDate);
    const countryMap = new Map();
    const deviceMap = new Map();
    const sourceMap = new Map();
    const projectClicksMap = new Map();

    for (const session of sessions) {
      const dateKey = toDateKey(session.first_seen);
      incrementBucket(timeline, dateKey, "uniqueVisitors", 1);
    }

    for (const item of analytics) {
      const dateKey = toDateKey(item.created_at);
      const countryKey = item.country || "UNKNOWN";
      const deviceKey = item.device_type || "unknown";
      const sourceKey = item.source || "direct";

      incrementBucket(timeline, dateKey, "visits", item.type === "portfolio_visit" ? 1 : 0);
      incrementBucket(timeline, dateKey, "githubClicks", item.type === "github_click" ? 1 : 0);
      incrementBucket(timeline, dateKey, "liveDemoClicks", item.type === "live_demo_click" ? 1 : 0);
      incrementBucket(timeline, dateKey, "resumeDownloads", item.type === "resume_download" ? 1 : 0);
      incrementBucket(timeline, dateKey, "projectClicks", item.type === "project_click" ? 1 : 0);
      incrementBucket(timeline, dateKey, "contactSubmissions", item.type === "contact_submission" ? 1 : 0);

      if (item.type === "portfolio_visit") {
        summary.visits += 1;

        countryMap.set(countryKey, (countryMap.get(countryKey) || 0) + 1);
        deviceMap.set(deviceKey, (deviceMap.get(deviceKey) || 0) + 1);
        sourceMap.set(sourceKey, (sourceMap.get(sourceKey) || 0) + 1);
      }

      if (item.type === "github_click") summary.githubClicks += 1;
      if (item.type === "live_demo_click") summary.liveDemoClicks += 1;
      if (item.type === "resume_download") summary.resumeDownloads += 1;
      if (item.type === "project_click") {
        summary.projectClicks += 1;

        const projectKey = item.project_id || item.project_slug || "unknown";
        const current = projectClicksMap.get(projectKey) || {
          project_id: item.project_id || null,
          project_slug: item.project_slug || null,
          title: item.project_id && projectMap.get(item.project_id)
            ? projectMap.get(item.project_id).title
            : item.project_slug || "Unknown Project",
          clicks: 0,
        };

        current.clicks += 1;
        projectClicksMap.set(projectKey, current);
      }
      if (item.type === "contact_submission") summary.contactSubmissions += 1;
    }

    summary.uniqueVisitors = sessions.length;
    addedCounts.totalProjectsAdded = projectCount;
    addedCounts.researchsAdded = researchCount;
    addedCounts.experienceAdded = experienceCount;
    addedCounts.achievementsAdded = achievementCount;
    addedCounts.certificationsAdded = certificationCount;
    addedCounts.apiKeysAdded = apiKeyCount;

    const countryBreakdown = Array.from(countryMap.entries())
      .map(([country, visits]) => ({
        country,
        visits,
      }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 10);

    const deviceBreakdown = Array.from(deviceMap.entries())
      .map(([device, value]) => ({
        device,
        value,
      }))
      .sort((a, b) => b.value - a.value);

    const sourceBreakdown = Array.from(sourceMap.entries())
      .map(([source, visits]) => ({
        source,
        visits,
      }))
      .sort((a, b) => b.visits - a.visits);

    const topProjects = Array.from(projectClicksMap.values())
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 5);

    const recentActivity = analytics
      .slice(-10)
      .reverse()
      .map((item) => ({
        id: item.id,
        type: item.type,
        created_at: item.created_at,
        country: item.country,
        device_type: item.device_type,
        source: item.source,
        path: item.path,
        referrer: item.referrer,
        project_slug: item.project_slug,
        project_id: item.project_id,
      }));

    return res.status(200).json({
      success: true,
      filter,
      selectedCountry,
      dashboard,
      summary,
      addedCounts,
      totalEvents: analytics.length,
      graphData: Array.from(timeline.values()),
      countryBreakdown,
      deviceBreakdown,
      sourceBreakdown,
      topProjects,
      recentActivity,
      availableCountries: Array.from(
        new Set(
          allSessions
            .map((session) => session.country)
            .filter(Boolean)
        )
      ).sort(),
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
