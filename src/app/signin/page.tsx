"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  LogIn,
  Mail,
  Lock,
  Loader2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  Bitcoin,
  Globe2,
  HelpCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BrandMark } from "@/components/brand-mark";

const MARKETING_POINTS = [
  {
    icon: Sparkles,
    title: "2 Free Listings",
    desc: "Post your first two ads at no cost — no credit card required.",
  },
  {
    icon: Bitcoin,
    title: "Crypto + Card Payments",
    desc: "Pay securely with BTC, ETH, USDT, or your everyday card.",
  },
  {
    icon: Globe2,
    title: "20+ Countries",
    desc: "Buy, sell, and rent vehicles across a global marketplace.",
  },
  {
    icon: ShieldCheck,
    title: "Secure & SEO-Optimized",
    desc: "HttpOnly sessions, encrypted passwords, fast indexed pages.",
  },
];

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (!res || res.error || !res.ok) {
        // Generic error — no email enumeration per PRD
        setError("Invalid email or password.");
        setLoading(false);
        return;
      }

      // Read the user's role from /api/me to decide where to send them
      let role: "USER" | "ADMIN" = "USER";
      try {
        const meRes = await fetch("/api/me", { cache: "no-store", credentials: "same-origin" });
        if (meRes.ok) {
          const data = await meRes.json();
          if (data?.user?.role === "ADMIN") role = "ADMIN";
        }
      } catch {
        // fall back to dashboard if /api/me fails — session is still valid
      }

      router.push(role === "ADMIN" ? "/admin" : "/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] w-full flex items-stretch sm:items-center justify-center bg-gradient-to-b from-background via-accent/30 to-background py-10 sm:py-16">
      <div className="mx-auto grid w-full max-w-5xl gap-6 px-4 sm:px-6 md:grid-cols-2 md:gap-10 md:items-center lg:px-8">
        {/* Marketing panel — hidden on mobile */}
        <aside className="hidden md:flex flex-col gap-6 md:pr-6">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back to home
            </Link>
            <h1 className="mt-4 text-3xl lg:text-4xl font-bold tracking-tight">
              Welcome back to <span className="gradient-text">Cars Night</span>
            </h1>
            <p className="mt-2 text-muted-foreground">
              Sign in to manage your listings, messages, and subscriptions in one place.
            </p>
          </div>

          <ul className="grid gap-3">
            {MARKETING_POINTS.map((p) => (
              <li key={p.title} className="glass-panel rounded-xl p-4 flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <p.icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold">{p.title}</p>
                  <p className="text-sm text-muted-foreground">{p.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </aside>

        {/* Form card */}
        <div className="w-full max-w-md mx-auto md:max-w-none">
          <Card className="glass-panel shadow-xl border-border/60">
            <CardHeader className="space-y-3 items-center text-center">
              <BrandMark size="md" />
              <div className="space-y-1">
                <CardTitle className="text-2xl flex items-center justify-center gap-2">
                  <LogIn className="h-5 w-5 text-primary" /> Sign in
                </CardTitle>
                <CardDescription>Enter your credentials to access your account.</CardDescription>
              </div>
            </CardHeader>

            <form onSubmit={handleSubmit} noValidate>
              <CardContent className="space-y-4">
                {error && (
                  <div
                    role="alert"
                    aria-live="polite"
                    className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
                  >
                    {error}
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      inputMode="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9"
                      required
                      disabled={loading}
                      maxLength={200}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      autoComplete="current-password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9"
                      required
                      disabled={loading}
                      minLength={8}
                      maxLength={200}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="remember"
                      checked={remember}
                      onCheckedChange={(v) => setRemember(v === true)}
                      disabled={loading}
                    />
                    <Label htmlFor="remember" className="text-sm font-normal text-muted-foreground cursor-pointer">
                      Remember me
                    </Label>
                  </div>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Admin sign-in hint"
                      >
                        <HelpCircle className="h-3.5 w-3.5" /> Admin?
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-[240px]">
                      Administrators are auto-detected by email. Use your admin credentials here — your role is detected automatically.
                    </TooltipContent>
                  </Tooltip>
                </div>

                <Button
                  type="submit"
                  className="w-full h-10 bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Signing in…
                    </>
                  ) : (
                    <>
                      <LogIn className="h-4 w-4" /> Sign in
                    </>
                  )}
                </Button>

                {/* Mobile-only back-to-home */}
                <Link
                  href="/"
                  className="md:hidden inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors justify-center"
                >
                  <ArrowLeft className="h-4 w-4" /> Back to home
                </Link>
              </CardContent>

              <CardFooter className="flex flex-col gap-3 border-t pt-6">
                <p className="text-sm text-muted-foreground text-center w-full">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/signup"
                    className="font-medium text-primary hover:underline inline-flex items-center gap-1"
                  >
                    Sign up free <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </p>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
