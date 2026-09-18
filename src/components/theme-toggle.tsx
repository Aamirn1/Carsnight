"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";

// Mount-detection helper that doesn't trigger `react-hooks/set-state-in-effect`.
// On the server, returns false; on the client after hydration, returns true.
function useMounted(): boolean {
  return useSyncExternalStore(
    () => () => {}, // never changes after mount
    () => true, // client snapshot: mounted
    () => false, // server snapshot: not mounted
  );
}

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const mounted = useMounted();

  const isDark = mounted ? (resolvedTheme === "dark" || theme === "dark") : false;

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="h-9 w-9"
    >
      {mounted && isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}
