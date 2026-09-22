"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * ScrollToTopButton — a floating button in the BOTTOM-LEFT corner that
 * appears after the user scrolls down >400px and scrolls back to the top
 * when clicked. Rendered once in the root layout so it shows on every page.
 *
 * Styling (per user request):
 *  - Default: transparent background + WHITE arrow + subtle white border.
 *  - On hover OR while clicked (scrolling): converts to the GOLDEN brand
 *    gradient background + white arrow.
 *  - Respects prefers-reduced-motion (smooth scroll vs instant).
 *  - Hidden on the very top (scrollY <= 400) to avoid covering content.
 */
export function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState(false);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 400);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    // Show the "active" golden state briefly while scrolling.
    setActive(true);
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, left: 0, behavior: prefersReduced ? "auto" : "smooth" });
    // Reset active state after the scroll settles.
    setTimeout(() => setActive(false), 800);
  };

  const isGolden = active || hovering;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Scroll to top"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      style={
        isGolden
          ? { backgroundImage: "linear-gradient(135deg, #F5B82E 0%, #C98216 100%)" }
          : undefined
      }
      className={cn(
        "fixed bottom-6 left-6 z-40 h-11 w-11 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 cursor-pointer text-white",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
        visible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-4 pointer-events-none",
        isGolden
          ? "border-transparent"
          : "bg-black/20 backdrop-blur-sm border border-white/40",
      )}
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}
