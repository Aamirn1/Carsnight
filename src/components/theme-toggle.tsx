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
  /** Unused now — kept for API compatibility. Icons always use the gradient. */
  light?: boolean;
}

export function ThemeToggle({ light: _light = false }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const mounted = useMounted();

  const isDark = mounted ? (resolvedTheme === "dark" || theme === "dark") : false;

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="h-9 w-9 hover:bg-primary/10"
    >
      {/* Always use the neon gradient — never changes color regardless of
          light/dark mode or transparent/solid navbar. */}
      {mounted && isDark
        ? <Sun className="h-4 w-4 icon-neon" />
        : <Moon className="h-4 w-4 icon-neon" />}
    </Button>
  );
}
