"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Invisible component — tracks page visits AND time spent on site.
 * Include once in root layout.
 * - Page views: tracked on every route change (skips /admin)
 * - Screen time: tracked via visibilitychange + beforeunload + 60s periodic flush
 */
export default function AnalyticsTracker() {
  const pathname = usePathname();
  const visitorIdRef = useRef<string>("");
  // Time tracking refs
  const sessionStartRef = useRef<number>(Date.now());
  const accumulatedMsRef = useRef<number>(0);
  const isVisibleRef = useRef<boolean>(true);
  const isAdminRef = useRef<boolean>(false);

  // Keep isAdminRef in sync with pathname
  useEffect(() => {
    isAdminRef.current = pathname.startsWith("/admin");
  }, [pathname]);

  // Init: get or create persistent visitorId
  useEffect(() => {
    let id = localStorage.getItem("_vid");
    if (!id) {
      id = `v_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem("_vid", id);
    }
    visitorIdRef.current = id;
  }, []);

  // ── Time tracking (runs once for the whole session) ──────────────────
  useEffect(() => {
    const getVid = () =>
      visitorIdRef.current || localStorage.getItem("_vid") || "";

    /** Send accumulated time to server (uses sendBeacon for reliability) */
    const sendTime = (ms: number) => {
      if (isAdminRef.current) return; // don't count admin browsing
      const seconds = Math.round(ms / 1000);
      if (seconds < 3) return; // ignore blips < 3 seconds
      const vid = getVid();
      if (!vid) return;

      const payload = JSON.stringify({ visitorId: vid, seconds });
      try {
        // sendBeacon: survives page close / tab switch
        const blob = new Blob([payload], { type: "application/json" });
        if (typeof navigator.sendBeacon === "function") {
          navigator.sendBeacon("/api/analytics/time", blob);
        } else {
          // Fallback for environments without sendBeacon
          fetch("/api/analytics/time", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: payload,
            keepalive: true,
          }).catch(() => {});
        }
      } catch {
        // silent fail
      }
    };

    /**
     * Flush accumulated time.
     * If tab is currently visible, adds elapsed time since last start.
     * Resets accumulator. Returns the flushed ms value.
     */
    const flush = (): number => {
      if (isVisibleRef.current) {
        accumulatedMsRef.current += Date.now() - sessionStartRef.current;
        sessionStartRef.current = Date.now(); // reset for next period
      }
      const ms = accumulatedMsRef.current;
      accumulatedMsRef.current = 0;
      return ms;
    };

    // Tab hidden → pause timer and send
    const handleVisibilityChange = () => {
      if (document.hidden) {
        const ms = flush();
        isVisibleRef.current = false;
        sendTime(ms);
      } else {
        // Tab visible again → resume timer
        sessionStartRef.current = Date.now();
        isVisibleRef.current = true;
      }
    };

    // Browser/tab closed → send final time
    const handleBeforeUnload = () => {
      const ms = flush();
      sendTime(ms);
    };

    // Periodic flush every ~60s of active time (captures long idle sessions)
    const intervalId = setInterval(() => {
      if (!isVisibleRef.current) return;
      const elapsed = Date.now() - sessionStartRef.current;
      if (elapsed >= 58000) {
        const ms = flush();
        sendTime(ms);
        // flush() already reset sessionStartRef, so timer continues
      }
    }, 30000);

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      clearInterval(intervalId);
    };
  }, []); // runs once — intentional

  // ── Page view tracking (runs on every route change) ──────────────────
  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    const visitorId = visitorIdRef.current || localStorage.getItem("_vid");
    if (!visitorId) return;

    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visitorId, path: pathname }),
    }).catch(() => {});
  }, [pathname]);

  return null;
}

