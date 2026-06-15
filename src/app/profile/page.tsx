"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import axios from "axios";
import {
  IconUser,
  IconMail,
  IconShieldCheck,
  IconShieldX,
  IconMessage,
  IconCalendar,
  IconLogout,
  IconLoader2,
} from "@tabler/icons-react";
import { SparklesCore } from "@/components/ui/sparkles";
import { Spotlight } from "@/components/ui/Spotlight";
import {
  CardContainer,
  CardBody,
  CardItem,
} from "@/components/ui/3d-card";

interface UserProfile {
  _id: string;
  username: string;
  email: string;
  isVerified: boolean;
  isAcceptingMessage: boolean;
  messagesCount: number;
  createdAt: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { status } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }
    if (status === "authenticated") {
      fetchProfile();
    }
  }, [status]);

  const fetchProfile = async () => {
    try {
      const res = await axios.get("/api/profile");
      setProfile(res.data.user);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      localStorage.removeItem("identifier");
      await signOut({ redirect: false });
      router.push("/login");
    } catch (err) {
      console.error("Logout error:", err);
      setLoggingOut(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <IconLoader2 className="w-10 h-10 text-purple-500 animate-spin" />
          <p className="text-neutral-400 text-sm">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-400 text-lg">{error}</p>
          <button
            onClick={() => router.push("/login")}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black/[0.96] relative overflow-hidden py-20 px-4">

      {/* Spotlight */}
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill="purple"
      />

      {/* Sparkles background */}
      <div className="absolute inset-0 w-full h-full">
        <SparklesCore
          background="transparent"
          minSize={0.4}
          maxSize={1.2}
          particleDensity={50}
          className="w-full h-full"
          particleColor="#a855f7"
          speed={0.5}
        />
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
            
          </h1>
          <p className="text-neutral-500 text-sm mt-2">
            Manage your account details
          </p>
        </div>

        {/* 3D Avatar Card */}
        <CardContainer containerClassName="py-6">
          <CardBody className="relative bg-neutral-900/80 border border-neutral-700/60 rounded-2xl p-8 w-full h-auto flex flex-col items-center backdrop-blur-xl shadow-2xl">

            {/* Top glow line */}
            <CardItem translateZ={20} className="w-full">
              <div className="absolute -top-px left-1/2 -translate-x-1/2 w-56 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
            </CardItem>

            {/* Avatar */}
            <CardItem translateZ={80}>
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-600 flex items-center justify-center text-white text-5xl font-bold uppercase shadow-2xl ring-4 ring-purple-500/40 ring-offset-2 ring-offset-neutral-900 mb-1">
                {profile?.username?.charAt(0) ?? "?"}
              </div>
            </CardItem>

            {/* Purple glow under avatar */}
            <CardItem translateZ={30} className="mt-1 mb-4">
              <div className="w-28 h-4 bg-purple-600/30 rounded-full blur-xl" />
            </CardItem>

            <CardItem translateZ={50}>
              <h2 className="text-2xl font-bold text-white tracking-wide">
                @{profile?.username}
              </h2>
            </CardItem>

            <CardItem translateZ={40} className="mt-1">
              <p className="text-neutral-400 text-sm">{profile?.email}</p>
            </CardItem>

            {/* Verified badge */}
            <CardItem translateZ={60} className="mt-4">
              {profile?.isVerified ? (
                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-green-500/10 text-green-400 text-xs font-semibold border border-green-500/30 shadow-lg shadow-green-500/10">
                  <IconShieldCheck className="w-3.5 h-3.5" />
                  Verified Account
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-red-500/10 text-red-400 text-xs font-semibold border border-red-500/30">
                  <IconShieldX className="w-3.5 h-3.5" />
                  Not Verified
                </span>
              )}
            </CardItem>

            {/* Bottom glow line */}
            <CardItem translateZ={20} className="w-full mt-6">
              <div className="w-full h-px bg-gradient-to-r from-transparent via-neutral-700 to-transparent" />
            </CardItem>

            {/* Stats Row */}
            <div className="flex gap-10 mt-6 w-full justify-center">
              <CardItem translateZ={70} className="flex flex-col items-center">
                <span className="text-2xl font-bold text-white">{profile?.messagesCount ?? 0}</span>
                <span className="text-xs text-neutral-500 mt-0.5">Messages</span>
              </CardItem>
              <CardItem translateZ={70} className="flex flex-col items-center">
                <span className="text-2xl font-bold text-white">
                  {profile?.isAcceptingMessage ? "✅" : "❌"}
                </span>
                <span className="text-xs text-neutral-500 mt-0.5">Accepting Msgs</span>
              </CardItem>
              <CardItem translateZ={70} className="flex flex-col items-center">
                <span className="text-lg font-bold text-white">
                  {profile?.createdAt
                    ? new Date(profile.createdAt).getFullYear()
                    : "—"}
                </span>
                <span className="text-xs text-neutral-500 mt-0.5">Joined</span>
              </CardItem>
            </div>
          </CardBody>
        </CardContainer>

        {/* Info Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 -mt-4">
          <InfoCard
            icon={<IconUser className="w-5 h-5 text-purple-400" />}
            label="Username"
            value={`@${profile?.username}`}
            glowColor="purple"
          />
          <InfoCard
            icon={<IconMail className="w-5 h-5 text-blue-400" />}
            label="Email Address"
            value={profile?.email ?? ""}
            glowColor="blue"
          />
          <InfoCard
            icon={<IconMessage className="w-5 h-5 text-yellow-400" />}
            label="Total Messages"
            value={`${profile?.messagesCount ?? 0} messages`}
            glowColor="yellow"
          />
          <InfoCard
            icon={<IconCalendar className="w-5 h-5 text-green-400" />}
            label="Joined On"
            value={formatDate(profile?.createdAt ?? "")}
            glowColor="green"
          />
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="group w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl relative overflow-hidden bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-red-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {/* animated shine */}
          <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12" />
          {loggingOut ? (
            <>
              <IconLoader2 className="w-5 h-5 animate-spin" />
              Logging out...
            </>
          ) : (
            <>
              <IconLogout className="w-5 h-5" />
              Logout
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value,
  glowColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  glowColor: "purple" | "blue" | "yellow" | "green";
}) {
  const glowMap = {
    purple: "hover:border-purple-500/50 hover:shadow-purple-500/10",
    blue: "hover:border-blue-500/50 hover:shadow-blue-500/10",
    yellow: "hover:border-yellow-500/50 hover:shadow-yellow-500/10",
    green: "hover:border-green-500/50 hover:shadow-green-500/10",
  };
  const iconBgMap = {
    purple: "bg-purple-500/10",
    blue: "bg-blue-500/10",
    yellow: "bg-yellow-500/10",
    green: "bg-green-500/10",
  };

  return (
    <div
      className={`rounded-2xl border border-neutral-800 bg-neutral-900/70 backdrop-blur-sm p-5 flex items-start gap-4 transition-all duration-300 hover:shadow-lg ${glowMap[glowColor]}`}
    >
      <div className={`p-2.5 rounded-xl ${iconBgMap[glowColor]}`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-neutral-500 text-xs mb-1 uppercase tracking-wider">{label}</p>
        <p className="text-white text-sm font-semibold truncate">{value}</p>
      </div>
    </div>
  );
}
