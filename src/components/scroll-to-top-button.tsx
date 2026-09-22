"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * ScrollToTopButton — a floating button in the bottom-right corner that
 * appears after the user scrolls down >400px and scrolls back to the top
 * when clicked. Rendered once in the root layout so it shows on every page.
 *
 * The button respects prefers-reduced-motion (smooth scroll vs instant).
 * It's hidden on the very top (scrollY <= 400) to avoid covering content.
 */
export function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 400);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, left: 0, behavior: prefersReduced ? "auto" : "smooth" });
  };

  return (
    <Button
      type="button"
      onClick={scrollToTop}
      aria-label="Scroll to top"
      size="icon"
      className={cn(
        "btn-gold fixed bottom-6 right-6 z-40 h-11 w-11 rounded-full shadow-lg shadow-amber-900/30 transition-all duration-300",
        visible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-4 pointer-events-none",
      )}
    >
      <ArrowUp className="h-5 w-5" />
    </Button>
  );
}
