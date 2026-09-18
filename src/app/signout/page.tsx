"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { Loader2 } from "lucide-react";

export default function SignOutPage() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await signOut({ callbackUrl: "/", redirect: false }).catch(() => null);
      if (cancelled) return;
      setDone(true);
      // Soft redirect to home (preserves SPA state, no full reload)
      window.location.href = "/";
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-[calc(100vh-4rem)] w-full flex items-center justify-center bg-gradient-to-b from-background via-accent/30 to-background px-4 py-16">
      <div className="flex flex-col items-center gap-4 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
        <h1 className="text-lg font-semibold">
          {done ? "You're signed out." : "Signing you out…"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {done ? "Redirecting you home." : "Hang tight while we end your session."}
        </p>
        <span className="sr-only" role="status" aria-live="polite">
          {done ? "Signed out. Redirecting." : "Signing out in progress."}
        </span>
      </div>
    </div>
  );
}
