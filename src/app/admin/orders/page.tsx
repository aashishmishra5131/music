"use client";

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconCurrencyRupee,
  IconShoppingCart,
  IconCheck,
  IconX,
  IconLoader2,
  IconSearch,
  IconCalendar,
  IconUser,
  IconFilter,
  IconChartBar,
  IconRefresh,
} from "@tabler/icons-react";

interface Order {
  _id: string;
  username: string;
  userEmail: string;
  courseTitle: string;
  courseSlug: string;
  amount: number; // paise
  currency: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  status: "created" | "paid" | "failed";
  createdAt: string;
}

interface Summary {
  totalRevenue: number; // paise
  totalOrders: number;
  paidOrders: number;
  pendingOrders: number;
  failedOrders: number;
}

const statusStyles = {
  paid: "text-green-400 bg-green-400/10 border-green-400/20",
  created: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  failed: "text-red-400 bg-red-400/10 border-red-400/20",
};

const statusIcons = {
  paid: <IconCheck className="w-3.5 h-3.5" />,
  created: <IconLoader2 className="w-3.5 h-3.5" />,
  failed: <IconX className="w-3.5 h-3.5" />,
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [newOrderToast, setNewOrderToast] = useState<Order | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "20");
      if (statusFilter) params.set("status", statusFilter);

      const res = await axios.get(`/api/admin/orders?${params}`);
      if (res.data.success) {
        setOrders(res.data.orders);
        setSummary(res.data.summary);
        setTotalPages(res.data.totalPages);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // SSE: live new order notifications
  useEffect(() => {
    const es = new EventSource("/api/sse/admin-stats");
    es.addEventListener("new_order", (e: MessageEvent) => {
      const { order, stats: updatedStats } = JSON.parse(e.data);
      // Add new order at top of list (only on page 1)
      if (page === 1) {
        setOrders((prev) => [order, ...prev.slice(0, 19)]);
      }
      // Update summary stats
      setSummary((prev) =>
        prev
          ? {
              ...prev,
              totalOrders: updatedStats.totalOrders ?? prev.totalOrders,
              paidOrders: (updatedStats.totalOrders ?? prev.paidOrders),
              totalRevenue: updatedStats.totalRevenue ?? prev.totalRevenue,
            }
          : prev
      );
      // Toast notification
      setNewOrderToast(order);
      setTimeout(() => setNewOrderToast(null), 6000);
    });
    es.onerror = () => {};
    return () => es.close();
  }, [page]);

  const formatAmount = (paise: number) =>
    `₹${(paise / 100).toLocaleString("en-IN")}`;

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const filteredOrders = orders.filter(
    (o) =>
      o.username.toLowerCase().includes(search.toLowerCase()) ||
      o.userEmail.toLowerCase().includes(search.toLowerCase()) ||
      o.courseTitle.toLowerCase().includes(search.toLowerCase()) ||
      o.razorpayOrderId.toLowerCase().includes(search.toLowerCase())
  );

  const statCards = summary
    ? [
        {
          label: "Total Revenue",
          value: formatAmount(summary.totalRevenue),
          icon: IconCurrencyRupee,
          color: "from-green-600 to-emerald-600",
          bg: "bg-green-500/10",
          border: "border-green-500/20",
        },
        {
          label: "Total Orders",
          value: summary.totalOrders,
          icon: IconShoppingCart,
          color: "from-purple-600 to-indigo-600",
          bg: "bg-purple-500/10",
          border: "border-purple-500/20",
        },
        {
          label: "Paid Orders",
          value: summary.paidOrders,
          icon: IconCheck,
          color: "from-blue-600 to-cyan-600",
          bg: "bg-blue-500/10",
          border: "border-blue-500/20",
        },
        {
          label: "Failed Orders",
          value: summary.failedOrders,
          icon: IconX,
          color: "from-red-600 to-rose-600",
          bg: "bg-red-500/10",
          border: "border-red-500/20",
        },
      ]
    : [];

  return (
    <div className="p-6 space-y-6 min-h-full">
      {/* Live new order toast */}
      <AnimatePresence>
        {newOrderToast && (
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 60 }}
            className="fixed top-4 right-4 z-50 flex items-start gap-3 px-4 py-3.5 rounded-2xl bg-neutral-900 border border-green-500/30 shadow-xl shadow-green-500/10 max-w-sm"
          >
            <div className="w-8 h-8 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
              <IconShoppingCart className="w-4 h-4 text-green-400" />
            </div>
            <div>
              <p className="text-white text-sm font-semibold">New Order Received 🎉</p>
              <p className="text-neutral-400 text-xs mt-0.5">
                @{newOrderToast.username} — {newOrderToast.courseTitle}
              </p>
              <p className="text-green-400 text-xs font-mono mt-0.5">
                +₹{(newOrderToast.amount / 100).toFixed(2)}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-xl font-bold">Orders & Payments</h1>
          <p className="text-neutral-500 text-sm mt-0.5">Track all transactions and revenue</p>
        </div>
        <button
          onClick={fetchOrders}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-white text-sm transition-all disabled:opacity-40"
        >
          <IconRefresh className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className={`p-4 rounded-2xl ${card.bg} border ${card.border}`}
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-neutral-400 text-xs font-medium">{card.label}</p>
                <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                  <Icon className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
              <p className="text-white text-xl font-bold">{card.value}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-center gap-2 bg-neutral-900 rounded-xl px-3 py-2.5 border border-neutral-800 focus-within:border-purple-500/40 transition-all">
          <IconSearch className="w-4 h-4 text-neutral-500 flex-shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by user, course, order ID..."
            className="flex-1 bg-transparent text-white text-sm outline-none placeholder-neutral-600"
          />
        </div>
        <div className="flex items-center gap-2 bg-neutral-900 rounded-xl px-3 py-2.5 border border-neutral-800">
          <IconFilter className="w-4 h-4 text-neutral-500" />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="bg-transparent text-white text-sm outline-none cursor-pointer"
          >
            <option value="" className="bg-neutral-900">All Status</option>
            <option value="paid" className="bg-neutral-900">Paid</option>
            <option value="created" className="bg-neutral-900">Pending</option>
            <option value="failed" className="bg-neutral-900">Failed</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl border border-neutral-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-neutral-900 border-b border-neutral-800">
                {["User", "Course", "Amount", "Order ID", "Status", "Date"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <IconLoader2 className="w-6 h-6 text-purple-400 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-neutral-500 text-sm">
                    No orders found
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order, i) => (
                  <motion.tr
                    key={order._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-neutral-800/60 hover:bg-neutral-900/50 transition-colors"
                  >
                    {/* User */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold uppercase flex-shrink-0">
                          {order.username.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-white text-xs font-medium truncate">@{order.username}</p>
                          <p className="text-neutral-500 text-[10px] truncate">{order.userEmail}</p>
                        </div>
                      </div>
                    </td>
                    {/* Course */}
                    <td className="px-4 py-3.5">
                      <p className="text-neutral-200 text-xs font-medium max-w-[180px] truncate">{order.courseTitle}</p>
                    </td>
                    {/* Amount */}
                    <td className="px-4 py-3.5">
                      <span className="text-white text-sm font-bold">{formatAmount(order.amount)}</span>
                    </td>
                    {/* Order ID */}
                    <td className="px-4 py-3.5">
                      <span className="text-neutral-500 text-[10px] font-mono">{order.razorpayOrderId.slice(-12)}</span>
                    </td>
                    {/* Status */}
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold capitalize ${statusStyles[order.status]}`}>
                        {statusIcons[order.status]}
                        {order.status === "created" ? "Pending" : order.status}
                      </span>
                    </td>
                    {/* Date */}
                    <td className="px-4 py-3.5">
                      <span className="text-neutral-500 text-[11px]">{formatDate(order.createdAt)}</span>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
            className="px-4 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-neutral-300 text-sm disabled:opacity-40 hover:bg-neutral-700 transition-all"
          >
            ← Prev
          </button>
          <span className="text-neutral-400 text-sm">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || loading}
            className="px-4 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-neutral-300 text-sm disabled:opacity-40 hover:bg-neutral-700 transition-all"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
