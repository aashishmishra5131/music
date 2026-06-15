"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconUsers,
  IconBook,
  IconMessageCircle,
  IconBell,
  IconLoader2,
  IconArrowRight,
  IconTrendingUp,
  IconShoppingCart,
  IconCurrencyRupee,
} from "@tabler/icons-react";

interface Stats {
  totalUsers: number;
  totalCourses: number;
  totalMessages: number;
  unreadMessages: number;
  publishedCourses: number;
  totalRevenue: number; // paise
  totalOrders: number;
}

const statCards = (stats: Stats) => [
  {
    label: "Total Users",
    value: stats.totalUsers,
    icon: IconUsers,
    color: "from-purple-600 to-indigo-600",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    iconColor: "text-purple-400",
    href: null,
  },
  {
    label: "Total Courses",
    value: stats.totalCourses,
    sub: `${stats.publishedCourses} published`,
    icon: IconBook,
    color: "from-blue-600 to-cyan-600",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    iconColor: "text-blue-400",
    href: "/admin/courses",
  },
  {
    label: "Chat Messages",
    value: stats.totalMessages,
    icon: IconMessageCircle,
    color: "from-green-600 to-emerald-600",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
    iconColor: "text-green-400",
    href: "/admin/chat",
  },
  {
    label: "Unread Chats",
    value: stats.unreadMessages,
    icon: IconBell,
    color: "from-red-500 to-rose-600",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    iconColor: "text-red-400",
    href: "/admin/chat",
    alert: stats.unreadMessages > 0,
  },
  {
    label: "Total Revenue",
    value: `₹${((stats.totalRevenue || 0) / 100).toLocaleString("en-IN")}`,
    sub: `${stats.totalOrders} paid orders`,
    icon: IconCurrencyRupee,
    color: "from-yellow-500 to-amber-600",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20",
    iconColor: "text-yellow-400",
    href: "/admin/orders",
  },
  {
    label: "Orders",
    value: stats.totalOrders,
    icon: IconShoppingCart,
    color: "from-pink-600 to-rose-600",
    bg: "bg-pink-500/10",
    border: "border-pink-500/20",
    iconColor: "text-pink-400",
    href: "/admin/orders",
  },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [newOrderAlert, setNewOrderAlert] = useState(false);

  useEffect(() => {
    // Initial fetch
    axios
      .get("/api/admin/stats")
      .then((res) => setStats(res.data.stats))
      .catch(console.error)
      .finally(() => setLoading(false));

    // SSE real-time stats
    const es = new EventSource("/api/sse/admin-stats");

    es.addEventListener("connected", () => {
      // Re-fetch on reconnect
      axios.get("/api/admin/stats").then((res) => setStats(res.data.stats)).catch(() => {});
    });

    es.addEventListener("new_order", (e: MessageEvent) => {
      const { stats: updatedStats } = JSON.parse(e.data);
      setStats((prev) =>
        prev
          ? {
              ...prev,
              totalOrders: updatedStats.totalOrders ?? prev.totalOrders,
              totalRevenue: updatedStats.totalRevenue ?? prev.totalRevenue,
              totalUsers: updatedStats.totalUsers ?? prev.totalUsers,
            }
          : prev
      );
      setNewOrderAlert(true);
      setTimeout(() => setNewOrderAlert(false), 5000);
    });

    es.onerror = () => {};
    return () => es.close();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-96">
        <IconLoader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  const cards = stats ? statCards(stats) : [];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* New order real-time toast */}
      <AnimatePresence>
        {newOrderAlert && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-green-500/10 border border-green-500/30 text-green-300 text-sm shadow-lg backdrop-blur-sm"
          >
            <IconShoppingCart className="w-4 h-4 flex-shrink-0" />
            🎉 New order received! Revenue updated.
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-neutral-500 text-sm mt-1">
          Welcome back, Administrator 👋
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              {card.href ? (
                <Link href={card.href}>
                  <StatCard card={card} Icon={Icon} />
                </Link>
              ) : (
                <StatCard card={card} Icon={Icon} />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickAction
            href="/admin/chat"
            icon={<IconMessageCircle className="w-5 h-5 text-purple-400" />}
            title="Manage Chat"
            desc="View and reply to user messages"
            badge={stats?.unreadMessages}
          />
          <QuickAction
            href="/admin/courses"
            icon={<IconBook className="w-5 h-5 text-blue-400" />}
            title="Manage Courses"
            desc="Add, edit or delete music courses"
          />
          <QuickAction
            href="/admin/courses"
            icon={<IconTrendingUp className="w-5 h-5 text-green-400" />}
            title="Add New Course"
            desc="Publish a new course to the platform"
          />
          <QuickAction
            href="/admin/orders"
            icon={<IconShoppingCart className="w-5 h-5 text-yellow-400" />}
            title="View Orders"
            desc="Track all payments and transactions"
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ card, Icon }: { card: any; Icon: any }) {
  return (
    <div
      className={`relative rounded-2xl border ${card.border} ${card.bg} p-5 hover:scale-[1.02] transition-transform duration-200 cursor-pointer`}
    >
      {card.alert && (
        <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
      )}
      <div className={`w-10 h-10 rounded-xl ${card.bg} border ${card.border} flex items-center justify-center mb-4`}>
        <Icon className={`w-5 h-5 ${card.iconColor}`} />
      </div>
      <p className="text-3xl font-bold text-white mb-0.5">{card.value}</p>
      <p className="text-neutral-400 text-sm">{card.label}</p>
      {card.sub && <p className="text-neutral-600 text-xs mt-1">{card.sub}</p>}
    </div>
  );
}

function QuickAction({
  href, icon, title, desc, badge,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  badge?: number;
}) {
  return (
    <Link href={href}>
      <div className="group flex items-start gap-4 p-5 rounded-2xl border border-neutral-800 bg-neutral-900/60 hover:border-neutral-600 hover:bg-neutral-800/60 transition-all duration-200">
        <div className="p-2.5 rounded-xl bg-neutral-800 group-hover:bg-neutral-700 transition-colors flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-white text-sm font-semibold">{title}</p>
            {!!badge && (
              <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold min-w-5 text-center">
                {badge}
              </span>
            )}
          </div>
          <p className="text-neutral-500 text-xs mt-0.5">{desc}</p>
        </div>
        <IconArrowRight className="w-4 h-4 text-neutral-600 group-hover:text-neutral-400 group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-0.5" />
      </div>
    </Link>
  );
}
