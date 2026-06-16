"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconLayoutDashboard,
  IconMessageCircle,
  IconBook,
  IconLogout,
  IconMenu2,
  IconX,
  IconMusicBolt,
  IconLoader2,
  IconChevronRight,
  IconShoppingCart,
  IconChartBar,
} from "@tabler/icons-react";

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: IconLayoutDashboard },
  { label: "Analytics", href: "/admin/analytics", icon: IconChartBar },
  { label: "Chat Support", href: "/admin/chat", icon: IconMessageCircle },
  { label: "Courses", href: "/admin/courses", icon: IconBook },
  { label: "Orders", href: "/admin/orders", icon: IconShoppingCart },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // Don't apply layout to the login page
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) {
      setAuthChecked(true);
      return;
    }
    // Verify admin token
    axios
      .get("/api/admin/verify")
      .then(() => setAuthChecked(true))
      .catch(() => router.replace("/admin/login"));
  }, [pathname]);

  const handleLogout = async () => {
    await axios.get("/api/admin/logout");
    router.replace("/admin/login");
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <IconLoader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-neutral-950 overflow-hidden">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 z-20 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* ── SIDEBAR ── */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-30 w-64 flex flex-col
          bg-neutral-900 border-r border-neutral-800
          transition-transform duration-300 ease-in-out
          lg:static lg:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-neutral-800 flex-shrink-0">
          <Link href="/admin/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
              <IconMusicBolt className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <p className="text-white text-sm font-bold leading-none">MusicNext</p>
              <p className="text-purple-400 text-[10px] mt-0.5">Admin Panel</p>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-neutral-400 hover:text-white"
          >
            <IconX className="w-5 h-5" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                  ${
                    isActive
                      ? "bg-purple-600/20 text-purple-300 border border-purple-500/30"
                      : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
                  }
                `}
              >
                <Icon className={`w-4.5 h-4.5 flex-shrink-0 ${isActive ? "text-purple-400" : ""}`} />
                <span className="flex-1">{item.label}</span>
                {isActive && <IconChevronRight className="w-3.5 h-3.5 text-purple-400" />}
              </Link>
            );
          })}
        </nav>

        {/* Admin info + logout */}
        <div className="p-4 border-t border-neutral-800 flex-shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold uppercase">
              A
            </div>
            <div>
              <p className="text-white text-xs font-semibold">Administrator</p>
              <p className="text-neutral-500 text-[10px]">Super Admin</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
          >
            <IconLogout className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex-shrink-0 flex items-center justify-between px-5 py-3.5 border-b border-neutral-800 bg-neutral-950">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
          >
            <IconMenu2 className="w-5 h-5" />
          </button>

          {/* Current page name */}
          <div className="flex items-center gap-2">
            <span className="text-neutral-500 text-xs">Admin</span>
            <span className="text-neutral-600">/</span>
            <span className="text-white text-xs font-semibold capitalize">
              {pathname.split("/").pop() || "Dashboard"}
            </span>
          </div>

          {/* Live indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-green-400 text-[10px] font-medium">Live</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
