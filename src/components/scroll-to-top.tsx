"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Scrolls window to top whenever the route changes (PRD requirement)
export function ScrollToTop() {
  const pathname = usePathname();
  useEffect(() => {
    if ("scrollTo" in window) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
  }, [pathname]);
  return null;
}
