"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { motion } from "framer-motion";
import { IconMusicBolt, IconLoader2, IconLock, IconUser } from "@tabler/icons-react";
import { SparklesCore } from "@/components/ui/sparkles";

export default function AdminLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await axios.post("/api/admin/login", form);
      router.replace("/admin/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center relative overflow-hidden px-4">
      {/* Sparkles */}
      <div className="absolute inset-0">
        <SparklesCore
          background="transparent"
          minSize={0.4}
          maxSize={1}
          particleDensity={40}
          className="w-full h-full"
          particleColor="#a855f7"
          speed={0.4}
        />
      </div>
      {/* Grid */}
      <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none" />

      {/* Glow blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Card */}
        <div className="bg-neutral-900/80 backdrop-blur-xl border border-neutral-700/60 rounded-2xl p-8 shadow-2xl shadow-purple-900/20">
          {/* Top glow */}
          <div className="absolute -top-px left-1/2 -translate-x-1/2 w-40 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent" />

          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-xl shadow-purple-500/30 mb-4">
              <IconMusicBolt className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
            <p className="text-neutral-500 text-sm mt-1">MusicNext — Restricted Access</p>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
            >
              <span className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="text-xs text-neutral-400 font-medium block mb-1.5 uppercase tracking-wider">
                Username
              </label>
              <div className="flex items-center gap-3 bg-neutral-800 rounded-xl px-3.5 py-3 border border-neutral-700 focus-within:border-purple-500/50 focus-within:shadow-sm focus-within:shadow-purple-500/10 transition-all duration-200">
                <IconUser className="w-4 h-4 text-neutral-500 flex-shrink-0" />
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  placeholder="admin"
                  required
                  autoComplete="username"
                  className="flex-1 bg-transparent text-white text-sm outline-none placeholder-neutral-600"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs text-neutral-400 font-medium block mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="flex items-center gap-3 bg-neutral-800 rounded-xl px-3.5 py-3 border border-neutral-700 focus-within:border-purple-500/50 focus-within:shadow-sm focus-within:shadow-purple-500/10 transition-all duration-200">
                <IconLock className="w-4 h-4 text-neutral-500 flex-shrink-0" />
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="flex-1 bg-transparent text-white text-sm outline-none placeholder-neutral-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full mt-2 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all duration-150 shadow-lg shadow-purple-500/25 disabled:opacity-50 overflow-hidden"
            >
              <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12" />
              {loading ? (
                <>
                  <IconLoader2 className="w-4 h-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Login to Admin Panel →"
              )}
            </button>
          </form>

          <p className="text-center text-neutral-600 text-xs mt-6">
            🔒 Access restricted to authorized personnel only
          </p>
        </div>
      </motion.div>
    </div>
  );
}
