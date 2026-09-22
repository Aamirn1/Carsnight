"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Mount-detection helper that doesn't trigger `react-hooks/set-state-in-effect`.
function useMounted(): boolean {
  return useSyncExternalStore(
    () => () => {}, // never changes after mount
    () => true, // client snapshot: mounted
    () => false, // server snapshot: not mounted
  );
}

interface ThemeToggleProps {
  /** When true, renders the icon in white (for transparent navbar over the
      dark hero in light mode). When false, uses the neon brand color. */
  light?: boolean;
}

export function ThemeToggle({ light = false }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const mounted = useMounted();

  const isDark = mounted ? (resolvedTheme === "dark" || theme === "dark") : false;

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "h-9 w-9",
        // When transparent over the dark hero (light mode), use white so the
        // icon reads against the dark hero. Otherwise use the neon brand
        // color (violet #8B5CF6 = --primary) so it matches the gradient
        // identity without the SVG-stroke-gradient complexity.
        light && !isDark
          ? "text-white hover:bg-white/10 hover:text-white"
          : "text-primary hover:bg-primary/10 hover:text-primary",
      )}
    >
      {mounted && isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}
