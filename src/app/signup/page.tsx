"use client";

import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  UserPlus,
  Mail,
  Lock,
  User,
  Loader2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  Bitcoin,
  Globe2,
  RefreshCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CountryCitySelect } from "@/components/country-city-select";
import { useToast } from "@/hooks/use-toast";

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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignUpPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [captchaQuestion, setCaptchaQuestion] = useState("");
  const [captchaExpected, setCaptchaExpected] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [captchaLoading, setCaptchaLoading] = useState(false);

  async function refreshCaptcha() {
    setCaptchaLoading(true);
    try {
      const res = await fetch("/api/register", { cache: "no-store" });
      if (!res.ok) throw new Error("captcha fetch failed");
      const data = await res.json();
      setCaptchaQuestion(data.question || "");
      setCaptchaExpected(String(data.answer ?? ""));
      setCaptchaAnswer("");
    } catch {
      // Will retry on next interaction
    } finally {
      setCaptchaLoading(false);
    }
  }

  useEffect(() => {
    refreshCaptcha();
  }, []);

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Name is required.";
    if (!EMAIL_RE.test(email.trim())) e.email = "Please enter a valid email address.";
    if (password.length < 8) e.password = "Password must be at least 8 characters.";
    if (password.length > 200) e.password = "Password is too long.";
    if (!country) e.country = "Please select your country.";
    if (!city) e.city = "Please select your city.";
    if (!captchaAnswer.trim()) e.captcha = "Please solve the captcha.";
    else if (!/^-?\d+$/.test(captchaAnswer.trim())) e.captcha = "Captcha answer must be a number.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;
    setFormError(null);

    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          name: name.trim(),
          country,
          city,
          captcha: captchaAnswer.trim(),
          captchaAnswer: captchaExpected,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        // Refresh captcha on failure (answer is single-use in spirit)
        await refreshCaptcha();

        if (res.status === 409) {
          setFormError(data?.error || "An account with that email already exists.");
        } else if (res.status === 400) {
          setFormError(data?.error || "Please check the form and try again.");
        } else {
          setFormError(data?.error || "Could not create your account. Please try again.");
        }
        setLoading(false);
        return;
      }

      // Auto sign-in on success
      const signed = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (!signed || signed.error || !signed.ok) {
        // Account created but auto sign-in failed — send them to sign-in
        toast({
          title: "Account created!",
          description: "Please sign in with your new credentials.",
        });
        router.push("/signin");
        return;
      }

      toast({
        title: "Account created!",
        description: "Welcome to Cars Night.",
      });
      try {
        router.push("/dashboard");
        router.refresh();
      } catch {
        if (typeof window !== "undefined") {
          window.location.href = "/dashboard";
        }
      }
    } catch {
      setFormError("Something went wrong. Please try again.");
      await refreshCaptcha();
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
              Join <span className="gradient-text">Cars Night</span> free
            </h1>
            <p className="mt-2 text-muted-foreground">
              Create your account in seconds and start listing cars to a worldwide audience.
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
            <CardHeader className="space-y-3">
              {/* Back to home — top-left of the card */}
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors self-start"
              >
                <ArrowLeft className="h-4 w-4" /> Back to home
              </Link>
              <div className="space-y-1 text-center">
                <CardTitle className="text-2xl flex items-center justify-center gap-2">
                  <UserPlus className="h-5 w-5 text-primary" /> Create your account
                </CardTitle>
                <CardDescription>It takes less than a minute. No credit card required.</CardDescription>
              </div>
            </CardHeader>

            <form onSubmit={handleSubmit} noValidate>
              <CardContent className="space-y-4">
                {formError && (
                  <div
                    role="alert"
                    aria-live="polite"
                    className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
                  >
                    {formError}
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="name">Full name</Label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      autoComplete="name"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-9"
                      required
                      disabled={loading}
                      maxLength={100}
                      aria-invalid={!!errors.name}
                    />
                  </div>
                  {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="su-email">Email</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="su-email"
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
                      aria-invalid={!!errors.email}
                    />
                  </div>
                  {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="su-password">Password</Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="su-password"
                      type="password"
                      autoComplete="new-password"
                      placeholder="At least 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9"
                      required
                      disabled={loading}
                      minLength={8}
                      maxLength={200}
                      aria-invalid={!!errors.password}
                    />
                  </div>
                  {errors.password ? (
                    <p className="text-xs text-destructive">{errors.password}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">Minimum 8 characters.</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <CountryCitySelect
                    country={country}
                    city={city}
                    onCountryChange={setCountry}
                    onCityChange={setCity}
                    countryPlaceholder="Select your country"
                    cityPlaceholder="Select your city"
                    disabled={loading}
                    idPrefix="su"
                  />
                  {(errors.country || errors.city) && (
                    <p className="text-xs text-destructive">{errors.country || errors.city}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="captcha">Captcha: {captchaQuestion || "Loading…"}</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="captcha"
                        type="text"
                        inputMode="numeric"
                        autoComplete="off"
                        placeholder="Your answer"
                        value={captchaAnswer}
                        onChange={(e) => setCaptchaAnswer(e.target.value)}
                        required
                        disabled={loading || captchaLoading || !captchaQuestion}
                        maxLength={6}
                        aria-invalid={!!errors.captcha}
                        className="pr-9"
                      />
                      <button
                        type="button"
                        onClick={refreshCaptcha}
                        disabled={loading || captchaLoading}
                        aria-label="Refresh captcha"
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                      >
                        <RefreshCw className={`h-4 w-4 ${captchaLoading ? "animate-spin" : ""}`} />
                      </button>
                    </div>
                  </div>
                  {errors.captcha && <p className="text-xs text-destructive">{errors.captcha}</p>}
                </div>

                <Button
                  type="submit"
                  className="w-full h-10 bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Creating account…
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" /> Create account
                    </>
                  )}
                </Button>
              </CardContent>

              <CardFooter className="flex flex-col gap-3 border-t pt-6">
                <p className="text-xs text-muted-foreground text-center w-full">
                  By creating an account you agree to our Terms &amp; Privacy Policy.
                </p>
                <p className="text-sm text-muted-foreground text-center w-full">
                  Already have an account?{" "}
                  <Link
                    href="/signin"
                    className="font-medium text-primary hover:underline inline-flex items-center gap-1"
                  >
                    Sign in <ArrowRight className="h-3.5 w-3.5" />
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
