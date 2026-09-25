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
        // White when: transparent navbar over dark hero (light mode) OR dark mode
        // Gradient (via icon-neon) when: solid navbar in light mode
        (light && !isDark) || isDark
          ? "text-white hover:bg-white/10 hover:text-white"
          : "hover:bg-primary/10",
      )}
    >
      {mounted && isDark
        ? <Sun className="h-4 w-4" />
        : <Moon className={cn("h-4 w-4", !light && !isDark && "icon-neon")} />}
    </Button>
  );
}
