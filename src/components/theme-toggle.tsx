"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Mount-detection helper (no set-state-in-effect)
function useMounted(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

interface ThemeToggleProps {
  /**
   * Controls the icon color:
   * - "white"  → solid white (for transparent navbar over dark hero, or dark mode)
   * - "gradient" → neon gradient (for solid navbar in light mode)
   */
  variant: "white" | "gradient";
}

export function ThemeToggle({ variant }: ThemeToggleProps) {
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
        variant === "white"
          ? "text-white hover:bg-white/10 hover:text-white"
          : "hover:bg-primary/10",
      )}
    >
      {mounted && isDark
        ? <Sun className={cn("h-4 w-4", variant === "gradient" && "icon-neon")} />
        : <Moon className={cn("h-4 w-4", variant === "gradient" && "icon-neon")} />}
    </Button>
  );
}
