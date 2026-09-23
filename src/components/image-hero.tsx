"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Typewriter } from "@/components/typewriter";
import { FallingStars } from "@/components/falling-stars";
import { Sparkles, Car, ChevronDown } from "lucide-react";

interface Props {
  tagline: string;
  announcement: string;
  saleCount: number;
  rentCount: number;
  userCount: number;
}

/**
 * ImageHero — a premium full-viewport hero with a static high-quality image
 * background (no video, no canvas, no scroll-scrubbing). The image is shown
 * at full quality with NO dark overlay/shade so the cars and sunset are
 * clearly visible. Text readability is maintained via per-element
 * text-shadow instead of a full-screen scrim.
 *
 * The content block (announcement chip, headline, typewriter, CTAs, stats)
 * sits in the lower-left area.
 *
 * The hero is exactly 100vh tall (no extra scroll zone) — the navbar stays
 * transparent over it and becomes solid when the user scrolls past it into
 * the first content section.
 */
export function ImageHero({ tagline, announcement, saleCount, rentCount, userCount }: Props) {
  return (
    <section
      className="relative w-full h-screen min-h-[600px] overflow-hidden bg-black"
      aria-label="Cinematic car showcase"
    >
      {/* Full-bleed background image at original quality. Two variants are
          rendered and toggled via CSS so the correct aspect ratio loads for
          each viewport:
          - Desktop / tablet (lg+): /hero-cars.png (1672x941 landscape) — fits
            wide screens without aggressive cropping.
          - Mobile (< lg): /hero-cars-mobile.png (941x1672 portrait) — fits
            tall phone screens without cropping the cars.
          Both use object-cover (preserves car proportions; just crops edges).
          NO dark overlay/shade. quality={100} so next/image doesn't compress. */}
      <Image
        src="/hero-cars.png"
        alt="Three luxury cars — white SUV, black BMW, and red Mustang — parked at sunset with a city skyline"
        fill
        priority
        sizes="(max-width: 1023px) 0px, 100vw"
        className="object-cover hidden lg:block"
        quality={100}
      />
      <Image
        src="/hero-cars-mobile.png"
        alt="Three luxury cars — white SUV, black BMW, and red Mustang — parked at sunset with a city skyline"
        fill
        priority
        sizes="(max-width: 1023px) 100vw, 0px"
        className="object-cover lg:hidden"
        quality={100}
      />

      {/* NO black shade / gradient overlay — the image is shown at full
          quality. Text readability is handled by per-element text-shadow
          on the headline / description / stats below. */}

      {/* Falling-star animation layer — smooth, cinematic night-sky effect.
          Positioned ABOVE the background image (z-[1]) and BELOW the content
          overlay (z-10). pointer-events:none so it never interferes with
          buttons, links, or text selection. Respects prefers-reduced-motion. */}
      <FallingStars count={80} />

      {/* Content overlay — headline, typewriter, CTAs, stats.
          Positioned in the lower-left area (justify-end + pb-24). */}
      <div className="relative z-10 h-full flex flex-col justify-end pb-24 md:pb-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl text-white">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/25 px-2.5 py-1 text-[10px] sm:text-xs md:text-sm font-medium whitespace-nowrap overflow-hidden">
              <Sparkles className="h-3 w-3 icon-neon shrink-0" /> {announcement}
            </div>
            <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] [text-shadow:0_2px_12px_rgba(0,0,0,0.55)]">
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
            <p className="mt-6 text-base sm:text-lg text-white max-w-xl [text-shadow:0_1px_8px_rgba(0,0,0,0.6)]">
              Post your car ad and reach premium buyers worldwide — list in minutes, sell faster, and rent your vehicle for special events.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
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
            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/85 [text-shadow:0_1px_6px_rgba(0,0,0,0.6)]">
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
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 flex flex-col items-center gap-1 pointer-events-none">
        <span className="uppercase tracking-widest text-[10px] [text-shadow:0_1px_4px_rgba(0,0,0,0.6)]">Scroll to explore</span>
        <ChevronDown className="h-4 w-4 animate-bounce" />
      </div>
    </section>
  );
}
