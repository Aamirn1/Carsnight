"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Typewriter } from "@/components/typewriter";
import { FallingStars } from "@/components/falling-stars";
import {
  Sparkles, Car, ChevronDown, Search, MapPin, ShieldCheck, Globe2, Bitcoin,
  ArrowRight, CalendarDays, Grid2X2, Crown,
} from "lucide-react";

interface Props {
  tagline: string;
  announcement: string;
  saleCount: number;
  rentCount: number;
  userCount: number;
}

const BRAND_GRADIENT = "linear-gradient(110deg, #00A8FF 0%, #6366F1 38%, #8B5CF6 67%, #D946EF 100%)";

export function ImageHero({ tagline, announcement, saleCount, rentCount, userCount }: Props) {
  const [searchTab, setSearchTab] = useState<"Buy" | "Rent" | "All">("Buy");

  return (
    <section
      className="relative w-full min-h-screen overflow-hidden bg-black"
      aria-label="Cinematic car showcase"
    >
      {/* === Desktop background === */}
      <Image
        src="/hero-cars-desktop.png"
        alt="Three luxury cars parked at night in a futuristic neon city"
        fill
        priority
        sizes="(max-width: 1023px) 0px, 100vw"
        className="object-cover hidden lg:block"
      />
      {/* === Mobile background (unchanged) === */}
      <Image
        src="/hero-cars-mobile.png"
        alt="Three luxury cars parked at sunset with a city skyline"
        fill
        priority
        sizes="(max-width: 1023px) 100vw, 0px"
        className="object-cover lg:hidden"
      />

      {/* === Readability overlay (desktop only) === */}
      {/* Left dark → right light so cars remain visible */}
      <div
        className="absolute inset-0 hidden lg:block pointer-events-none"
        style={{
          background: "linear-gradient(90deg, rgba(2,5,20,0.72) 0%, rgba(4,6,24,0.50) 38%, rgba(4,6,24,0.18) 70%, rgba(4,6,24,0.05) 100%)",
        }}
      />
      {/* Top + bottom subtle gradients */}
      <div className="absolute inset-0 hidden lg:block pointer-events-none bg-gradient-to-b from-black/30 via-transparent to-black/50" />

      {/* Falling stars */}
      <FallingStars count={80} />

      {/* ================================================================
          DESKTOP CONTENT (lg+)
          ================================================================ */}
      <div className="relative z-10 hidden lg:flex min-h-screen flex-col pt-20 pb-10">
        <div className="mx-auto w-full max-w-[1500px] px-[5vw] flex-1 flex flex-col justify-center gap-6">

          {/* === LEFT CONTENT + RIGHT OVERLAY === */}
          <div className="grid grid-cols-[42%_1fr] gap-8 items-start">

            {/* ====== LEFT: content block ====== */}
            <div>
              {/* Announcement pill */}
              <div
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-white/90"
                style={{
                  background: "rgba(12, 16, 45, 0.55)",
                  border: "1px solid rgba(145, 160, 255, 0.45)",
                  backdropFilter: "blur(12px)",
                }}
              >
                <Sparkles className="h-3.5 w-3.5 text-fuchsia-400 shrink-0" /> {announcement}
              </div>

              {/* Headline */}
              <h1
                className="mt-5 font-bold tracking-tight text-white"
                style={{
                  fontSize: "clamp(44px, 4.2vw, 68px)",
                  lineHeight: 1.0,
                  letterSpacing: "-0.03em",
                  textShadow: "0 2px 16px rgba(0,0,0,0.6)",
                }}
              >
                Your global car
                <br />
                marketplace,{" "}
                <span
                  className="bg-clip-text text-transparent"
                  style={{ backgroundImage: "linear-gradient(90deg, #A855F7, #7C6CF6, #38A7FF)" }}
                >
                  no limits.
                </span>
              </h1>

              {/* Paragraph */}
              <p
                className="mt-4 text-white/85 max-w-[570px]"
                style={{ fontSize: "17px", lineHeight: 1.5, textShadow: "0 1px 8px rgba(0,0,0,0.5)" }}
              >
                Post your car ad and reach premium buyers worldwide — list in minutes, sell faster, and rent your vehicle for special events.
              </p>

              {/* ====== SEARCH / FILTER CARD ====== */}
              <div
                className="mt-6 rounded-2xl overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, rgba(12, 16, 44, 0.86), rgba(34, 18, 63, 0.72))",
                  border: "1px solid rgba(130, 125, 220, 0.38)",
                  backdropFilter: "blur(18px)",
                  boxShadow: "0 16px 50px rgba(0,0,0,0.35)",
                }}
              >
                {/* Tabs */}
                <div className="flex gap-1 p-2 border-b" style={{ borderColor: "rgba(130,125,220,0.22)" }}>
                  {([
                    { key: "Buy", icon: Car },
                    { key: "Rent", icon: CalendarDays },
                    { key: "All", icon: Grid2X2 },
                  ] as const).map(({ key, icon: Icon }) => (
                    <button
                      key={key}
                      onClick={() => setSearchTab(key)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        searchTab === key
                          ? "text-white shadow-lg"
                          : "text-white/50 hover:text-white/80 hover:bg-white/5"
                      }`}
                      style={searchTab === key ? { backgroundImage: BRAND_GRADIENT } : undefined}
                    >
                      <Icon className="h-4 w-4" /> {key}
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
                      className="w-full rounded-lg bg-white/5 border border-white/15 pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/40"
                    />
                  </div>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 pointer-events-none z-10" />
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
                    className="shrink-0 text-white font-semibold rounded-[10px] transition-all hover:shadow-xl"
                    style={{
                      backgroundImage: BRAND_GRADIENT,
                      boxShadow: "0 4px 20px -4px rgba(139,92,246,0.35)",
                    }}
                  >
                    <Link href="/cars-for-sale">
                      Search cars <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </div>

              {/* ====== STATS ROW ====== */}
              <div className="mt-5 flex items-center gap-0 text-sm">
                {[
                  { icon: Car, color: "#E040FB", num: `${(saleCount + rentCount).toLocaleString()}+`, label: "listings" },
                  { icon: Globe2, color: "#00B7FF", num: "20+", label: "countries" },
                  { icon: Bitcoin, color: "#F5B82E", num: "Crypto", label: "accepted" },
                  { icon: ShieldCheck, color: "#22D3EE", num: "Secure", label: "and verified" },
                ].map((s, i) => (
                  <div key={i} className="flex items-center gap-2 px-4" style={i > 0 ? { borderLeft: "1px solid rgba(255,255,255,0.12)" } : { paddingLeft: 0 }}>
                    <s.icon className="h-5 w-5 shrink-0" style={{ color: s.color }} />
                    <div>
                      <span className="font-bold text-white">{s.num}</span>{" "}
                      <span className="text-white/60">{s.label}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* ====== POPULAR BRANDS STRIP ====== */}
              <div
                className="mt-5 rounded-xl px-4 py-3 backdrop-blur-md"
                style={{
                  background: "rgba(5, 9, 30, 0.72)",
                  borderTop: "1px solid rgba(129, 140, 248, 0.24)",
                  borderBottom: "1px solid rgba(129, 140, 248, 0.24)",
                }}
              >
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="text-xs font-medium text-white/50 whitespace-nowrap">Popular brands on Cars Night</span>
                  {["Mercedes", "BMW", "Audi", "Tesla", "Porsche", "Lamborghini", "Ferrari", "Ford", "Toyota"].map((brand) => (
                    <span
                      key={brand}
                      className="text-sm font-semibold text-white/65 hover:text-white hover:opacity-100 transition-all cursor-default"
                      style={{ opacity: 0.8 }}
                    >
                      {brand}
                    </span>
                  ))}
                  <span className="text-xs text-white/40 ml-auto whitespace-nowrap">and many more →</span>
                </div>
              </div>

              {/* ====== FEATURE CARDS ROW ====== */}
              <div className="mt-5 grid grid-cols-4 gap-3">
                {[
                  { icon: Globe2, title: "Global Reach", text: "List your car and reach buyers in 20+ countries.", grad: "linear-gradient(135deg, #7C3AED, #D946EF)" },
                  { icon: ShieldCheck, title: "Secure & Trusted", text: "Verified users and secure transactions.", grad: "linear-gradient(135deg, #7C3AED, #D946EF)" },
                  { icon: Car, title: "Buy or Rent", text: "Find cars for purchase or special events.", grad: "linear-gradient(135deg, #00A8FF, #6366F1)" },
                  { icon: Crown, title: "Premium Brands", text: "Explore the world's most iconic vehicles.", grad: "linear-gradient(135deg, #7C3AED, #D946EF)" },
                ].map((card, i) => (
                  <div
                    key={i}
                    className="rounded-2xl p-4 transition-all hover:-translate-y-0.5"
                    style={{
                      background: "linear-gradient(145deg, rgba(10, 14, 43, 0.85), rgba(22, 14, 58, 0.73))",
                      border: "1px solid rgba(139, 92, 246, 0.42)",
                      borderRadius: "16px",
                    }}
                  >
                    <div
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg mb-2"
                      style={{ background: card.grad }}
                    >
                      <card.icon className="h-4.5 w-4.5 text-white" />
                    </div>
                    <div className="text-sm font-bold text-white">{card.title}</div>
                    <div className="text-xs text-white/50 mt-1 leading-relaxed">{card.text}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ====== RIGHT: global network + city cards ====== */}
            <div className="relative h-full min-h-[500px]">

              {/* === SVG global network overlay === */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                style={{ opacity: 0.45 }}
                viewBox="0 0 500 500"
              >
                {/* Connection arcs */}
                <defs>
                  <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#00C8FF" />
                    <stop offset="50%" stopColor="#7C3AED" />
                    <stop offset="100%" stopColor="#D946EF" />
                  </linearGradient>
                  <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#00C8FF" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#00C8FF" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* Dotted arcs connecting cities */}
                <path d="M 120,80 Q 250,50 380,120" fill="none" stroke="url(#arcGrad)" strokeWidth="1.5" strokeDasharray="4 6" opacity="0.5">
                  <animate attributeName="stroke-dashoffset" from="0" to="-20" dur="8s" repeatCount="indefinite" />
                </path>
                <path d="M 380,120 Q 420,250 300,350" fill="none" stroke="url(#arcGrad)" strokeWidth="1.5" strokeDasharray="4 6" opacity="0.4">
                  <animate attributeName="stroke-dashoffset" from="0" to="-20" dur="6s" repeatCount="indefinite" />
                </path>
                <path d="M 300,350 Q 200,380 120,80" fill="none" stroke="url(#arcGrad)" strokeWidth="1.5" strokeDasharray="4 6" opacity="0.35">
                  <animate attributeName="stroke-dashoffset" from="0" to="20" dur="10s" repeatCount="indefinite" />
                </path>
                <path d="M 120,80 Q 200,200 300,350" fill="none" stroke="url(#arcGrad)" strokeWidth="1" strokeDasharray="3 8" opacity="0.25">
                  <animate attributeName="stroke-dashoffset" from="0" to="-20" dur="12s" repeatCount="indefinite" />
                </path>

                {/* Glowing network nodes */}
                {[
                  { cx: 120, cy: 80, r: 5 },
                  { cx: 380, cy: 120, r: 5 },
                  { cx: 300, cy: 350, r: 5 },
                  { cx: 200, cy: 200, r: 3 },
                ].map((node, i) => (
                  <g key={i}>
                    <circle cx={node.cx} cy={node.cy} r={node.r * 3} fill="url(#nodeGlow)" opacity="0.3" />
                    <circle cx={node.cx} cy={node.cy} r={node.r} fill="#00C8FF" opacity="0.8" />
                  </g>
                ))}
              </svg>

              {/* === Floating city cards with country flags === */}
              {[
                { city: "New York", flag: "🇺🇸", count: "10,000+ cars", pos: "top-[4%] right-[6%]", delay: "0s" },
                { city: "London", flag: "🇬🇧", count: "8,500+ cars", pos: "top-[24%] right-[28%]", delay: "0.7s" },
                { city: "Dubai", flag: "🇦🇪", count: "12,000+ cars", pos: "top-[48%] right-[4%]", delay: "1.2s" },
                { city: "Tokyo", flag: "🇯🇵", count: "9,200+ cars", pos: "top-[68%] right-[30%]", delay: "1.8s" },
              ].map((c, i) => (
                <div
                  key={i}
                  className={`absolute ${c.pos} animate-float rounded-xl px-3 py-2.5`}
                  style={{
                    background: "linear-gradient(135deg, rgba(15, 19, 53, 0.82), rgba(34, 16, 65, 0.72))",
                    border: "1px solid rgba(96, 165, 250, 0.35)",
                    boxShadow: "0 0 24px rgba(59,130,246,0.18)",
                    backdropFilter: "blur(10px)",
                    borderRadius: "14px",
                    animationDelay: c.delay,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg leading-none">{c.flag}</span>
                    <div>
                      <div className="text-sm font-bold text-white">{c.city}</div>
                      <div className="text-[10px] text-white/55">{c.count}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================
          MOBILE CONTENT (< lg) — unchanged
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
