"use client";

import React, { useEffect, useState } from "react";
import { SparklesCore } from "@/components/ui/sparkles";
import Image from "next/image";
import { useParams } from "next/navigation";
import axios from "axios";
import PaymentButton from "@/components/PaymentButton";
import { motion } from "framer-motion";
import {
  IconClock,
  IconChartBar,
  IconBook,
  IconStar,
  IconLoader2,
} from "@tabler/icons-react";

// Static JSON data as fallback
const staticCourses = require("@/data/music_courses.json").courses as Array<{
  id: number;
  title: string;
  slug: string;
  description: string;
  price: number;
  instructor: string;
  image: string;
  isFeatured: boolean;
}>;

interface Course {
  _id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  instructor: string;
  image: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  category: string;
  duration: string;
  isFeatured: boolean;
}

const levelColors: Record<string, string> = {
  Beginner: "text-green-400 bg-green-400/10 border-green-400/20",
  Intermediate: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  Advanced: "text-red-400 bg-red-400/10 border-red-400/20",
};

const fallbackImage =
  "https://img.freepik.com/free-photo/texture-treble-clef-dark-background-isolated-generative-ai_169016-29581.jpg?size=626&ext=jpg";

export default function CourseDetailsPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [isPurchased, setIsPurchased] = useState(false);
  const [loading, setLoading] = useState(true);
  // Mock course from static JSON (fallback)
  const [mockCourse, setMockCourse] = useState<typeof staticCourses[0] | null>(null);

  useEffect(() => {
    if (!slug) return;
    fetchCourse();
  }, [slug]);

  const fetchCourse = async () => {
    setLoading(true);
    // Check static JSON first as immediate fallback
    const found = staticCourses.find(
      (c) => c.slug === slug || c.title.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, "") === slug
    );
    if (found) setMockCourse(found);

    try {
      const res = await axios.get(`/api/courses/${slug}`);
      if (res.data.success) {
        setCourse(res.data.course);
        setIsPurchased(res.data.isPurchased);
        setMockCourse(null); // DB course found, clear mock
      }
    } catch {
      // Not in DB — use static JSON fallback (already set above)
    } finally {
      setLoading(false);
    }
  };

  // Merge: DB course takes priority, else use static JSON data
  const displayTitle = course?.title || mockCourse?.title || slug?.replace(/-/g, " ");
  const displayDesc = course?.description || mockCourse?.description || "Dive deep into this comprehensive music course designed for all skill levels.";
  const displayImage = course?.image || mockCourse?.image || fallbackImage;
  const displayPrice = course?.price ?? mockCourse?.price ?? 999;
  const displayInstructor = course?.instructor || mockCourse?.instructor || null;
  const displayIsFeatured = course?.isFeatured ?? mockCourse?.isFeatured ?? false;
  const displayLevel = course?.level || null;
  const displayDuration = course?.duration || null;
  const displayCategory = course?.category || null;
  // Use course._id if in DB, else use mock slug as fake id for UI only
  const courseIdForPayment = course?._id || null;

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* Background Sparkles */}
      <div className="absolute inset-0 pointer-events-none">
        <SparklesCore
          id="sparkles-course"
          background="transparent"
          minSize={0.4}
          maxSize={1.2}
          particleDensity={60}
          particleColor="#7c3aed"
          className="w-full h-full"
        />
      </div>

      {/* Ambient glows */}
      <div className="absolute top-20 left-1/4 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-1/4 w-56 h-56 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Loading */}
      {loading && (
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <IconLoader2 className="w-10 h-10 text-purple-400 animate-spin" />
            <p className="text-neutral-400 text-sm">Loading course...</p>
          </div>
        </div>
      )}

      {!loading && (
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-start">

            {/* Left — Course Image */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="sticky top-24"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-purple-500/20 ring-1 ring-white/10">
                <Image
                  src={displayImage}
                  alt={displayTitle || "Course"}
                  width={600}
                  height={400}
                  className="w-full h-72 object-cover"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {displayIsFeatured && (
                  <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 text-xs font-bold">
                    <IconStar className="w-3.5 h-3.5 fill-yellow-400" />
                    Featured
                  </div>
                )}
                {displayLevel && (
                  <div className={`absolute top-4 right-4 px-3 py-1.5 rounded-full border text-xs font-bold ${levelColors[displayLevel]}`}>
                    {displayLevel}
                  </div>
                )}
              </div>

              {/* Quick stats — only show if DB course with level/duration */}
              {(displayLevel || displayDuration || displayCategory) && (
                <div className="grid grid-cols-3 gap-3 mt-4">
                  {[
                    { icon: IconClock, label: "Duration", value: displayDuration || "Self-paced" },
                    { icon: IconChartBar, label: "Level", value: displayLevel || "All Levels" },
                    { icon: IconBook, label: "Category", value: displayCategory || "Music" },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-white/5 border border-white/10">
                      <Icon className="w-4 h-4 text-purple-400" />
                      <p className="text-[10px] text-neutral-500 uppercase tracking-wide">{label}</p>
                      <p className="text-white text-xs font-semibold text-center">{value}</p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Right — Details + Payment */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex flex-col gap-6"
            >
              <div>
                <h1 className="text-3xl md:text-5xl font-bold leading-tight bg-gradient-to-r from-white via-purple-200 to-indigo-300 bg-clip-text text-transparent">
                  {displayTitle
                    ? displayTitle.charAt(0).toUpperCase() + displayTitle.slice(1)
                    : "Course"}
                </h1>
                {displayInstructor && (
                  <div className="flex items-center gap-2 mt-3">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold uppercase">
                      {displayInstructor.charAt(0)}
                    </div>
                    <span className="text-neutral-400 text-sm">
                      by <span className="text-white font-medium">{displayInstructor}</span>
                    </span>
                  </div>
                )}
              </div>

              <p className="text-neutral-300 text-base leading-relaxed">
                {displayDesc}
              </p>

              {/* What you'll learn */}
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">What You&apos;ll Learn</h3>
                <ul className="space-y-2">
                  {[
                    "Foundational music theory & notation",
                    "Hands-on practice with real instruments",
                    "Advanced compositions & improvisation",
                    "Industry-standard production techniques",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-neutral-300 text-sm">
                      <span className="text-purple-400 mt-0.5 flex-shrink-0">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Price & Payment — always show */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-900/30 to-indigo-900/20 border border-purple-500/20">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-neutral-400 text-xs uppercase tracking-wide">Course Price</p>
                    <p className="text-4xl font-bold text-white mt-0.5">
                      ₹{displayPrice.toLocaleString("en-IN")}
                      <span className="text-base text-neutral-400 font-normal ml-1">INR</span>
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs text-neutral-500 line-through">
                      ₹{Math.round(displayPrice * 1.4).toLocaleString("en-IN")}
                    </span>
                    <span className="text-xs text-green-400 font-semibold">30% OFF</span>
                  </div>
                </div>
                <PaymentButton
                  courseId={courseIdForPayment || slug}
                  courseTitle={displayTitle || "Course"}
                  price={displayPrice}
                  courseSlug={slug}
                  courseImage={displayImage}
                  isPurchased={isPurchased}
                  onSuccess={() => setIsPurchased(true)}
                />
              </div>

              {/* Guarantees */}
              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  { emoji: "🎓", label: "Certificate" },
                  { emoji: "♾️", label: "Lifetime access" },
                  { emoji: "💬", label: "24/7 support" },
                ].map(({ emoji, label }) => (
                  <div key={label} className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-xl mb-1">{emoji}</p>
                    <p className="text-neutral-400 text-[11px] leading-tight">{label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
}
