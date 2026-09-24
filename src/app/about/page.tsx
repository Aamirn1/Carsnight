import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Globe2, Bitcoin, Tag, Sparkles, Car, Heart, Target, Users, Rocket } from "lucide-react";

export const metadata: Metadata = {
  title: "About Cars Night",
  description: "Cars Night is a global car marketplace on a mission to make buying, selling, and renting cars effortless, secure, and global — with crypto and card payments.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About Cars Night — Your Global Car Marketplace",
    description: "Our mission, our story, and what makes Cars Night different.",
    type: "website",
  },
};

const VALUES = [
  { icon: Globe2, title: "Global by default", text: "Buyers and sellers across 20+ countries, with localized listings tuned to your country and city." },
  { icon: Bitcoin, title: "Crypto-native", text: "Pay with Bitcoin, Ethereum, or USDT — no bank fees, no chargebacks, instant settlement worldwide." },
  { icon: ShieldCheck, title: "Secure by design", text: "OWASP-aligned security, hashed passwords, rate-limited APIs, and audit logs for every admin action." },
  { icon: Tag, title: "Fair pricing", text: "Two free ads for everyone. Upgrade with a one-time Pro Plan purchase from $5. Credits never expire." },
];

const STATS = [
  { value: "20+", label: "Countries" },
  { value: "14+", label: "Active listings" },
  { value: "5+", label: "Verified sellers" },
  { value: "100%", label: "Secure payments" },
];

const TIMELINE = [
  { year: "2025", title: "The idea", text: "Cars Night was born from a simple frustration: buying a car online was fragmented, unsafe, and deeply local. We set out to fix that." },
  { year: "2026", title: "Launch", text: "We opened to early users in 5 countries — the US, UK, Pakistan, Japan, and the UAE — with crypto payments from day one." },
  { year: "2026+", title: "Where we're going", text: "Expanding to 50+ countries, AI-powered vehicle inspections, virtual test drives, and a mobile app — all while keeping the experience premium and human." },
];

export default function AboutPage() {
  return (
    <div className="flex flex-col">
      {/* Hero — centered, light gradient, matching Plans/Buy/Rent pages */}
      <section className="bg-gradient-to-b from-primary/5 to-transparent border-b border-border">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 mb-4">
            <Sparkles className="h-3 w-3 mr-1" /> About
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight">
            We&apos;re building the world&apos;s most <span className="gradient-text">human car marketplace</span>
          </h1>
          <p className="mt-3 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Cars Night exists to make car transactions effortless, secure, and global — whether you&apos;re buying your first car, selling a supercar, or renting a Tesla for the weekend.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y bg-card/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl sm:text-5xl font-bold tracking-tight text-primary">{s.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge variant="outline" className="mb-3 text-primary border-primary/30"><Target className="h-3 w-3 mr-1" /> Our Mission</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">A car marketplace that respects your time, money, and trust</h2>
          </div>
          <div className="mt-10 grid sm:grid-cols-2 gap-6">
            {VALUES.map((v, i) => (
              <div key={i} className="group rounded-2xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0">
                    <v.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{v.title}</h3>
                    <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{v.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story timeline */}
      <section className="py-16 sm:py-20 bg-card/30">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-3 text-primary border-primary/30"><Rocket className="h-3 w-3 mr-1" /> Our Story</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">From a simple idea to a global marketplace</h2>
          </div>
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-4 sm:left-1/2 sm:-translate-x-1/2 top-0 bottom-0 w-px bg-border" />
            <div className="space-y-10">
              {TIMELINE.map((t, i) => (
                <div key={i} className={`relative flex sm:items-center ${i % 2 === 0 ? "sm:flex-row" : "sm:flex-row-reverse"}`}>
                  <div className="hidden sm:block sm:w-1/2" />
                  {/* Dot — aligned with the year text. On mobile the card has
                      p-6 (24px padding) + text-2xl year (line-height ~32px),
                      so the year center is at ~40px from the card top. The
                      dot at top-10 (40px) aligns with it. On desktop it's
                      centered on the line (top-1/2 -translate-y-1/2). */}
                  <div className="absolute left-4 sm:left-1/2 sm:-translate-x-1/2 top-10 sm:top-1/2 sm:-translate-y-1/2 w-3 h-3 rounded-full bg-primary ring-4 ring-background z-10" />
                  <div className={`pl-12 sm:pl-0 sm:w-1/2 sm:px-8 ${i % 2 === 0 ? "sm:text-right" : "sm:text-left"}`}>
                    <div className="rounded-2xl border bg-card p-6 shadow-sm">
                      <div className="text-2xl font-bold text-primary">{t.year}</div>
                      <h3 className="mt-1 font-semibold text-lg">{t.title}</h3>
                      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{t.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* What makes us different */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="outline" className="mb-3 text-primary border-primary/30"><Heart className="h-3 w-3 mr-1" /> What Makes Us Different</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Built for car people, by car people</h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            We&apos;re a small, obsessive team of car enthusiasts and engineers. We&apos;ve bought cars the painful way — and we&apos;re building the marketplace we wish existed. Every decision starts with a simple question: would we use this ourselves?
          </p>
          <div className="mt-12 grid sm:grid-cols-3 gap-6 text-left">
            <div className="rounded-2xl border bg-card p-6 shadow-sm">
              <Users className="h-6 w-6 text-primary" />
              <h3 className="mt-3 font-semibold">Humans, not bots</h3>
              <p className="mt-1 text-sm text-muted-foreground">Every listing is reviewed by a real person. No spam, no fake dealers, no AI-generated inventory.</p>
            </div>
            <div className="rounded-2xl border bg-card p-6 shadow-sm">
              <Car className="h-6 w-6 text-primary" />
              <h3 className="mt-3 font-semibold">Cars first</h3>
              <p className="mt-1 text-sm text-muted-foreground">The car is the hero. Our cinematic hero, large listing photos, and minimal UI keep the spotlight where it belongs.</p>
            </div>
            <div className="rounded-2xl border bg-card p-6 shadow-sm">
              <ShieldCheck className="h-6 w-6 text-primary" />
              <h3 className="mt-3 font-semibold">Security is a feature</h3>
              <p className="mt-1 text-sm text-muted-foreground">Hashed passwords, rate limits, audit logs, crypto escrow. We invest in security so you don&apos;t have to worry.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-16 sm:pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border bg-gradient-to-br from-primary/10 to-background p-8 sm:p-12 text-center shadow-sm">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Join Cars Night today</h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              Two free listings, no credit card needed. Reach buyers and renters worldwide.
            </p>
            <Button asChild size="lg" className="mt-6 btn-gold">
              <Link href="/signup"><Sparkles className="h-4 w-4 mr-1" /> Get started free</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
