"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { startSessionMonitoring, clearAuthData } from "../lib/session";
import { showWarning, showError } from "../lib/toast";

// Pages that don't require authentication
const PUBLIC_PAGES = ["/login", "/register", "/forgot-password", "/reset-password", "/verify-email"];

export default function SessionMonitor() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Skip monitoring on public pages
    if (pathname === "/" || PUBLIC_PAGES.some(page => pathname.startsWith(page))) {
      return;
    }

    let hasWarned = false;

    const cleanup = startSessionMonitoring((status, timeRemaining) => {
      if (status === "expired") {
        // Session expired, redirect to login
        clearAuthData();
        showError("Your session has expired. Please log in again.");
        router.push("/login");
      } else if (status === "warning" && !hasWarned) {
        // Warn user about upcoming expiration
        hasWarned = true;
        const minutes = Math.floor(timeRemaining / 60);
        const seconds = timeRemaining % 60;
        const timeStr = minutes > 0 ? `${minutes} minute${minutes > 1 ? 's' : ''}` : `${seconds} seconds`;
        showWarning(`Your session will expire in ${timeStr}. Please save your work.`);
      }
    });

    return cleanup;
  }, [router, pathname]);

  return null;
}
