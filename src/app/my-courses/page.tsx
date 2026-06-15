"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { SparklesCore } from "@/components/ui/sparkles";
import {
  IconBook,
  IconLoader2,
  IconCheck,
  IconCalendar,
  IconCurrencyRupee,
  IconArrowRight,
  IconInbox,
  IconMusic,
} from "@tabler/icons-react";

interface Order {
  _id: string;
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  courseImage: string;
  amount: number; // paise
  status: string;
  createdAt: string;
}

export default function MyCoursesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }
    if (status === "authenticated") {
      fetchOrders();
    }
  }, [status]);

  const fetchOrders = async () => {
    try {
      const res = await axios.get("/api/payment/my-orders");
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const formatAmount = (paise: number) =>
    `₹${(paise / 100).toLocaleString("en-IN")}`;

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* Sparkles */}
      <div className="absolute inset-0 pointer-events-none">
        <SparklesCore
          id="my-courses-sparkles"
          background="transparent"
          minSize={0.3}
          maxSize={1}
          particleDensity={40}
          particleColor="#7c3aed"
          className="w-full h-full"
        />
      </div>
      <div className="absolute top-32 right-20 w-64 h-64 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-32 left-20 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-24 pt-32">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
              <IconBook className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-purple-300 bg-clip-text text-transparent">
              My Courses
            </h1>
          </div>
          <p className="text-neutral-400 text-sm ml-13">
            {orders.length > 0
              ? `You are enrolled in ${orders.length} course${orders.length > 1 ? "s" : ""}`
              : "Your purchased courses will appear here"}
          </p>
        </motion.div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-3">
              <IconLoader2 className="w-8 h-8 text-purple-400 animate-spin" />
              <p className="text-neutral-500 text-sm">Loading your courses...</p>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && orders.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 gap-5 text-center"
          >
            <div className="w-20 h-20 rounded-3xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center">
              <IconInbox className="w-10 h-10 text-purple-400/60" />
            </div>
            <div>
              <p className="text-white text-lg font-semibold">No courses yet</p>
              <p className="text-neutral-500 text-sm mt-1">
                Explore our courses and start your music journey!
              </p>
            </div>
            <Link
              href="/courses"
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium text-sm hover:opacity-90 transition-all"
            >
              <IconMusic className="w-4 h-4" />
              Browse Courses
              <IconArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        )}

        {/* Courses grid */}
        {!loading && orders.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map((order, i) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="group relative flex flex-col rounded-3xl bg-white/5 border border-white/10 hover:border-purple-500/30 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10"
              >
                {/* Course image */}
                <div className="relative h-44 overflow-hidden">
                  <Image
                    src={order.courseImage || "https://img.freepik.com/free-photo/texture-treble-clef-dark-background-isolated-generative-ai_169016-29581.jpg?size=626&ext=jpg"}
                    alt={order.courseTitle}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  {/* Enrolled badge */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-[11px] font-bold backdrop-blur-sm">
                    <IconCheck className="w-3 h-3" />
                    Enrolled
                  </div>
                </div>

                {/* Info */}
                <div className="flex flex-col flex-1 p-5 gap-3">
                  <h3 className="text-white font-semibold text-base leading-snug line-clamp-2">
                    {order.courseTitle}
                  </h3>

                  <div className="flex items-center justify-between text-xs text-neutral-500 mt-auto">
                    <div className="flex items-center gap-1">
                      <IconCalendar className="w-3.5 h-3.5" />
                      {formatDate(order.createdAt)}
                    </div>
                    <div className="flex items-center gap-1 text-purple-400 font-medium">
                      <IconCurrencyRupee className="w-3.5 h-3.5" />
                      {formatAmount(order.amount)}
                    </div>
                  </div>

                  <Link
                    href={`/course_details/${order.courseSlug}`}
                    className="flex items-center justify-center gap-2 mt-1 px-4 py-2.5 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-300 text-sm font-medium hover:bg-purple-600/30 transition-all"
                  >
                    Continue Learning
                    <IconArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Back to courses */}
        {!loading && orders.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-10 flex justify-center"
          >
            <Link
              href="/courses"
              className="flex items-center gap-2 text-neutral-500 hover:text-white text-sm transition-colors"
            >
              <IconMusic className="w-4 h-4" />
              Explore more courses
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
