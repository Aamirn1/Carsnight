"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Typewriter } from "@/components/typewriter";
import { Sparkles, ArrowRight, Car, ShieldCheck, Globe2, Bitcoin } from "lucide-react";

interface Props {
  tagline: string;
  saleCount: number;
  rentCount: number;
  userCount: number;
}

export function HomeHero({ tagline, saleCount, rentCount, userCount }: Props) {
  return (
    <section className="relative overflow-hidden">
      {/* Parallax background */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/hero-bg.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-25 dark:opacity-15"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/85 to-background" />
        {/* Decorative glow blobs */}
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute top-1/3 -right-24 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left: copy */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" /> New: crypto payments now live
            </div>

            <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-tight">
              <span className="block">Your global car</span>
              <span className="block gradient-text">marketplace,</span>
              <span className="block min-h-[1.2em]">
                <Typewriter
                  phrases={[
                    "no gravity needed!",
                    "Buy your dream car.",
                    "List a car in minutes.",
                    "Rent for special events.",
                    "Pay with crypto or card.",
                  ]}
                />
              </span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0">
              {tagline} Buy, sell, and rent cars across 20+ countries. Two free listings to start, then upgrade with Pro Plans from $5.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md">
                <Link href="/cars-for-sale"><Car className="h-4 w-4 mr-1" /> Browse cars</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/post-ad"><Sparkles className="h-4 w-4 mr-1" /> Post a free ad</Link>
              </Button>
            </div>

            {/* Mini stats */}
            <div className="mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span><strong className="font-semibold">Secure</strong> & rate-limited</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe2 className="h-4 w-4 text-primary" />
                <span><strong className="font-semibold">{(saleCount + rentCount).toLocaleString()}+</strong> listings</span>
              </div>
              <div className="flex items-center gap-2">
                <Bitcoin className="h-4 w-4 text-primary" />
                <span><strong className="font-semibold">Crypto</strong> accepted</span>
              </div>
            </div>
          </div>

          {/* Right: floating 3D-ish car card */}
          <div className="relative hidden lg:block">
            <div className="relative animate-float-slow">
              <div className="absolute inset-0 -z-10 rounded-[2.5rem] bg-gradient-to-br from-primary/30 to-blue-500/20 blur-2xl" />
              <div className="glass-panel rounded-[2.5rem] p-6 shadow-2xl">
                <div className="relative aspect-[16/10] rounded-3xl overflow-hidden">
                  <Image
                    src="/cars/porsche-red.png"
                    alt="Featured Porsche 911 sports car"
                    fill
                    priority
                    sizes="(max-width: 1024px) 0px, 50vw"
                    className="object-cover"
                  />
                  <div className="absolute left-3 top-3 bg-white/90 text-foreground text-xs font-medium px-2.5 py-1 rounded-full shadow">
                    Featured
                  </div>
                </div>
                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <div className="text-lg font-bold">2021 Porsche 911</div>
                    <div className="text-sm text-muted-foreground">Carrera · New York, USA</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">$95,000</div>
                    <div className="text-xs text-muted-foreground">For Sale</div>
                  </div>
                </div>
              </div>

              {/* Floating mini badges */}
              <div className="absolute -left-6 top-10 animate-float glass-panel rounded-2xl p-3 shadow-lg" style={{ animationDelay: "0.5s" }}>
                <div className="flex items-center gap-2">
                  <Bitcoin className="h-5 w-5 text-primary" />
                  <div>
                    <div className="text-xs text-muted-foreground">Pay with</div>
                    <div className="text-sm font-semibold">Crypto</div>
                  </div>
                </div>
              </div>
              <div className="absolute -right-4 bottom-10 animate-float glass-panel rounded-2xl p-3 shadow-lg" style={{ animationDelay: "1.2s" }}>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <div>
                    <div className="text-xs text-muted-foreground">Verified</div>
                    <div className="text-sm font-semibold">Secure</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
