"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Typewriter } from "@/components/typewriter";
import { FallingStars } from "@/components/falling-stars";
import { Sparkles, Car, ChevronDown, Search, MapPin, ShieldCheck, Globe2, Bitcoin, ArrowRight } from "lucide-react";

interface Props {
  tagline: string;
  announcement: string;
  saleCount: number;
  rentCount: number;
  userCount: number;
}

/**
 * ImageHero — premium cinematic desktop hero for Cars Night.
 *
 * Desktop: full-viewport hero with the new background image, left-side
 * content block (headline, paragraph, search card, stats, brands strip,
 * feature cards), right-side floating city cards overlay.
 * Mobile: keeps the existing mobile layout (mobile image + text content).
 *
 * The AI chat assistant is NOT touched.
 */
export function ImageHero({ tagline, announcement, saleCount, rentCount, userCount }: Props) {
  const [searchTab, setSearchTab] = useState<"Buy" | "Rent" | "All">("Buy");

  return (
    <section
      className="relative w-full min-h-screen overflow-hidden bg-black"
      aria-label="Cinematic car showcase"
    >
      {/* === Desktop background (new image) === */}
      <Image
        src="/hero-cars-desktop.png"
        alt="Three luxury cars parked at night in a futuristic neon city"
        fill
        priority
        sizes="(max-width: 1023px) 0px, 100vw"
        className="object-cover hidden lg:block"
      />
      {/* === Mobile background (existing image, unchanged) === */}
      <Image
        src="/hero-cars-mobile.png"
        alt="Three luxury cars parked at sunset with a city skyline"
        fill
        priority
        sizes="(max-width: 1023px) 100vw, 0px"
        className="object-cover lg:hidden"
      />

      {/* Slight dark overlay for readability (desktop only) */}
      <div className="absolute inset-0 hidden lg:block bg-gradient-to-r from-black/70 via-black/30 to-black/50" />
      <div className="absolute inset-0 hidden lg:block bg-gradient-to-b from-black/40 via-transparent to-black/60" />

      {/* Falling stars animation */}
      <FallingStars count={80} />

      {/* ================================================================
          DESKTOP CONTENT (lg+)
          ================================================================ */}
      <div className="relative z-10 hidden lg:flex h-full min-h-screen flex-col pt-24 pb-12">
        <div className="mx-auto max-w-7xl w-full px-8 flex-1 flex flex-col justify-center gap-8">

          {/* Left content + Right floating city cards */}
          <div className="grid grid-cols-2 gap-8 items-start">
            {/* LEFT: content block */}
            <div className="max-w-[620px]">
              {/* Announcement pill */}
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1.5 text-xs font-medium text-white/90 shadow-lg shadow-purple-500/10">
                <Sparkles className="h-3.5 w-3.5 text-fuchsia-400 shrink-0" /> {announcement}
              </div>

              {/* Headline */}
              <h1 className="mt-5 text-5xl xl:text-6xl font-bold tracking-tight leading-[1.05] text-white [text-shadow:0_2px_16px_rgba(0,0,0,0.6)]">
                Your global car
                <br />
                marketplace,{" "}
                <span
                  className="bg-clip-text text-transparent"
                  style={{ backgroundImage: "linear-gradient(135deg, #00A8FF, #6366F1, #8B5CF6, #D946EF)" }}
                >
                  no limits.
                </span>
              </h1>

              {/* Paragraph */}
              <p className="mt-5 text-lg text-white/80 max-w-[560px] leading-relaxed [text-shadow:0_1px_8px_rgba(0,0,0,0.5)]">
                Post your car ad and reach premium buyers worldwide — list in minutes, sell faster, and rent your vehicle for special events.
              </p>

              {/* === SEARCH / FILTER CARD === */}
              <div className="mt-7 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/15 shadow-2xl shadow-purple-500/10 overflow-hidden">
                {/* Tabs */}
                <div className="flex gap-1 p-2 border-b border-white/10">
                  {(["Buy", "Rent", "All"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setSearchTab(tab)}
                      className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                        searchTab === tab
                          ? "text-white shadow-lg"
                          : "text-white/50 hover:text-white/80 hover:bg-white/5"
                      }`}
                      style={
                        searchTab === tab
                          ? { backgroundImage: "linear-gradient(135deg, #00A8FF, #6366F1, #8B5CF6, #D946EF)" }
                          : undefined
                      }
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                {/* Search row */}
                <div className="flex items-center gap-2 p-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                    <input
                      type="text"
                      placeholder="Search make, model or keyword..."
                      className="w-full rounded-lg bg-white/5 border border-white/15 pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/40 focus:border-fuchsia-400/30"
                    />
                  </div>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 pointer-events-none" />
                    <select className="appearance-none rounded-lg bg-white/5 border border-white/15 pl-10 pr-8 py-2.5 text-sm text-white/80 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/40 cursor-pointer">
                      <option className="bg-slate-900">All countries</option>
                      <option className="bg-slate-900">United States</option>
                      <option className="bg-slate-900">United Kingdom</option>
                      <option className="bg-slate-900">Pakistan</option>
                      <option className="bg-slate-900">United Arab Emirates</option>
                      <option className="bg-slate-900">Japan</option>
                    </select>
                  </div>
                  <Button
                    asChild
                    size="default"
                    className="shrink-0 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                    style={{
                      backgroundImage: "linear-gradient(135deg, #00A8FF, #6366F1, #8B5CF6, #D946EF)",
                      boxShadow: "0 4px 20px -4px rgba(139,92,246,0.5)",
                    }}
                  >
                    <Link href="/cars-for-sale">
                      Search cars <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </div>

              {/* === STATS ROW === */}
              <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/85 [text-shadow:0_1px_6px_rgba(0,0,0,0.5)]">
                <span className="flex items-center gap-1.5">
                  <Car className="h-4 w-4 text-cyan-400" />
                  <strong className="font-semibold text-white">{(saleCount + rentCount).toLocaleString()}+</strong> listings
                </span>
                <span className="text-white/20">·</span>
                <span className="flex items-center gap-1.5">
                  <Globe2 className="h-4 w-4 text-blue-400" />
                  <strong className="font-semibold text-white">20+</strong> countries
                </span>
                <span className="text-white/20">·</span>
                <span className="flex items-center gap-1.5">
                  <Bitcoin className="h-4 w-4 text-fuchsia-400" />
                  <strong className="font-semibold text-white">Crypto</strong> accepted
                </span>
                <span className="text-white/20">·</span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <strong className="font-semibold text-white">Secure</strong> & verified
                </span>
              </div>

              {/* === POPULAR BRANDS STRIP === */}
              <div className="mt-5 rounded-xl bg-black/30 backdrop-blur-md border border-white/10 px-4 py-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-xs font-medium text-white/50 whitespace-nowrap">Popular brands on Cars Night</span>
                  {["Mercedes", "BMW", "Audi", "Tesla", "Porsche", "Lamborghini", "Ferrari", "Ford", "Toyota"].map((brand) => (
                    <span key={brand} className="text-sm font-semibold text-white/70 hover:text-white transition-colors cursor-default">
                      {brand}
                    </span>
                  ))}
                  <span className="text-xs text-white/40 ml-auto whitespace-nowrap">and many more →</span>
                </div>
              </div>

              {/* === FEATURE CARDS ROW === */}
              <div className="mt-5 grid grid-cols-4 gap-3">
                {[
                  { title: "Global Reach", text: "List your car and reach buyers in 20+ countries." },
                  { title: "Secure & Trusted", text: "Verified users and secure transactions." },
                  { title: "Buy or Rent", text: "Find cars for purchase or special events." },
                  { title: "Premium Brands", text: "Explore the world's most iconic vehicles." },
                ].map((card, i) => (
                  <div
                    key={i}
                    className="rounded-xl bg-black/30 backdrop-blur-md border border-white/10 p-3 hover:border-white/25 transition-all hover:bg-black/40"
                  >
                    <div className="text-sm font-semibold text-white">{card.title}</div>
                    <div className="text-xs text-white/50 mt-1 leading-relaxed">{card.text}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT: floating city cards overlay */}
            <div className="relative h-full min-h-[400px]">
              {/* City cards */}
              {[
                { city: "New York", count: "10,000+ cars", style: "top-[8%] right-[5%]", delay: "0s" },
                { city: "London", count: "8,500+ cars", style: "top-[28%] right-[30%]", delay: "0.5s" },
                { city: "Dubai", count: "12,000+ cars", style: "top-[52%] right-[8%]", delay: "1s" },
                { city: "Tokyo", count: "9,200+ cars", style: "top-[72%] right-[35%]", delay: "1.5s" },
              ].map((c, i) => (
                <div
                  key={i}
                  className={`absolute ${c.style} animate-float rounded-xl bg-black/40 backdrop-blur-md border border-white/15 px-3 py-2 shadow-2xl shadow-purple-500/10`}
                  style={{ animationDelay: c.delay }}
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-cyan-400 shrink-0" />
                    <div>
                      <div className="text-sm font-bold text-white">{c.city}</div>
                      <div className="text-[10px] text-white/50">{c.count}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================
          MOBILE CONTENT (< lg) — keeps the existing layout
          ================================================================ */}
      <div className="relative z-10 lg:hidden h-screen flex flex-col justify-center pt-20 pb-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 w-full">
          <div className="max-w-[640px] text-white">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/25 px-2.5 py-1 text-[10px] sm:text-xs font-medium whitespace-nowrap overflow-hidden">
              <Sparkles className="h-3 w-3 icon-neon shrink-0" /> {announcement}
            </div>
            <h1 className="mt-6 text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1] [text-shadow:0_2px_12px_rgba(0,0,0,0.55)]">
              Your global car
              <br />
              marketplace,
              <span className="block min-h-[1.2em] mt-1">
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
            <p className="mt-5 text-base sm:text-lg text-white max-w-[580px] leading-relaxed [text-shadow:0_1px_8px_rgba(0,0,0,0.6)]">
              Post your car ad and reach premium buyers worldwide — list in minutes, sell faster, and rent your vehicle for special events.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild size="lg" className="btn-gold shadow-lg shadow-amber-900/30">
                <Link href="/cars-for-sale">Browse cars</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="bg-white/10 backdrop-blur-md border-white/30 text-white hover:bg-white/20 hover:text-white"
              >
                <Link href="/post-ad"><Sparkles className="h-4 w-4 mr-1.5" /> Post a free ad</Link>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/85 [text-shadow:0_1px_6px_rgba(0,0,0,0.6)]">
              <span><strong className="font-semibold text-white">{(saleCount + rentCount).toLocaleString()}+</strong> listings</span>
              <span className="text-white/30">·</span>
              <span><strong className="font-semibold text-white">20+</strong> countries</span>
              <span className="text-white/30">·</span>
              <span><strong className="font-semibold text-white">Crypto</strong> accepted</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll-to-explore hint */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 flex flex-col items-center gap-1 pointer-events-none z-10">
        <span className="uppercase tracking-widest text-[10px] [text-shadow:0_1px_4px_rgba(0,0,0,0.6)]">Scroll to explore</span>
        <ChevronDown className="h-4 w-4 animate-bounce" />
      </div>
    </section>
  );
}
