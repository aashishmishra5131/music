"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  IconUsers,
  IconEye,
  IconChartBar,
  IconRefresh,
  IconLoader2,
  IconTrendingUp,
  IconWorld,
  IconCalendar,
  IconClock,
  IconHourglass,
} from "@tabler/icons-react";

interface DayStat {
  date: string;
  pageViews: number;
  uniqueVisitors: number;
  pageBreakdown: { path: string; views: number }[];
  totalTimeSeconds: number;
  sessionCount: number;
}

interface PageStat {
  path: string;
  views: number;
}

interface Summary {
  totalPageViews: number;
  totalUniqueVisitors: number;
  todayPageViews: number;
  todayUniqueVisitors: number;
  todayTotalTimeSeconds: number;
  todaySessionCount: number;
  periodTotalTimeSeconds: number;
  periodSessionCount: number;
}

interface StatsData {
  days: DayStat[];
  topPages: PageStat[];
  summary: Summary;
}

const PERIOD_OPTIONS = [
  { label: "7 Days", value: 7 },
  { label: "30 Days", value: 30 },
  { label: "90 Days", value: 90 },
];

function fmt(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  return String(n);
}

/** Format seconds → "2m 34s", "1h 5m", "45s" */
function formatDuration(seconds: number): string {
  if (!seconds || seconds < 1) return "—";
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return s > 0 ? `${m}m ${s}s` : `${m}m`;
  }
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

/** Average session duration from total seconds and session count */
function avgDuration(totalSeconds: number, sessionCount: number): string {
  if (!sessionCount || !totalSeconds) return "—";
  return formatDuration(Math.round(totalSeconds / sessionCount));
}

function shortDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00Z");
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "UTC" });
}

function fullDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00Z");
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

export default function AnalyticsPage() {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(30);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = useCallback(async (days: number, isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await fetch(`/api/analytics/stats?days=${days}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats(period);
  }, [period, fetchStats]);

  const maxViews = data
    ? Math.max(...data.days.map((d) => d.pageViews), 1)
    : 1;

  const statCards = data
    ? [
        {
          label: "Today's Views",
          value: fmt(data.summary.todayPageViews),
          sub: "page views today",
          icon: IconEye,
          color: "from-purple-600 to-indigo-600",
          glow: "shadow-purple-500/20",
        },
        {
          label: "Today's Visitors",
          value: fmt(data.summary.todayUniqueVisitors),
          sub: "unique visitors today",
          icon: IconUsers,
          color: "from-cyan-600 to-blue-600",
          glow: "shadow-cyan-500/20",
        },
        {
          label: `${period}-Day Views`,
          value: fmt(data.summary.totalPageViews),
          sub: `total page views`,
          icon: IconTrendingUp,
          color: "from-emerald-600 to-teal-600",
          glow: "shadow-emerald-500/20",
        },
        {
          label: `${period}-Day Visitors`,
          value: fmt(data.summary.totalUniqueVisitors),
          sub: `unique visitors`,
          icon: IconWorld,
          color: "from-orange-600 to-amber-600",
          glow: "shadow-orange-500/20",
        },
      ]
    : [];

  return (
    <div className="p-5 space-y-6 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-white text-xl font-bold">Site Analytics</h1>
          <p className="text-neutral-500 text-sm mt-0.5">Visitor & page view history</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Period selector */}
          <div className="flex items-center gap-1 bg-neutral-900 border border-neutral-700 rounded-lg p-1">
            {PERIOD_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setPeriod(opt.value)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  period === opt.value
                    ? "bg-purple-600 text-white"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {/* Refresh */}
          <button
            onClick={() => fetchStats(period, true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-500 transition-all text-xs"
          >
            <IconRefresh className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <IconLoader2 className="w-8 h-8 text-purple-500 animate-spin" />
        </div>
      ) : !data ? (
        <div className="text-center text-neutral-500 py-20">Failed to load analytics</div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {statCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className={`bg-neutral-900 border border-neutral-800 rounded-xl p-4 shadow-lg ${card.glow}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-neutral-500 text-xs">{card.label}</p>
                      <p className="text-white text-2xl font-bold mt-1">{card.value}</p>
                      <p className="text-neutral-600 text-[11px] mt-0.5">{card.sub}</p>
                    </div>
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-4.5 h-4.5 text-white" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Screen Time Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              {
                label: "Avg Session Today",
                value: avgDuration(data.summary.todayTotalTimeSeconds, data.summary.todaySessionCount),
                sub: `from ${data.summary.todaySessionCount} sessions`,
                icon: IconClock,
                color: "from-violet-600 to-purple-700",
                glow: "shadow-violet-500/20",
              },
              {
                label: "Total Time Today",
                value: formatDuration(data.summary.todayTotalTimeSeconds),
                sub: "combined screen time",
                icon: IconHourglass,
                color: "from-pink-600 to-rose-600",
                glow: "shadow-pink-500/20",
              },
              {
                label: `Avg Session (${period}d)`,
                value: avgDuration(data.summary.periodTotalTimeSeconds, data.summary.periodSessionCount),
                sub: `from ${data.summary.periodSessionCount} sessions`,
                icon: IconClock,
                color: "from-sky-600 to-cyan-600",
                glow: "shadow-sky-500/20",
              },
              {
                label: `Total Time (${period}d)`,
                value: formatDuration(data.summary.periodTotalTimeSeconds),
                sub: "combined screen time",
                icon: IconHourglass,
                color: "from-amber-600 to-orange-600",
                glow: "shadow-amber-500/20",
              },
            ].map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.28 + i * 0.07 }}
                  className={`bg-neutral-900 border border-neutral-800 rounded-xl p-4 shadow-lg ${card.glow}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-neutral-500 text-xs">{card.label}</p>
                      <p className="text-white text-2xl font-bold mt-1">{card.value}</p>
                      <p className="text-neutral-600 text-[11px] mt-0.5">{card.sub}</p>
                    </div>
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-4.5 h-4.5 text-white" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Bar Chart */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <IconChartBar className="w-4 h-4 text-purple-400" />
                <h2 className="text-white text-sm font-semibold">
                  Daily Visitors — Last {period} Days
                </h2>
              </div>
              <div className="flex items-center gap-4 text-[11px]">
                <span className="flex items-center gap-1.5 text-neutral-400">
                  <span className="w-2.5 h-2.5 rounded-sm bg-gradient-to-t from-purple-600 to-indigo-500 inline-block" />
                  Page Views
                </span>
                <span className="flex items-center gap-1.5 text-neutral-400">
                  <span className="w-2.5 h-2.5 rounded-sm bg-gradient-to-t from-cyan-600 to-blue-500 inline-block" />
                  Unique Visitors
                </span>
              </div>
            </div>

            {/* Chart */}
            <div className="flex items-end gap-[2px] overflow-x-auto pb-1" style={{ height: 140 }}>
              {data.days.map((day, i) => {
                const pvH = maxViews > 0 ? (day.pageViews / maxViews) * 110 : 0;
                const uvH = maxViews > 0 ? (day.uniqueVisitors / maxViews) * 110 : 0;
                return (
                  <div key={day.date} className="group relative flex items-end gap-[1px] flex-1 min-w-[6px]">
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col bg-neutral-800 border border-neutral-700 rounded-lg px-2.5 py-2 text-[10px] text-white whitespace-nowrap z-10 shadow-xl pointer-events-none">
                      <span className="text-neutral-300 font-semibold mb-1">{fullDate(day.date)}</span>
                      <span className="text-purple-300">👁 {day.pageViews} views</span>
                      <span className="text-cyan-300">👤 {day.uniqueVisitors} unique</span>
                    </div>
                    {/* Page views bar */}
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: pvH }}
                      transition={{ duration: 0.5, delay: i * 0.01 }}
                      className="flex-1 bg-gradient-to-t from-purple-700 to-indigo-500 rounded-t-sm min-h-[2px]"
                    />
                    {/* Unique visitors bar */}
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: uvH }}
                      transition={{ duration: 0.5, delay: i * 0.01 + 0.1 }}
                      className="flex-1 bg-gradient-to-t from-cyan-700 to-blue-500 rounded-t-sm min-h-[2px]"
                    />
                  </div>
                );
              })}
            </div>

            {/* X-axis labels — show every N-th label to avoid crowding */}
            <div className="flex mt-2 overflow-x-hidden">
              {data.days.map((day, i) => {
                const step = period <= 7 ? 1 : period <= 30 ? 5 : 10;
                const show = i % step === 0 || i === data.days.length - 1;
                return (
                  <div key={day.date} className="flex-1 min-w-[6px]">
                    {show && (
                      <p className="text-[9px] text-neutral-600 text-center truncate">
                        {shortDate(day.date)}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom section: Top Pages + History Table */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Top Pages */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <IconWorld className="w-4 h-4 text-emerald-400" />
                <h2 className="text-white text-sm font-semibold">Top Pages</h2>
                <span className="text-neutral-600 text-xs ml-auto">last {period} days</span>
              </div>
              {data.topPages.length === 0 ? (
                <p className="text-neutral-600 text-sm text-center py-8">No data yet</p>
              ) : (
                <div className="space-y-2">
                  {data.topPages.map((page, i) => {
                    const maxPageViews = data.topPages[0].views;
                    const widthPct = (page.views / maxPageViews) * 100;
                    return (
                      <div key={page.path}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-neutral-300 font-mono truncate max-w-[70%]">
                            {page.path}
                          </span>
                          <span className="text-neutral-500 flex-shrink-0">{fmt(page.views)}</span>
                        </div>
                        <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${widthPct}%` }}
                            transition={{ duration: 0.6, delay: i * 0.05 }}
                            className="h-full bg-gradient-to-r from-emerald-600 to-teal-500 rounded-full"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Visit History Table */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <IconCalendar className="w-4 h-4 text-orange-400" />
                <h2 className="text-white text-sm font-semibold">Daily History</h2>
                <span className="text-neutral-600 text-xs ml-auto">most recent first</span>
              </div>
              <div className="overflow-y-auto max-h-72 scrollbar-thin scrollbar-thumb-neutral-800">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-neutral-500 border-b border-neutral-800">
                      <th className="text-left pb-2 font-medium">Date</th>
                      <th className="text-right pb-2 font-medium">Views</th>
                      <th className="text-right pb-2 font-medium">Unique</th>
                      <th className="text-right pb-2 font-medium">Avg Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...data.days].reverse().map((day) => (
                      <tr
                        key={day.date}
                        className="border-b border-neutral-800/50 hover:bg-neutral-800/40 transition-colors"
                      >
                        <td className="py-2 text-neutral-300">{fullDate(day.date)}</td>
                        <td className="py-2 text-right">
                          {day.pageViews > 0 ? (
                            <span className="text-purple-300 font-medium">{day.pageViews}</span>
                          ) : (
                            <span className="text-neutral-700">—</span>
                          )}
                        </td>
                        <td className="py-2 text-right">
                          {day.uniqueVisitors > 0 ? (
                            <span className="text-cyan-300 font-medium">{day.uniqueVisitors}</span>
                          ) : (
                            <span className="text-neutral-700">—</span>
                          )}
                        </td>
                        <td className="py-2 text-right">
                          {day.sessionCount > 0 ? (
                            <span className="text-violet-300 font-medium">
                              {avgDuration(day.totalTimeSeconds, day.sessionCount)}
                            </span>
                          ) : (
                            <span className="text-neutral-700">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
